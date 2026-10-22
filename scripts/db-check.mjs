#!/usr/bin/env node
/**
 * Database inspector / migration verifier.
 *
 *   node scripts/db-check.mjs            # report only
 *   node scripts/db-check.mjs --strict   # exit 1 if the schema is incomplete
 *
 * Reads DATABASE_URL from the environment, then .env.local, then .env — the same
 * precedence Next.js uses. Credentials are never printed: the connection string is
 * reduced to host/database before any output.
 */
import { config } from "dotenv";
import { Client } from "pg";

config({ path: [".env.local", ".env"], quiet: true });

const strict = process.argv.includes("--strict");
const rawUrl = process.env.DATABASE_URL;

/** Tables and indexes the application expects (see src/db/schema.ts). */
const EXPECTED_TABLES = [
  "achievements",
  "auth_sessions",
  "challenge_progress",
  "challenges",
  "friends",
  "game_sessions",
  "games",
  "notifications",
  "tournaments",
  "user_achievements",
  "user_inventory",
  "users",
  "vehicles",
];

function describe(url) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      database: parsed.pathname.replace(/^\//, "") || "(default)",
      user: parsed.username || "(none)",
      sslmode: parsed.searchParams.get("sslmode") ?? "(driver default)",
      pooled: /-pooler\./.test(parsed.hostname),
    };
  } catch {
    return { host: "(unparseable DATABASE_URL)", database: "?", user: "?", sslmode: "?", pooled: false };
  }
}

if (!rawUrl) {
  console.error("✖ DATABASE_URL is not set (checked environment, .env.local, .env).");
  process.exit(1);
}

const target = describe(rawUrl);
console.log("Database target");
console.log(`  host     : ${target.host}${target.pooled ? "  (pooled endpoint)" : ""}`);
console.log(`  database : ${target.database}`);
console.log(`  user     : ${target.user}`);
console.log(`  sslmode  : ${target.sslmode}`);
console.log("");

const client = new Client({ connectionString: rawUrl, connectionTimeoutMillis: 15000 });

try {
  await client.connect();
  const { rows: versionRows } = await client.query("select version()");
  console.log(`✔ Connected — ${String(versionRows[0].version).split(" ").slice(0, 2).join(" ")}`);

  const { rows: tables } = await client.query(
    `select table_name
       from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name`,
  );
  const present = tables.map((r) => r.table_name);
  const missing = EXPECTED_TABLES.filter((t) => !present.includes(t));

  if (!present.length) {
    console.log("  (no tables in schema public — this database has not been initialised)");
  } else {
    console.log("\nTables in public");
    for (const name of present) {
      const expected = EXPECTED_TABLES.includes(name);
      const { rows } = await client.query(`select count(*)::int as c from "${name.replace(/"/g, '""')}"`);
      console.log(`  ${expected ? "✔" : "•"} ${name.padEnd(22)} ${String(rows[0].c).padStart(6)} rows`);
    }
  }

  const extra = present.filter((t) => !EXPECTED_TABLES.includes(t));

  console.log("\nSchema status");
  if (missing.length === 0) {
    console.log(`  ✔ complete — all ${EXPECTED_TABLES.length} expected tables exist`);
  } else {
    console.log(`  ✖ ${missing.length} missing: ${missing.join(", ")}`);
    console.log("    Apply them without touching existing data with:  npm run db:push");
  }
  if (extra.length) console.log(`  • not part of this app (left untouched): ${extra.join(", ")}`);

  // The app seeds catalogue data on first request; surface the current contents.
  if (present.includes("games")) {
    const { rows } = await client.query("select count(*)::int as c from games");
    const { rows: users } = await client.query("select count(*)::int as c from users");
    console.log(`\nData\n  games: ${rows[0].c}  ·  users: ${users[0].c}`);
    if (rows[0].c === 0) console.log("  (catalogue seeds automatically on the first request, or run: npm run db:seed)");
  }

  if (strict && missing.length) process.exitCode = 1;
} catch (error) {
  const code = error.code ? ` [${error.code}]` : "";
  console.error(`✖ Could not connect${code}: ${error.message}`);
  if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|EHOSTUNREACH|terminated unexpectedly/i.test(error.message)) {
    console.error("  This looks like a network/DNS/firewall problem rather than bad credentials.");
    console.error("  Verify the host is reachable and that outbound 5432 is allowed from where this runs.");
  }
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
