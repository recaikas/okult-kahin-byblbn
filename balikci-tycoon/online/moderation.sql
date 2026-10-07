-- =====================================================================
--  v2.11 — Skor tablosu moderasyonu (App Store 1.2 / Google Play UGC kuralları)
--  • Oyuncu bir satırı "Bildir" ile bildirir: bt_report(). Kayıt herkese kapalı bt_reports tablosuna düşer.
--  • 3 farklı oyuncu aynı satırı bildirirse satır otomatik gizlenir (hidden = true), panelden geri açılabilir.
--  • Panel (bt_panel) bildirilen adları listeler; bt_mod() ile gizle / geri aç / sil.
--  • Sınır: oyuncu başına 24 saatte 20 bildirim, aynı satıra bir kez; tüm oyun için saatte 300.
--  Kurulum: schema.sql'den sonra SQL Editor'da çalıştır (tekrar çalıştırmak güvenli).
-- =====================================================================
alter table public.bt_scores add column if not exists hidden boolean not null default false;

create table if not exists public.bt_reports (
  id         bigint generated always as identity primary key,
  run_id     text not null check (char_length(run_id) between 6 and 40),
  reporter   text not null check (char_length(reporter) between 6 and 40),
  reason     text check (reason in ('name', 'cheat', 'other')),
  created_at timestamptz not null default now(),
  unique (run_id, reporter)
);
create index if not exists bt_reports_run on public.bt_reports (run_id);
create index if not exists bt_reports_rep on public.bt_reports (reporter, created_at desc);
alter table public.bt_reports enable row level security;
revoke all on public.bt_reports from anon, authenticated;   -- politika yok: okunamaz, doğrudan yazılamaz

create or replace function public.bt_report(p_run text, p_player text, p_reason text default 'name')
returns text
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_run is null or p_player is null or char_length(p_player) not between 6 and 40 or char_length(p_run) not between 6 and 40 then return 'bad'; end if;
  if not exists (select 1 from public.bt_scores where run_id = p_run) then return 'none'; end if;
  if exists (select 1 from public.bt_scores where run_id = p_run and player_id = p_player) then return 'self'; end if;
  if (select count(*) from public.bt_reports where reporter = p_player and created_at > now() - interval '24 hours') >= 20 then return 'limit'; end if;
  if (select count(*) from public.bt_reports where created_at > now() - interval '1 hour') >= 300 then return 'limit'; end if;
  insert into public.bt_reports (run_id, reporter, reason)
    values (p_run, p_player, case when p_reason in ('name', 'cheat', 'other') then p_reason else 'other' end)
    on conflict (run_id, reporter) do nothing;
  select count(distinct reporter) into n from public.bt_reports where run_id = p_run;
  if n >= 3 then update public.bt_scores set hidden = true where run_id = p_run; end if;
  return 'ok';
end $$;
revoke all on function public.bt_report(text, text, text) from public;
grant execute on function public.bt_report(text, text, text) to anon, authenticated;

-- skor tablosu: gizlenenler herkese görünmez (sahibi kendi satırını "me" ile görmeye devam eder)
create or replace function public.bt_board(p_run text default '')
returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'top', coalesce((
      select json_agg(t) from (
        select run_id as id, company as n, hero as h, fish as s, money as m, day as d, play_sec as p
        from public.bt_scores where not hidden order by fish desc, updated_at asc limit 20
      ) t), '[]'::json),
    'me', (
      select json_build_object(
        'rank', (select count(*) + 1 from public.bt_scores o
                 where not o.hidden and (o.fish > s.fish or (o.fish = s.fish and o.updated_at < s.updated_at))),
        'id', s.run_id, 'n', s.company, 'h', s.hero, 's', s.fish, 'm', s.money, 'd', s.day, 'p', s.play_sec)
      from public.bt_scores s where s.run_id = p_run),
    'stats', json_build_object(
      'players', (select count(distinct player_id) from public.bt_plays),
      'plays',   (select count(*) from public.bt_plays),
      'runs',    (select count(*) from public.bt_scores),
      'hours',   (select round(coalesce(sum(play_sec), 0) / 3600.0, 1) from public.bt_scores))
  );
$$;

-- panel şifre denetimi (bt_panel ile aynı kurallar: yanlış deneme sayılır, 10 dk'da 30 yanlışta kilit)
create or replace function public.bt_admin_ok(p_token text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.bt_admin_try where at > now() - interval '10 minutes') >= 30 then perform pg_sleep(0.8); return false; end if;
  if p_token is null or char_length(p_token) < 12 or not exists (
       select 1 from public.bt_admin where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')) then
    insert into public.bt_admin_try default values;
    delete from public.bt_admin_try where at < now() - interval '1 day';
    perform pg_sleep(0.8); return false;
  end if;
  return true;
end $$;
revoke all on function public.bt_admin_ok(text) from public, anon, authenticated;

-- panel: bildirilen satırı gizle ('hide'), geri aç ('show'), tamamen sil ('delete'), bildirimleri temizle ('clear')
create or replace function public.bt_mod(p_token text, p_run text, p_act text)
returns text
language plpgsql security definer set search_path = public as $$
begin
  if not public.bt_admin_ok(p_token) then return null; end if;
  if p_act = 'hide' then update public.bt_scores set hidden = true where run_id = p_run;
  elsif p_act = 'show' then update public.bt_scores set hidden = false where run_id = p_run; delete from public.bt_reports where run_id = p_run;
  elsif p_act = 'delete' then delete from public.bt_scores where run_id = p_run; delete from public.bt_reports where run_id = p_run;
  elsif p_act = 'clear' then delete from public.bt_reports where run_id = p_run;
  else return 'bad'; end if;
  return 'ok';
end $$;
revoke all on function public.bt_mod(text, text, text) from public;
grant execute on function public.bt_mod(text, text, text) to anon, authenticated;

create or replace view public.bt_raporlar with (security_invoker = true) as
  select s.run_id, s.company as isletme, s.hero as karakter, s.hidden as gizli, s.fish as balik,
         count(distinct r.reporter) as bildiren, max(r.created_at) as son,
         string_agg(distinct r.reason, ', ') as neden
  from public.bt_reports r join public.bt_scores s on s.run_id = r.run_id
  group by s.run_id, s.company, s.hero, s.hidden, s.fish
  order by max(r.created_at) desc;
revoke all on public.bt_raporlar from anon, authenticated;

create or replace function public.bt_panel(p_token text)
returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.bt_admin_ok(p_token) then return null; end if;
  return json_build_object(
    'at',        now(),
    'ozet',      (select row_to_json(o) from public.bt_test_ozet o),
    'ilerleme',  coalesce((select json_agg(i) from public.bt_ilerleme i), '[]'::json),
    'birakma',   coalesce((select json_agg(b) from public.bt_birakma b), '[]'::json),
    'oyuncular', coalesce((select json_agg(x) from (select * from public.bt_oyuncular limit 500) x), '[]'::json),
    'yolculuk',  coalesce((select json_agg(y) from (select * from public.bt_yolculuk limit 300) y), '[]'::json),
    'gorusler',  coalesce((select json_agg(g) from (select * from public.bt_gorusler limit 300) g), '[]'::json),
    'raporlar',  coalesce((select json_agg(r) from (select * from public.bt_raporlar limit 300) r), '[]'::json),
    'gunluk',    coalesce((select json_agg(d) from (
                   select date(created_at) as gun, count(*) as acilis, count(distinct player_id) as kisi
                   from public.bt_plays where created_at > now() - interval '30 days'
                   group by 1 order by 1) d), '[]'::json)
  );
end $$;
revoke all on function public.bt_panel(text) from public;
grant execute on function public.bt_panel(text) to anon, authenticated;

-- oyuncu "çevrimiçi verilerimi sil" dediğinde yaptığı ve hakkındaki bildirimler de silinir
create or replace function public.bt_forget(p_player text)
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_player is null or char_length(p_player) not between 6 and 40 then return 0; end if;
  delete from public.bt_reports where reporter = p_player or run_id in (select run_id from public.bt_scores where player_id = p_player);
  delete from public.bt_scores where player_id = p_player;
  get diagnostics n = row_count;
  delete from public.bt_plays where player_id = p_player;
  delete from public.bt_feedback where player_id = p_player;
  delete from public.bt_events where player_id = p_player;
  return n;
end $$;
revoke all on function public.bt_forget(text) from public;
grant execute on function public.bt_forget(text) to anon, authenticated;

-- saklama süresi: bildirimler de 24 ay
create or replace function public.bt_cleanup() returns integer
language plpgsql security definer set search_path = public as $$
declare n1 integer; n2 integer;
begin
  delete from public.bt_plays where created_at < now() - interval '24 months'; get diagnostics n1 = row_count;
  delete from public.bt_feedback where created_at < now() - interval '24 months'; get diagnostics n2 = row_count;
  delete from public.bt_events where created_at < now() - interval '24 months';
  delete from public.bt_reports where created_at < now() - interval '24 months';
  return n1 + n2;
end $$;
revoke all on function public.bt_cleanup() from public, anon, authenticated;

-- aylık otomatik temizlik (pg_cron): her ayın 1'i 03:17 UTC
create extension if not exists pg_cron;
select cron.unschedule('bt-cleanup') where exists (select 1 from cron.job where jobname = 'bt-cleanup');
select cron.schedule('bt-cleanup', '17 3 1 * *', 'select public.bt_cleanup()');
