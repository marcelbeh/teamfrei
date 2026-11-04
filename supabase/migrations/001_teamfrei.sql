-- TeamFrei: shared planning room with anonymous Supabase identities.
-- Enable anonymous sign-ins and Realtime for public.teamfrei_state in Supabase.
create extension if not exists pgcrypto;
create table if not exists public.teamfrei_rooms (
 id uuid primary key default gen_random_uuid(),
 title text not null default 'Abteilung',
 invite_hash text not null
);
create table if not exists public.teamfrei_members (
 room_id uuid not null references public.teamfrei_rooms(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 joined_at timestamptz not null default now(),
 primary key(room_id,user_id)
);
create table if not exists public.teamfrei_state (
 room_id uuid primary key references public.teamfrei_rooms(id) on delete cascade,
 document jsonb not null default '{"wishes":[],"minStaff":2,"teamName":"Abteilung"}'::jsonb,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id)
);
create index if not exists teamfrei_members_user_idx on public.teamfrei_members(user_id);
alter table public.teamfrei_rooms enable row level security;
alter table public.teamfrei_members enable row level security;
alter table public.teamfrei_state enable row level security;
create policy "Members read room" on public.teamfrei_rooms for select to authenticated
 using (exists(select 1 from public.teamfrei_members m where m.room_id=id and m.user_id=auth.uid()));
create policy "Members read own membership" on public.teamfrei_members for select to authenticated
 using(user_id=auth.uid());
create policy "Members read state" on public.teamfrei_state for select to authenticated
 using(exists(select 1 from public.teamfrei_members m where m.room_id=teamfrei_state.room_id and m.user_id=auth.uid()));
create policy "Members update state" on public.teamfrei_state for update to authenticated
 using(exists(select 1 from public.teamfrei_members m where m.room_id=teamfrei_state.room_id and m.user_id=auth.uid()))
 with check(exists(select 1 from public.teamfrei_members m where m.room_id=teamfrei_state.room_id and m.user_id=auth.uid()));
-- SECURITY DEFINER avoids exposing room codes or permitting public membership writes.
create or replace function public.teamfrei_join(p_room uuid,p_code text)
returns boolean language plpgsql security definer set search_path=public as $$
declare ok boolean;
begin
 if auth.uid() is null then raise exception 'Sign-in required'; end if;
 select (invite_hash=crypt(p_code,invite_hash)) into ok from public.teamfrei_rooms where id=p_room;
 if coalesce(ok,false) then
   insert into public.teamfrei_members(room_id,user_id) values(p_room,auth.uid()) on conflict do nothing;
   return true;
 end if;
 return false;
end;$$;
revoke all on function public.teamfrei_join(uuid,text) from public;
grant execute on function public.teamfrei_join(uuid,text) to authenticated;
-- Set a strong room code manually, NEVER put it in frontend source:
-- with r as (insert into public.teamfrei_rooms(title,invite_hash)
-- values ('Abteilung',crypt('REPLACE_WITH_PRIVATE_CODE',gen_salt('bf'))) returning id)
-- insert into public.teamfrei_state(room_id) select id from r returning room_id;
-- The returned room_id is safe to put in config.js.
