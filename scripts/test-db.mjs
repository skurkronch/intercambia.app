// Runs the Supabase migrations against PGlite (real Postgres in WASM) with
// minimal stand-ins for Supabase's auth and storage schemas, then checks the
// row level security and trade functions from the point of view of real users.
//   node scripts/test-db.mjs
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated;

  create schema auth;
  grant usage on schema auth to anon, authenticated;
  create table auth.users (id uuid primary key, instance_id uuid, aud text, role text, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}', created_at timestamptz, updated_at timestamptz);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated;

  create schema storage;
  grant usage on schema storage to anon, authenticated;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant select, insert, delete on storage.objects to authenticated;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  grant execute on function storage.foldername(text) to anon, authenticated;

  create publication supabase_realtime;
`;

const db = new PGlite();
await db.exec(SUPABASE_STUBS);
const dir = "supabase/migrations";
for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  await db.exec(readFileSync(join(dir, f), "utf8"));
  console.log(`migrated ${f}`);
}

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
const C = "00000000-0000-0000-0000-00000000000c";

async function as(user, sql, params = []) {
  await db.exec(user ? `set role authenticated; set request.jwt.claim.sub = '${user}';` : `set role anon; set request.jwt.claim.sub = '';`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("reset role; reset request.jwt.claim.sub;");
  }
}

let failures = 0;
async function check(name, fn) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL ${name}: ${e.message}`);
  }
}
async function rejects(name, fn) {
  try {
    await fn();
    failures++;
    console.log(`  FAIL ${name}: expected an error`);
  } catch {
    console.log(`  ok   ${name}`);
  }
}
function eq(actual, expected, what = "value") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${what}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
}

// Accounts (what Supabase Auth does on sign up)
for (const [id, name] of [[A, "Ana"], [B, "Beto"], [C, "Cris"]]) {
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [id, `${name}@example.com`, { full_name: name }]);
}

console.log("profiles");
await check("sign-up creates a profile with the name", async () => {
  const r = await as(A, `select display_name from public.profiles where id = $1`, [A]);
  eq(r.rows[0].display_name, "Ana");
});
await check("people complete their own profile, location rounded", async () => {
  await as(A, `update public.profiles set username = 'ana', city_slug = 'cdmx', lat = 19.41234, lng = -99.17345 where id = $1`, [A]);
  await as(B, `update public.profiles set username = 'beto', city_slug = 'cdmx' where id = $1`, [B]);
  const r = await as(null, `select lat, lng from public.profiles where id = $1`, [A]);
  eq([r.rows[0].lat, r.rows[0].lng], [19.41, -99.17], "rounded location");
});
await rejects("cannot mark themselves verified", () => as(A, `update public.profiles set verified = true where id = $1`, [A]));
await check("cannot edit someone else's profile", async () => {
  const r = await as(C, `update public.profiles set bio = 'hack' where id = $1 returning id`, [A]);
  eq(r.rows.length, 0, "rows updated");
});

console.log("listings");
const insertListing = (user, slug, title, category) =>
  as(user, `insert into public.listings (slug, title, category, condition, photos, wants, city_slug)
            values ($1, $2, $3, 'buen-estado', array[$4], array['Guitarra'], 'cdmx') returning id`,
     [slug, title, category, `${user}/x/0.jpg`]);
let la, lb;
await check("owners publish", async () => {
  la = (await insertListing(A, "squier-a", "Guitarra Squier", "instrumentos")).rows[0].id;
  lb = (await insertListing(B, "ps5-b", "PlayStation 5", "videojuegos")).rows[0].id;
});
await rejects("cannot publish without photos", () =>
  as(A, `insert into public.listings (slug, title, category, condition, photos, city_slug) values ('x-a', 'Sin fotos', 'arte', 'usado', '{}', 'cdmx')`));
await rejects("cannot publish as someone else", () =>
  as(A, `insert into public.listings (owner_id, slug, title, category, condition, photos, city_slug) values ($1, 'x-b', 'Falso', 'arte', 'usado', array['a'], 'cdmx')`, [B]));
await check("anyone can browse active listings", async () => {
  const r = await as(null, `select count(*)::int as n from public.listings`);
  eq(r.rows[0].n, 2, "visible listings");
});
await check("paused listings are hidden from others", async () => {
  await as(A, `update public.listings set status = 'pausado' where id = $1`, [la]);
  eq((await as(null, `select count(*)::int as n from public.listings`)).rows[0].n, 1, "anon sees");
  eq((await as(A, `select count(*)::int as n from public.listings`)).rows[0].n, 2, "owner sees");
  await as(A, `update public.listings set status = 'activo' where id = $1`, [la]);
});
await rejects("cannot change the owner of a listing", () => as(A, `update public.listings set owner_id = $1 where id = $2`, [B, la]));

console.log("swipes");
await check("swipes are private", async () => {
  await as(A, `insert into public.swipes (listing_id, action) values ($1, 'want')`, [lb]);
  eq((await as(B, `select count(*)::int as n from public.swipes`)).rows[0].n, 0, "B sees A's swipes");
  eq((await as(A, `select count(*)::int as n from public.swipes`)).rows[0].n, 1, "A sees own");
});
await rejects("anon cannot read swipes", () => as(null, `select * from public.swipes`));

console.log("matches and chat");
let m;
await check("a right swipe opens a conversation with the proposal", async () => {
  m = (await as(A, `select public.create_match($1, $2) as id`, [lb, la])).rows[0].id;
  const msgs = await as(B, `select kind, body from public.messages where match_id = $1 order by id`, [m]);
  eq(msgs.rows.map((r) => r.kind), ["system", "text"], "message kinds");
});
await check("creating the same match again returns the same conversation", async () => {
  eq((await as(A, `select public.create_match($1, $2) as id`, [lb, la])).rows[0].id, m, "match id");
});
await rejects("cannot match your own listing", () => as(A, `select public.create_match($1, $2)`, [la, la]));
await rejects("cannot offer someone else's listing", () => as(C, `select public.create_match($1, $2)`, [la, lb]));
await rejects("anon cannot create matches", () => as(null, `select public.create_match($1, $2)`, [lb, la]));
await rejects("cannot insert matches directly", () => as(A, `insert into public.matches (user_a, user_b) values ($1, $2)`, [A, B]));
await check("outsiders cannot see the conversation", async () => {
  eq((await as(C, `select count(*)::int as n from public.matches`)).rows[0].n, 0, "matches");
  eq((await as(C, `select count(*)::int as n from public.messages`)).rows[0].n, 0, "messages");
});
await check("participants chat", async () => {
  await as(B, `insert into public.messages (match_id, body) values ($1, 'Me late. ¿El sábado?')`, [m]);
  eq((await as(A, `select count(*)::int as n from public.messages where match_id = $1`, [m])).rows[0].n, 3, "messages");
});
await rejects("cannot speak as the system", () => as(A, `insert into public.messages (match_id, kind, body) values ($1, 'system', 'Trueque cerrado')`, [m]));
await rejects("cannot post in someone else's chat", () => as(C, `insert into public.messages (match_id, body) values ($1, 'hola')`, [m]));
await check("recipients mark messages read; senders cannot", async () => {
  const r = await as(A, `update public.messages set read_at = now() where match_id = $1 and sender_id = $2 returning id`, [m, B]);
  eq(r.rows.length, 1, "marked by recipient");
  const own = await as(B, `update public.messages set read_at = now() where match_id = $1 and sender_id = $2 returning id`, [m, B]);
  eq(own.rows.length, 0, "marked by sender");
});
await rejects("cannot edit message text", () => as(B, `update public.messages set body = 'otra cosa' where match_id = $1`, [m]));

console.log("closing the trade");
await rejects("cannot review before the trade closes", () =>
  as(A, `insert into public.reviews (match_id, target_id, stars) values ($1, $2, 5)`, [m, B]));
await check("one confirmation keeps it open", async () => {
  eq((await as(A, `select public.confirm_trade($1) as s`, [m])).rows[0].s, "negociando", "status");
});
await rejects("outsiders cannot confirm", () => as(C, `select public.confirm_trade($1)`, [m]));
await check("the second confirmation closes it and marks both listings traded", async () => {
  eq((await as(B, `select public.confirm_trade($1) as s`, [m])).rows[0].s, "cerrado", "status");
  const l = await as(A, `select status from public.listings where id in ($1, $2)`, [la, lb]);
  eq(l.rows.map((r) => r.status), ["intercambiado", "intercambiado"], "listing status");
});
await check("participants review each other once", async () => {
  await as(A, `insert into public.reviews (match_id, target_id, stars, body) values ($1, $2, 5, 'Puntual')`, [m, B]);
});
await rejects("no second review for the same trade", () => as(A, `insert into public.reviews (match_id, target_id, stars) values ($1, $2, 4)`, [m, B]));
await rejects("outsiders cannot review", () => as(C, `insert into public.reviews (match_id, target_id, stars) values ($1, $2, 1)`, [m, B]));

console.log("stats");
await check("stats feed the badges", async () => {
  const s = (await as(null, `select * from public.profile_stats($1)`, [A])).rows[0];
  eq([s.exchanges, s.by_category, s.trade_cities], [1, { videojuegos: 1 }, ["cdmx"]], "A stats");
  const t = (await as(null, `select * from public.profile_stats($1)`, [B])).rows[0];
  eq([Number(t.rating), t.reviews_count, t.avg_response_minutes !== null], [5, 1, true], "B stats");
});
await check("summaries for owner cards", async () => {
  const r = await as(null, `select id, exchanges from public.profile_summaries($1) order by id`, [[A, B]]);
  eq(r.rows.map((x) => x.exchanges), [1, 1], "exchanges");
});

console.log("storage");
await check("upload only into your own folder", async () => {
  await as(A, `insert into storage.objects (bucket_id, name) values ('listing-photos', $1)`, [`${A}/l1/0.jpg`]);
});
await rejects("not into someone else's", () => as(A, `insert into storage.objects (bucket_id, name) values ('listing-photos', $1)`, [`${B}/l1/0.jpg`]));

console.log("demo seed");
await check("seed-demo.sql loads", async () => {
  await db.exec(readFileSync("supabase/seed-demo.sql", "utf8"));
  const r = await as(null, `select count(*)::int as n from public.listings where photos[1] like 'demo:%'`);
  eq(r.rows[0].n, 20, "demo listings");
});

console.log(failures ? `\n${failures} failing` : "\nall passing");
process.exit(failures ? 1 : 0);
