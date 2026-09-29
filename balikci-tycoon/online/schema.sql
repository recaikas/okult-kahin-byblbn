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
-- herkese açık tabloda kaba/nefret içerikli ad olmasın (istemcideki nameBad ile AYNI kurallar; istemci atlatılırsa diye)
-- v1.9.7: kelime sınırı gözetilir — tam kelime (BAD_EXACT), kelime başı (BAD_START), her yerde (BAD_ANY),
-- aralıklı yazım ("o r o s p u") ve iki kelimeye bölünmüş ifade. "Ata Mina", "Nigeria", "Shiitake", "Nazik", "Işıkım" geçer.
create or replace function public.bt_bad_word(w text, spaced boolean, any_only boolean default false) returns boolean
language sql immutable set search_path = public as $$
  select case when any_only then
    exists (select 1 from unnest(array['orospu','aminako','gotveren','pezevenk','serefsiz','fuck','bitch','whore','ashole','hitler','fagot']) r where strpos(w, r) > 0)
  else
    (w = any (array['amk','aq','sik','sikt','ibne','pust','yarak','cunt','dick','cock','fag','slut','isis','shit','shits','shity',
                    'bulshit','niger','nigers','niga','nigas','nazi','nazis','pusy','amina','amcik']) and (w <> 'amina' or spaced))
    or exists (select 1 from unnest(array['orospu','sikis','sikik','sikim','sikeyim','sikerim','siktir','amcik','aminako','gotveren','pezevenk','kahpe',
                    'kaltak','yavsak','serefsiz','fuck','bitch','whore','ashole','hitler','fagot','nigers','nazis']) r where left(w, length(r)) = r)
    or exists (select 1 from unnest(array['orospu','aminako','gotveren','pezevenk','serefsiz','fuck','bitch','whore','ashole','hitler','fagot']) r where strpos(w, r) > 0)
  end
$$;
revoke all on function public.bt_bad_word(text, boolean, boolean) from public, anon, authenticated;

create or replace function public.bt_bad_name(p text) returns boolean
language plpgsql immutable set search_path = public as $$
declare
  n text := replace(translate(lower(coalesce(p, '')), 'çğıöşüâîû0134578@$!|', 'cgiosuaiuoieastbasii'), chr(775), '');   -- lower('İ') = i + U+0307
  w text[];
  i int; k int; q int; l int; run text;
begin
  -- ö/ü'lü Türkçe yazım katlamadan önce: "göt" engelli, İngilizce "Got Fish Co" serbest
  if exists (select 1 from regexp_split_to_table(lower(coalesce(p, '')), '[^a-zçğıöşü]+') x
             where x = any (array['göt','götü','götün','göte','götler','götlek','götoş'])) then return true; end if;
  w := array(select regexp_replace(x, '(.)\1+', '\1', 'g') from regexp_split_to_table(n, '[^a-z]+') x where x <> '');
  for i in 1 .. coalesce(array_length(w, 1), 0) loop
    if public.bt_bad_word(w[i], false) then return true; end if;
    if i < array_length(w, 1) and public.bt_bad_word(w[i] || w[i + 1], false, true) then return true; end if;
  end loop;
  i := 1;
  while i <= coalesce(array_length(w, 1), 0) loop                -- aralıklı yazım: o r o s p u
    if length(w[i]) = 1 then
      run := ''; k := i;
      while k <= array_length(w, 1) and length(w[k]) = 1 loop run := run || w[k]; k := k + 1; end loop;
      if length(run) >= 3 then
        run := regexp_replace(run, '(.)\1+', '\1', 'g');
        for q in 1 .. length(run) loop
          for l in 2 .. length(run) - q + 1 loop
            if public.bt_bad_word(substr(run, q, l), true) then return true; end if;
          end loop;
        end loop;
      end if;
      i := k;
    else
      i := i + 1;
    end if;
  end loop;
  return false;
end $$;
revoke all on function public.bt_bad_name(text) from public, anon, authenticated;

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
  if public.bt_bad_name(v_name) or public.bt_bad_name(v_hero) then return 'bad_name'; end if;
  if p_fish < 0 or p_money < 0 or p_day < 1 or p_play < 0 then return 'bad_value'; end if;
  -- makullük: en hızlı düzende bile saniyede ~6 balığı geçmek mümkün değil
  if p_fish > p_play * 12 + 60 then return 'implausible'; end if;
  if p_day > p_play / 60 + 2 then return 'implausible'; end if;

  select * into v_old from public.bt_scores where run_id = p_run;
  if found then
    if v_old.player_id <> p_player then return 'not_owner'; end if;
    if v_old.updated_at > now() - interval '8 seconds' then return 'too_fast'; end if;
    -- v1.9.7: oyun süresini istemci söylüyor; gerçek zamandan hızlı artamaz (sunucu saati), balık da o sürede
    -- oynanabilecek kadar artar. Sahte play_sec ile tabloya istenen sayı yazılamaz.
    if p_play > v_old.play_sec + extract(epoch from (now() - v_old.updated_at)) * 1.1 + 60 then return 'implausible'; end if;
    if p_fish > v_old.fish + greatest(0, p_play - v_old.play_sec) * 12 + 60 then return 'implausible'; end if;
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
    if p_play > 21600 then return 'implausible'; end if;        -- v1.9.7: yeni oyunun ilk gönderimi en çok 6 saatlik
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
  delete from public.bt_events where player_id = p_player;
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
--  v1.9 İLERLEME OLAYLARI: oyuncular nereye kadar geldi, nerede bıraktı?
--  Her oyunda (run) her olay bir kez: eğitim adımları (tut1..tut6), gün (gun2..gun30),
--  bölge (bolge2, bolge3), itibar seviyesi (sv2..), müdür, bölüm sonu (bolum1), yeni oyun (oyun).
-- ---------------------------------------------------------------------
create table if not exists public.bt_events (
  id         bigint generated always as identity primary key,
  player_id  text not null check (char_length(player_id) between 6 and 40),
  run_id     text          check (run_id is null or char_length(run_id) <= 40),
  ev         text not null check (ev ~ '^[a-z0-9_]{2,24}$'),
  day        integer       check (day is null or day >= 1),
  play_sec   integer       check (play_sec is null or play_sec >= 0),
  created_at timestamptz not null default now()
);
create unique index if not exists bt_events_run_ev on public.bt_events (run_id, ev);
create index if not exists bt_events_player on public.bt_events (player_id, created_at);
alter table public.bt_events enable row level security;
-- bt_events için politika yok: anon okuyamaz, yazamaz; yalnız bt_event fonksiyonu yazar.
revoke all on public.bt_events from anon, authenticated;   -- Supabase'in varsayılan tablo izinleri de kalksın

create or replace function public.bt_event(p_player text, p_run text, p_ev text, p_day integer, p_play integer)
returns text
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_player is null or char_length(p_player) not between 6 and 40 then return 'bad_id'; end if;
  if p_run is not null and char_length(p_run) > 40 then return 'bad_id'; end if;
  if p_ev is null or p_ev !~ '^[a-z0-9_]{2,24}$' then return 'bad_ev'; end if;
  select count(*) into n from public.bt_events where player_id = p_player and created_at > now() - interval '1 day';
  if n >= 300 then return 'too_many'; end if;
  insert into public.bt_events (player_id, run_id, ev, day, play_sec)
  values (p_player, nullif(p_run, ''), p_ev, greatest(1, least(coalesce(p_day, 1), 100000)),
          greatest(0, least(coalesce(p_play, 0), 100000000)))
  on conflict (run_id, ev) do nothing;
  return 'ok';
end $$;
revoke all on function public.bt_event(text, text, text, integer, integer) from public;
grant execute on function public.bt_event(text, text, text, integer, integer) to anon, authenticated;

-- ---------------------------------------------------------------------
--  YÖNETİCİ GÖRÜNÜMLERİ (yalnız sen)
--    select * from bt_ilerleme;   -- adım adım: kaç oyuncu buraya geldi, yüzde kaçı, ortalama kaçıncı dakikada
--    select * from bt_birakma;    -- 24 saattir açılmamış oyunlar hangi günde kaldı
--    select * from bt_yolculuk;   -- oyuncu oyuncu: sırayla neler yaptı
-- ---------------------------------------------------------------------
create or replace view public.bt_ilerleme with (security_invoker = true) as
with adim(ev, sira, ad) as (values
  ('oyun', 1, 'Yeni oyun başladı'), ('tut1', 2, 'Ağda balık birikti'), ('tut2', 3, 'Balıkları sırtladı'),
  ('tut3', 4, 'Kesim masasına bıraktı'), ('tut4', 5, 'İlk balık tezgâhta'), ('tut5', 6, 'İlk para kasada'),
  ('tut6', 7, 'İlk yükseltmeyi aldı'), ('gun2', 8, '2. güne geçti'), ('sv2', 9, 'İtibar seviye 2'),
  ('gun3', 10, '3. güne geçti'), ('sv3', 11, 'İtibar seviye 3'), ('bolge2', 12, '2. bölgeyi açtı'),
  ('gun5', 13, '5. güne geçti'), ('mudur', 14, 'İlk müdürü aldı'), ('gun7', 15, '7. güne geçti'),
  ('bolge3', 16, '3. bölgeyi açtı'), ('gun10', 17, '10. güne geçti'), ('bolum1', 18, 'Bölüm 1 bitti'),
  ('gun14', 19, '14. güne geçti'), ('gun21', 20, '21. güne geçti'), ('gun30', 21, '30. güne geçti')
), bas as (select count(distinct player_id) as n from public.bt_events where ev = 'oyun')
select a.sira, a.ad as adim,
       count(distinct e.player_id)                                              as oyuncu,
       round(100.0 * count(distinct e.player_id) / nullif((select n from bas), 0)) as yuzde,
       round(avg(e.play_sec) / 60.0, 1)                                         as ort_dakika
from adim a left join public.bt_events e on e.ev = a.ev
group by a.sira, a.ad order by a.sira;
revoke all on public.bt_ilerleme from anon, authenticated;

create or replace view public.bt_birakma with (security_invoker = true) as
select s.day as son_gun, count(*) as oyun, round(avg(s.play_sec) / 60.0, 1) as ort_dakika,
       string_agg(s.company, ', ' order by s.updated_at desc) as isletmeler
from public.bt_scores s
where s.updated_at < now() - interval '24 hours'
group by s.day order by s.day;
revoke all on public.bt_birakma from anon, authenticated;

create or replace view public.bt_yolculuk with (security_invoker = true) as
select e.player_id as oyuncu,
       (select string_agg(distinct s.company, ', ') from public.bt_scores s where s.run_id = e.run_id) as isletme,
       count(*) as adim_sayisi,
       string_agg(e.ev || ' (' || round(e.play_sec / 60.0, 1) || ' dk)', ' → ' order by e.play_sec, e.id) as yol,
       max(e.created_at) as son_olay
from public.bt_events e
group by e.player_id, e.run_id
order by son_olay desc;
revoke all on public.bt_yolculuk from anon, authenticated;

-- ---------------------------------------------------------------------
--  TEST ÖZETİ (yalnız sen): link ile test ederken tek satırda durum.
--    select * from bt_test_ozet;
--  kac_kisi: en az bir kez açan farklı oyuncu · son_24s / son_7g: o sürede oyunu açan oyuncu
--  ort_dk / medyan_dk: oyuncu başına toplam oyun süresi (dakika) · 10dk_ustu / 60dk_ustu: o kadar oynayan kişi
--  geri_donen: en az 2 farklı günde açan kişi · gorus / ort_yildiz: gelen görüşler
-- ---------------------------------------------------------------------
create or replace view public.bt_test_ozet with (security_invoker = true) as
with oy as (
  select player_id from public.bt_plays union select player_id from public.bt_scores
), sure as (
  select player_id, sum(play_sec) / 60.0 as dk from public.bt_scores group by player_id
), gun as (
  select player_id, count(distinct date(created_at)) as g from public.bt_plays group by player_id
)
select
  (select count(*) from oy)                                                                    as kac_kisi,
  (select count(distinct player_id) from public.bt_plays where created_at > now() - interval '24 hours') as son_24s,
  (select count(distinct player_id) from public.bt_plays where created_at > now() - interval '7 days')   as son_7g,
  (select round(avg(dk), 1) from sure)                                                          as ort_dk,
  (select round((percentile_cont(0.5) within group (order by dk))::numeric, 1) from sure)       as medyan_dk,
  (select count(*) from sure where dk >= 10)                                                    as "10dk_ustu",
  (select count(*) from sure where dk >= 60)                                                    as "60dk_ustu",
  (select count(*) from gun where g >= 2)                                                       as geri_donen,
  (select max(day) from public.bt_scores)                                                       as en_uzun_gun,
  (select count(*) from public.bt_feedback)                                                     as gorus,
  (select round(avg(stars), 2) from public.bt_feedback)                                         as ort_yildiz;
revoke all on public.bt_test_ozet from anon, authenticated;

-- ---------------------------------------------------------------------
--  YÖNETİM PANELİ (panel.html): tüm yönetici görünümlerini tek çağrıda verir.
--  Yalnız doğru panel şifresiyle çalışır; şifrenin kendisi değil SHA-256 özeti saklanır.
--  Şifre koymak / değiştirmek (SQL Editor):
--    delete from bt_admin; insert into bt_admin(token_hash) values (encode(sha256(convert_to('YENI-SIFRE','UTF8')),'hex'));
-- ---------------------------------------------------------------------
create table if not exists public.bt_admin (token_hash text primary key);
alter table public.bt_admin enable row level security;
-- politika yok: anon okuyamaz, yazamaz.
revoke all on public.bt_admin from anon, authenticated;

-- v1.9.7: yanlış denemeler sayılır; son 10 dakikada 30 yanlış deneme varsa panel (doğru şifreye de) 10 dk kapanır.
create table if not exists public.bt_admin_try (at timestamptz not null default now());
alter table public.bt_admin_try enable row level security;
revoke all on public.bt_admin_try from anon, authenticated;

create or replace function public.bt_panel(p_token text)
returns json
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.bt_admin_try where at > now() - interval '10 minutes') >= 30 then
    perform pg_sleep(0.8);
    return null;
  end if;
  if p_token is null or char_length(p_token) < 12 or not exists (
       select 1 from public.bt_admin where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')) then
    insert into public.bt_admin_try default values;
    delete from public.bt_admin_try where at < now() - interval '1 day';
    perform pg_sleep(0.8);                       -- şifre denemelerini yavaşlat
    return null;
  end if;
  return json_build_object(
    'at',        now(),
    'ozet',      (select row_to_json(o) from public.bt_test_ozet o),
    'ilerleme',  coalesce((select json_agg(i) from public.bt_ilerleme i), '[]'::json),
    'birakma',   coalesce((select json_agg(b) from public.bt_birakma b), '[]'::json),
    'oyuncular', coalesce((select json_agg(x) from (select * from public.bt_oyuncular limit 500) x), '[]'::json),
    'yolculuk',  coalesce((select json_agg(y) from (select * from public.bt_yolculuk limit 300) y), '[]'::json),
    'gorusler',  coalesce((select json_agg(g) from (select * from public.bt_gorusler limit 300) g), '[]'::json),
    'gunluk',    coalesce((select json_agg(d) from (
                   select date(created_at) as gun, count(*) as acilis, count(distinct player_id) as kisi
                   from public.bt_plays where created_at > now() - interval '30 days'
                   group by 1 order by 1) d), '[]'::json)
  );
end $$;
revoke all on function public.bt_panel(text) from public;
grant execute on function public.bt_panel(text) to anon, authenticated;

-- ---------------------------------------------------------------------
--  KVKK saklama süresi (gizlilik politikası: açılış sayımları ve görüşler en çok 24 ay).
--  Ayda bir SQL Editor'da çalıştır:  select bt_cleanup();
--  Otomatik yapmak için (Supabase › Database › Extensions › pg_cron açıkken):
--    select cron.schedule('bt-cleanup', '17 3 1 * *', 'select public.bt_cleanup()');
-- ---------------------------------------------------------------------
create or replace function public.bt_cleanup() returns integer
language plpgsql security definer set search_path = public as $$
declare n1 integer; n2 integer;
begin
  delete from public.bt_plays where created_at < now() - interval '24 months'; get diagnostics n1 = row_count;
  delete from public.bt_feedback where created_at < now() - interval '24 months'; get diagnostics n2 = row_count;
  delete from public.bt_events where created_at < now() - interval '24 months';
  return n1 + n2;
end $$;
revoke all on function public.bt_cleanup() from public, anon, authenticated;

-- ---------------------------------------------------------------------
--  Senin için hazır sorgular (SQL Editor'da çalıştır):
--    select * from bt_test_ozet;                          -- test özeti: kaç kişi, kaç dakika, geri dönen
--    select * from bt_ilerleme;                           -- adım adım kaç oyuncu nereye geldi
--    select * from bt_birakma;                            -- oyunlar hangi günde bırakıldı
--    select * from bt_yolculuk;                           -- oyuncu oyuncu yaptıkları
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
