-- =====================================================================
--  Balıkçı Tycoon — herkese açık skor tablosu + oyuncu sayacı (Supabase)
--  Kurulum: Supabase panel › SQL Editor › bu dosyanın tamamını yapıştır › Run
--  Tekrar çalıştırmak güvenlidir (idempotent).
--
--  Güvenlik modeli
--  • Tarayıcıdaki "anon" anahtarı herkese açıktır; bu yüzden tablolara doğrudan
--    yazma izni YOKTUR. Yazma yalnızca aşağıdaki fonksiyonlardan geçer.
--  • Fonksiyonlar girdiyi doğrular: isim uzunluğu/karakterleri, skorun oyun
--    süresine göre makul olması, skorun geriye gitmemesi, kısa aralıkla spam.
--  • Skor tablosu herkese okunur. Oyun kayıtları (bt_plays) okunamaz; yalnız
--    toplam sayılar bt_board() ile döner.
--  • Oyuncu görüşleri (bt_feedback) hiç okunamaz; yalnız bt_feedback() ile yazılır,
--    sen Supabase panelinden (bt_gorusler görünümü) okursun.
-- =====================================================================

create table if not exists public.bt_scores (
  run_id     text primary key check (char_length(run_id) between 6 and 40),
  player_id  text not null     check (char_length(player_id) between 6 and 40),
  company    text not null     check (char_length(company) between 2 and 24),
  fish       integer not null default 0 check (fish >= 0),
  money      bigint  not null default 0 check (money >= 0),
  day        integer not null default 1 check (day >= 1),
  play_sec   integer not null default 0 check (play_sec >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bt_scores_rank on public.bt_scores (fish desc, updated_at asc);
alter table public.bt_scores add column if not exists hero text;   -- v1.0: oyuncunun karakter adı

create table if not exists public.bt_plays (
  id         bigint generated always as identity primary key,
  player_id  text not null check (char_length(player_id) between 6 and 40),
  run_id     text,
  lang       text,
  created_at timestamptz not null default now()
);
create index if not exists bt_plays_player on public.bt_plays (player_id, created_at desc);

alter table public.bt_scores enable row level security;
alter table public.bt_plays  enable row level security;

drop policy if exists bt_scores_read on public.bt_scores;
create policy bt_scores_read on public.bt_scores for select using (true);
-- bt_plays için hiç politika yok: anon okuyamaz, yazamaz.

revoke all on public.bt_scores from anon, authenticated;
revoke all on public.bt_plays  from anon, authenticated;
grant select (run_id, company, hero, fish, money, day, play_sec, updated_at) on public.bt_scores to anon, authenticated;

-- ---------------------------------------------------------------------
--  Skor gönder (oyun her ~30 sn'de, gün sonunda ve kaydet-çık'ta çağırır)
-- ---------------------------------------------------------------------
drop function if exists public.bt_submit(text, text, text, integer, bigint, integer, integer);
create or replace function public.bt_submit(
  p_run text, p_player text, p_company text,
  p_fish integer, p_money bigint, p_day integer, p_play integer, p_hero text default ''
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_hero text;
  v_old  public.bt_scores%rowtype;
begin
  if p_run is null or char_length(p_run) not between 6 and 40
     or p_player is null or char_length(p_player) not between 6 and 40 then
    return 'bad_id';
  end if;
  v_name := btrim(regexp_replace(regexp_replace(regexp_replace(coalesce(p_company, ''), '<[^>]*>', '', 'g'), '[<>`\\{}\[\][:cntrl:]]', '', 'g'), '\s+', ' ', 'g'));
  if char_length(v_name) not between 2 and 24 then return 'bad_name'; end if;
  v_hero := left(btrim(regexp_replace(regexp_replace(coalesce(p_hero, ''), '<[^>]*>', '', 'g'), '[<>`\\{}\[\][:cntrl:]]', '', 'g')), 16);
  if p_fish < 0 or p_money < 0 or p_day < 1 or p_play < 0 then return 'bad_value'; end if;
  -- makullük: en hızlı düzende bile saniyede ~6 balığı geçmek mümkün değil
  if p_fish > p_play * 12 + 60 then return 'implausible'; end if;
  if p_day > p_play / 60 + 2 then return 'implausible'; end if;

  select * into v_old from public.bt_scores where run_id = p_run;
  if found then
    if v_old.player_id <> p_player then return 'not_owner'; end if;
    if v_old.updated_at > now() - interval '8 seconds' then return 'too_fast'; end if;
    update public.bt_scores set
      company    = v_name,
      hero       = nullif(v_hero, ''),
      fish       = greatest(fish, p_fish),
      money      = greatest(money, p_money),
      day        = greatest(day, p_day),
      play_sec   = greatest(play_sec, p_play),
      updated_at = now()
    where run_id = p_run;
  else
    if (select count(*) from public.bt_scores
        where player_id = p_player and created_at > now() - interval '1 hour') >= 20 then
      return 'too_many';
    end if;
    insert into public.bt_scores (run_id, player_id, company, hero, fish, money, day, play_sec)
    values (p_run, p_player, v_name, nullif(v_hero, ''), p_fish, p_money, p_day, p_play);
  end if;
  return 'ok';
end $$;

-- ---------------------------------------------------------------------
--  Oyun açılışı sayacı: "kaç kişi, kaç kez oynadı"
-- ---------------------------------------------------------------------
create or replace function public.bt_play(p_player text, p_run text, p_lang text)
returns text
language plpgsql security definer set search_path = public as $$
begin
  if p_player is null or char_length(p_player) not between 6 and 40 then return 'bad_id'; end if;
  if exists (select 1 from public.bt_plays
             where player_id = p_player and created_at > now() - interval '2 minutes') then
    return 'dup';
  end if;
  insert into public.bt_plays (player_id, run_id, lang)
  values (p_player, left(p_run, 40), left(p_lang, 5));
  return 'ok';
end $$;

-- ---------------------------------------------------------------------
--  Tablo + kendi sıran + genel sayılar tek çağrıda
-- ---------------------------------------------------------------------
create or replace function public.bt_board(p_run text default '')
returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'top', coalesce((
      select json_agg(t) from (
        select run_id as id, company as n, hero as h, fish as s, money as m, day as d, play_sec as p
        from public.bt_scores order by fish desc, updated_at asc limit 20
      ) t), '[]'::json),
    'me', (
      select json_build_object(
        'rank', (select count(*) + 1 from public.bt_scores o
                 where o.fish > s.fish or (o.fish = s.fish and o.updated_at < s.updated_at)),
        'id', s.run_id, 'n', s.company, 'h', s.hero, 's', s.fish, 'm', s.money, 'd', s.day, 'p', s.play_sec)
      from public.bt_scores s where s.run_id = p_run),
    'stats', json_build_object(
      'players', (select count(distinct player_id) from public.bt_plays),
      'plays',   (select count(*) from public.bt_plays),
      'runs',    (select count(*) from public.bt_scores),
      'hours',   (select round(coalesce(sum(play_sec), 0) / 3600.0, 1) from public.bt_scores))
  );
$$;

revoke all on function public.bt_submit(text, text, text, integer, bigint, integer, integer, text) from public;
revoke all on function public.bt_play(text, text, text) from public;
revoke all on function public.bt_board(text) from public;
grant execute on function public.bt_submit(text, text, text, integer, bigint, integer, integer, text) to anon, authenticated;
grant execute on function public.bt_play(text, text, text) to anon, authenticated;
grant execute on function public.bt_board(text) to anon, authenticated;

-- ---------------------------------------------------------------------
--  Oyuncu görüşü (Ayarlar / Duraklatma menüsü › Görüşünü yaz)
--  • 1–5 yıldız (zorunlu), isteğe bağlı konu (bug / idea / love), en çok 500 karakter metin.
--  • Herkese açık DEĞİLDİR: anon okuyamaz, tabloya doğrudan yazamaz; yalnız bt_feedback() yazar.
--  • Sınır: oyuncu başına 60 sn'de 1, 24 saatte 10; tüm oyun için saatte en çok 300 (sahte kimlikle sel önlemi).
--  • Yıldız puanı yalnız sana bilgi içindir; mağaza değerlendirme penceresi bu puana göre AÇILMAZ.
-- ---------------------------------------------------------------------
create table if not exists public.bt_feedback (
  id         bigint generated always as identity primary key,
  player_id  text not null     check (char_length(player_id) between 6 and 40),
  run_id     text              check (run_id is null or char_length(run_id) <= 40),
  stars      smallint not null check (stars between 1 and 5),
  cat        text              check (cat is null or cat in ('bug', 'idea', 'love')),
  body       text not null default '' check (char_length(body) <= 500),
  lang       text              check (lang is null or char_length(lang) <= 5),
  ver        text              check (ver is null or char_length(ver) <= 16),
  day        integer           check (day is null or day >= 1),
  created_at timestamptz not null default now()
);
create index if not exists bt_feedback_player on public.bt_feedback (player_id, created_at desc);
create index if not exists bt_feedback_time   on public.bt_feedback (created_at desc);
alter table public.bt_feedback enable row level security;
-- bt_feedback için hiç politika yok: anon okuyamaz, yazamaz.
revoke all on public.bt_feedback from anon, authenticated;

create or replace function public.bt_feedback(
  p_player text, p_run text, p_stars integer, p_cat text, p_text text,
  p_lang text, p_ver text, p_day integer
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_cat  text;
  v_text text;
begin
  if p_player is null or char_length(p_player) not between 6 and 40 then return 'bad_id'; end if;
  if p_stars is null or p_stars not between 1 and 5 then return 'bad_stars'; end if;
  v_cat := nullif(btrim(coalesce(p_cat, '')), '');
  if v_cat is not null and v_cat not in ('bug', 'idea', 'love') then return 'bad_cat'; end if;
  if char_length(coalesce(p_text, '')) > 500 then return 'too_long'; end if;
  -- satır sonu kalır; diğer kontrol karakterleri atılır
  v_text := btrim(regexp_replace(replace(coalesce(p_text, ''), E'\r\n', E'\n'), '[\x01-\x09\x0b-\x1f\x7f]', ' ', 'g'));
  -- aynı oyuncudan eşzamanlı iki istek sınırı birlikte aşmasın
  perform pg_advisory_xact_lock(hashtext('bt_feedback:' || p_player));
  if exists (select 1 from public.bt_feedback
             where player_id = p_player and created_at > now() - interval '60 seconds') then
    return 'too_fast';
  end if;
  if (select count(*) from public.bt_feedback
      where player_id = p_player and created_at > now() - interval '1 day') >= 10 then
    return 'too_many';
  end if;
  if (select count(*) from public.bt_feedback where created_at > now() - interval '1 hour') >= 300 then
    return 'busy';
  end if;
  insert into public.bt_feedback (player_id, run_id, stars, cat, body, lang, ver, day)
  values (p_player, nullif(left(coalesce(p_run, ''), 40), ''), p_stars, v_cat, v_text,
          nullif(left(coalesce(p_lang, ''), 5), ''), nullif(left(coalesce(p_ver, ''), 16), ''),
          case when p_day between 1 and 1000000 then p_day end);
  return 'ok';
end $$;
revoke all on function public.bt_feedback(text, text, integer, text, text, text, text, integer) from public;
grant execute on function public.bt_feedback(text, text, integer, text, text, text, text, integer) to anon, authenticated;

-- ---------------------------------------------------------------------
--  Mağaza gizlilik şartı: oyuncu kendi verisini siler (Ayarlar › Çevrimiçi verilerimi sil)
--  Skor satırları, açılış sayımları ve gönderdiği görüşler birlikte silinir.
--  Anonim oyuncu kimliği herkese açık değildir; yalnız o cihaz bilir. Döner: silinen skor satırı sayısı.
-- ---------------------------------------------------------------------
create or replace function public.bt_forget(p_player text)
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_player is null or char_length(p_player) not between 6 and 40 then return 0; end if;
  delete from public.bt_scores where player_id = p_player;
  get diagnostics n = row_count;
  delete from public.bt_plays where player_id = p_player;
  delete from public.bt_feedback where player_id = p_player;
  return n;
end $$;
revoke all on function public.bt_forget(text) from public;
grant execute on function public.bt_forget(text) to anon, authenticated;

-- ---------------------------------------------------------------------
--  YÖNETİCİ GÖRÜNÜMÜ (yalnız sen: Supabase panel › Table Editor › bt_oyuncular)
--  Kim, hangi isimle, kaç kez, toplam kaç saat oynadı, en son ne zaman?
--  anon'a açık DEĞİL — herkese açık sitede görünmez.
-- ---------------------------------------------------------------------
create or replace view public.bt_oyuncular with (security_invoker = true) as
select
  s.player_id                                              as oyuncu,
  string_agg(distinct s.hero, ', ')                        as karakter,
  string_agg(distinct s.company, ', ')                     as isletme,
  count(distinct s.run_id)                                 as oyun_sayisi,
  round(sum(s.play_sec) / 3600.0, 2)                       as toplam_saat,
  max(s.fish)                                              as en_iyi_balik,
  max(s.day)                                               as en_uzun_gun,
  (select count(*) from public.bt_plays p where p.player_id = s.player_id) as acilis,
  max(s.updated_at)                                        as son_gorulme
from public.bt_scores s
group by s.player_id
order by son_gorulme desc;
revoke all on public.bt_oyuncular from anon, authenticated;

-- ---------------------------------------------------------------------
--  YÖNETİCİ GÖRÜNÜMÜ (yalnız sen: Supabase panel › Table Editor › bt_gorusler)
--  Oyuncuların yazdığı görüşler, en yenisi üstte. anon'a açık DEĞİL.
-- ---------------------------------------------------------------------
create or replace view public.bt_gorusler with (security_invoker = true) as
select
  f.created_at                                             as zaman,
  f.stars                                                  as yildiz,
  case f.cat when 'bug' then 'Hata' when 'idea' then 'Öneri' when 'love' then 'Beğendim' else '' end as konu,
  f.body                                                   as metin,
  f.lang                                                   as dil,
  f.ver                                                    as surum,
  f.day                                                    as gun,
  f.player_id                                              as oyuncu
from public.bt_feedback f
order by f.created_at desc;
revoke all on public.bt_gorusler from anon, authenticated;

-- ---------------------------------------------------------------------
--  Senin için hazır sorgular (SQL Editor'da çalıştır):
--    select * from bt_oyuncular;                          -- kim ne kadar oynadı
--    select * from bt_board('');                          -- tablo + sayılar
--    select date(created_at) gun, count(*) oyun, count(distinct player_id) kisi
--      from bt_plays group by 1 order by 1 desc;          -- günlük oyuncu sayısı
--    delete from bt_scores where run_id = '...';          -- uygunsuz isim silme
--    select * from bt_gorusler limit 50;                  -- son görüşler
--    select stars, count(*) from bt_feedback group by 1 order by 1;          -- yıldız dağılımı
--    select date(created_at) gun, count(*), round(avg(stars), 2) ort
--      from bt_feedback group by 1 order by 1 desc;       -- günlük görüş sayısı ve ortalama
-- ---------------------------------------------------------------------
