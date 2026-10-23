-- truXanger: initial schema.
-- Every table has row level security. Writes that touch two people (matches,
-- trade confirmation) go through security definer functions, never direct inserts.

-- ---------- Types ----------
create type public.category as enum (
  'electronica', 'ropa', 'libros-coleccionables', 'instrumentos', 'deportes',
  'hogar', 'videojuegos', 'arte', 'plantas', 'servicios'
);
create type public.item_condition as enum ('nuevo', 'como-nuevo', 'buen-estado', 'usado', 'para-reparar');
create type public.listing_status as enum ('activo', 'en-negociacion', 'intercambiado', 'pausado');
create type public.currency as enum ('MXN', 'USD');
create type public.swipe_action as enum ('want', 'pass', 'save');
create type public.match_status as enum ('negociando', 'cerrado', 'cancelado');

-- Locations are stored rounded to ~1 km so nobody's address can be inferred.
create function public.round_location() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.lat := round(new.lat::numeric, 2)::double precision;
  new.lng := round(new.lng::numeric, 2)::double precision;
  return new;
end $$;

-- ---------- Profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_.]{3,24}$'),
  display_name text not null default '' check (char_length(display_name) <= 40),
  bio text not null default '' check (char_length(bio) <= 280),
  city_slug text,
  neighborhood text not null default '' check (char_length(neighborhood) <= 60),
  lat double precision,
  lng double precision,
  wants text[] not null default '{}' check (cardinality(wants) <= 5),
  verified boolean not null default false,
  seen_badges text[] not null default '{}',
  created_at timestamptz not null default now()
);

create trigger profiles_round_location before insert or update of lat, lng on public.profiles
  for each row execute function public.round_location();

-- A profile row for every new account; the person completes it in /bienvenida.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 40));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "profiles: anyone can read" on public.profiles for select using (true);
create policy "profiles: owners update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ---------- Listings ----------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,120}$'),
  title text not null check (char_length(title) between 3 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  category public.category not null,
  condition public.item_condition not null,
  value integer check (value is null or value between 0 and 10000000),
  currency public.currency not null default 'MXN',
  photos text[] not null check (cardinality(photos) between 1 and 6),
  wants text[] not null default '{}' check (cardinality(wants) <= 5),
  open_to_anything boolean not null default false,
  accepts_cash boolean not null default false,
  has_video boolean not null default false,
  city_slug text not null,
  neighborhood text not null default '' check (char_length(neighborhood) <= 60),
  lat double precision,
  lng double precision,
  status public.listing_status not null default 'activo',
  created_at timestamptz not null default now()
);

create index listings_feed_idx on public.listings (status, created_at desc);
create index listings_category_idx on public.listings (category) where status = 'activo';
create index listings_city_idx on public.listings (city_slug) where status = 'activo';
create index listings_owner_idx on public.listings (owner_id);

create trigger listings_round_location before insert or update of lat, lng on public.listings
  for each row execute function public.round_location();

alter table public.listings enable row level security;
create policy "listings: visible unless paused" on public.listings for select
  using (status <> 'pausado' or owner_id = (select auth.uid()));
create policy "listings: owners insert" on public.listings for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "listings: owners update" on public.listings for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "listings: owners delete" on public.listings for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ---------- Swipes ----------
create table public.swipes (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  action public.swipe_action not null,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.swipes enable row level security;
create policy "swipes: own only" on public.swipes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------- Matches (one conversation per match) ----------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade, -- swiped right
  user_b uuid not null references public.profiles (id) on delete cascade, -- owner of listing_b
  listing_a uuid references public.listings (id) on delete set null,      -- what user_a offers
  listing_b uuid references public.listings (id) on delete set null,      -- what user_a wants
  status public.match_status not null default 'negociando',
  confirmed_a boolean not null default false,
  confirmed_b boolean not null default false,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_a, listing_b),
  check (user_a <> user_b)
);

create index matches_user_a_idx on public.matches (user_a);
create index matches_user_b_idx on public.matches (user_b);

alter table public.matches enable row level security;
create policy "matches: participants read" on public.matches for select to authenticated
  using ((select auth.uid()) in (user_a, user_b));

-- ---------- Messages ----------
create table public.messages (
  id bigint generated always as identity primary key,
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid default auth.uid() references public.profiles (id) on delete set null, -- null: system
  kind text not null default 'text' check (kind in ('text', 'system')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_match_idx on public.messages (match_id, created_at);

alter table public.messages enable row level security;
create policy "messages: participants read" on public.messages for select to authenticated
  using (exists (select 1 from public.matches m where m.id = match_id and (select auth.uid()) in (m.user_a, m.user_b)));
create policy "messages: participants send" on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid()) and kind = 'text'
    and exists (select 1 from public.matches m where m.id = match_id and m.status <> 'cancelado' and (select auth.uid()) in (m.user_a, m.user_b))
  );
create policy "messages: recipients mark read" on public.messages for update to authenticated
  using (
    sender_id is distinct from (select auth.uid())
    and exists (select 1 from public.matches m where m.id = match_id and (select auth.uid()) in (m.user_a, m.user_b))
  );

-- ---------- Reviews ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  body text not null default '' check (char_length(body) <= 280),
  created_at timestamptz not null default now(),
  unique (match_id, author_id)
);

create index reviews_target_idx on public.reviews (target_id, created_at desc);

alter table public.reviews enable row level security;
create policy "reviews: anyone can read" on public.reviews for select using (true);
create policy "reviews: after a closed trade" on public.reviews for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.matches m
      where m.id = match_id and m.status = 'cerrado'
        and ((m.user_a = author_id and m.user_b = target_id) or (m.user_b = author_id and m.user_a = target_id))
    )
  );

-- ---------- Privileges: table level first, then the exact columns people may change ----------
revoke all on public.profiles, public.listings, public.swipes, public.matches, public.messages, public.reviews from anon, authenticated;

grant select on public.profiles, public.listings, public.reviews to anon, authenticated;
grant update (username, display_name, bio, city_slug, neighborhood, lat, lng, wants, seen_badges) on public.profiles to authenticated;
grant insert, delete on public.listings to authenticated;
grant update (title, description, category, condition, value, currency, photos, wants, open_to_anything, accepts_cash, neighborhood, status) on public.listings to authenticated;
grant select, insert, update, delete on public.swipes to authenticated;
grant select on public.matches to authenticated;
grant select, insert on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;
grant insert on public.reviews to authenticated;

-- ---------- Functions ----------

-- Opens a conversation after a right swipe. The app checks that the owner wants
-- something the caller offers before calling this (src/lib/match.ts).
create function public.create_match(p_their_listing uuid, p_my_listing uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
  v_owner uuid;
  v_their_title text;
  v_my_title text;
  v_id uuid;
begin
  if v_me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select owner_id, title into v_owner, v_their_title
  from public.listings where id = p_their_listing and status = 'activo';
  if v_owner is null then raise exception 'listing not available'; end if;
  if v_owner = v_me then raise exception 'cannot match own listing'; end if;

  select title into v_my_title
  from public.listings where id = p_my_listing and owner_id = v_me and status = 'activo';
  if v_my_title is null then raise exception 'offer not available'; end if;

  select id into v_id from public.matches where user_a = v_me and listing_b = p_their_listing;
  if v_id is not null then return v_id; end if;

  insert into public.matches (user_a, user_b, listing_a, listing_b)
  values (v_me, v_owner, p_my_listing, p_their_listing)
  returning id into v_id;

  insert into public.messages (match_id, sender_id, kind, body) values
    (v_id, null, 'system', '¡Hay trueque! Ya pueden negociar los detalles.'),
    (v_id, v_me, 'text', format('Hola, te propongo mi %s por tu %s. ¿Te late?', v_my_title, v_their_title));

  return v_id;
end $$;

-- Each side confirms once; when both have, the trade closes and both listings are marked traded.
create function public.confirm_trade(p_match uuid) returns public.match_status
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
  m public.matches;
begin
  select * into m from public.matches where id = p_match for update;
  if m.id is null or v_me is null or not (v_me = m.user_a or v_me = m.user_b) then
    raise exception 'not a participant' using errcode = '42501';
  end if;
  if m.status <> 'negociando' then return m.status; end if;
  if (v_me = m.user_a and m.confirmed_a) or (v_me = m.user_b and m.confirmed_b) then return m.status; end if;

  if v_me = m.user_a then
    update public.matches set confirmed_a = true where id = p_match returning * into m;
  else
    update public.matches set confirmed_b = true where id = p_match returning * into m;
  end if;

  if m.confirmed_a and m.confirmed_b then
    update public.matches set status = 'cerrado', closed_at = now() where id = p_match returning * into m;
    update public.listings set status = 'intercambiado' where id in (m.listing_a, m.listing_b);
    insert into public.messages (match_id, sender_id, kind, body)
    values (p_match, null, 'system', '¡Trueque cerrado! Ambos confirmaron.');
  else
    insert into public.messages (match_id, sender_id, kind, body)
    values (p_match, null, 'system', 'Una parte confirmó el trueque. Falta la otra.');
  end if;

  return m.status;
end $$;

-- Public reputation numbers for a set of people (owner cards, Descubre).
create function public.profile_summaries(p_ids uuid[])
returns table (id uuid, exchanges integer, rating numeric, reviews_count integer)
language sql stable security definer set search_path = '' as $$
  select
    p.id,
    (select count(*)::int from public.matches m where m.status = 'cerrado' and p.id in (m.user_a, m.user_b)),
    (select round(avg(r.stars)::numeric, 1) from public.reviews r where r.target_id = p.id),
    (select count(*)::int from public.reviews r where r.target_id = p.id)
  from public.profiles p
  where p.id = any (p_ids);
$$;

-- Everything the badge rules need for one person (src/lib/badges.ts).
create function public.profile_stats(p_user uuid)
returns table (
  exchanges integer, rating numeric, reviews_count integer, avg_response_minutes integer,
  trade_cities text[], by_category jsonb, verified boolean
)
language sql stable security definer set search_path = '' as $$
  with closed as (
    select m.listing_a, m.listing_b,
      case when m.user_a = p_user then m.listing_b else m.listing_a end as received
    from public.matches m
    where m.status = 'cerrado' and p_user in (m.user_a, m.user_b)
  ),
  cats as (
    select l.category::text as cat, count(*)::int as n
    from closed c join public.listings l on l.id = c.received
    group by l.category
  ),
  -- How long the owner takes to answer a new proposal, over their last 20.
  resp as (
    select extract(epoch from (min(msg.created_at) - m.created_at)) / 60 as mins
    from public.matches m
    join public.messages msg on msg.match_id = m.id and msg.sender_id = p_user
    where m.user_b = p_user
    group by m.id, m.created_at
    order by m.created_at desc
    limit 20
  )
  select
    (select count(*)::int from closed),
    (select round(avg(r.stars)::numeric, 1) from public.reviews r where r.target_id = p_user),
    (select count(*)::int from public.reviews r where r.target_id = p_user),
    (select round(avg(mins))::int from resp),
    (select coalesce(array_agg(distinct l.city_slug), '{}') from closed c join public.listings l on l.id in (c.listing_a, c.listing_b)),
    (select coalesce(jsonb_object_agg(cat, n), '{}'::jsonb) from cats),
    (select p.verified from public.profiles p where p.id = p_user);
$$;

revoke execute on function public.create_match(uuid, uuid), public.confirm_trade(uuid) from public, anon;
grant execute on function public.create_match(uuid, uuid), public.confirm_trade(uuid) to authenticated;
revoke execute on function public.profile_summaries(uuid[]), public.profile_stats(uuid) from public;
grant execute on function public.profile_summaries(uuid[]), public.profile_stats(uuid) to anon, authenticated;
revoke execute on function public.handle_new_user(), public.round_location() from public, anon, authenticated;

-- ---------- Storage: listing photos ----------
-- Public bucket: photos are readable by URL. Each person writes only under <their id>/.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "listing photos: upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "listing photos: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.messages, public.matches;
