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
grant select (run_id, company, fish, money, day, updated_at) on public.bt_scores to anon, authenticated;

-- ---------------------------------------------------------------------
--  Skor gönder (oyun her ~30 sn'de, gün sonunda ve kaydet-çık'ta çağırır)
-- ---------------------------------------------------------------------
create or replace function public.bt_submit(
  p_run text, p_player text, p_company text,
  p_fish integer, p_money bigint, p_day integer, p_play integer
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_old  public.bt_scores%rowtype;
begin
  if p_run is null or char_length(p_run) not between 6 and 40
     or p_player is null or char_length(p_player) not between 6 and 40 then
    return 'bad_id';
  end if;
  v_name := btrim(regexp_replace(regexp_replace(regexp_replace(coalesce(p_company, ''), '<[^>]*>', '', 'g'), '[<>`\\{}\[\][:cntrl:]]', '', 'g'), '\s+', ' ', 'g'));
  if char_length(v_name) not between 2 and 24 then return 'bad_name'; end if;
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
    insert into public.bt_scores (run_id, player_id, company, fish, money, day, play_sec)
    values (p_run, p_player, v_name, p_fish, p_money, p_day, p_play);
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
        select run_id as id, company as n, fish as s, money as m, day as d
        from public.bt_scores order by fish desc, updated_at asc limit 20
      ) t), '[]'::json),
    'me', (
      select json_build_object(
        'rank', (select count(*) + 1 from public.bt_scores o
                 where o.fish > s.fish or (o.fish = s.fish and o.updated_at < s.updated_at)),
        'id', s.run_id, 'n', s.company, 's', s.fish, 'm', s.money, 'd', s.day)
      from public.bt_scores s where s.run_id = p_run),
    'stats', json_build_object(
      'players', (select count(distinct player_id) from public.bt_plays),
      'plays',   (select count(*) from public.bt_plays),
      'runs',    (select count(*) from public.bt_scores))
  );
$$;

revoke all on function public.bt_submit(text, text, text, integer, bigint, integer, integer) from public;
revoke all on function public.bt_play(text, text, text) from public;
revoke all on function public.bt_board(text) from public;
grant execute on function public.bt_submit(text, text, text, integer, bigint, integer, integer) to anon, authenticated;
grant execute on function public.bt_play(text, text, text) to anon, authenticated;
grant execute on function public.bt_board(text) to anon, authenticated;

-- ---------------------------------------------------------------------
--  Senin için hazır sorgular (SQL Editor'da çalıştır):
--    select * from bt_board('');                          -- tablo + sayılar
--    select date(created_at) gun, count(*) oyun, count(distinct player_id) kisi
--      from bt_plays group by 1 order by 1 desc;          -- günlük oyuncu sayısı
--    delete from bt_scores where run_id = '...';          -- uygunsuz isim silme
-- ---------------------------------------------------------------------
