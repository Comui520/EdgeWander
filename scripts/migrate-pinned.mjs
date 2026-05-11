/**
 * One-off migration:
 *   1. Read every entry out of `edgewander:names`
 *   2. Drop the one with name "刘睿皞" (per user request)
 *   3. RPUSH the rest into `edgewander:names:pinned`, oldest first, so
 *      the pinned ordering matches the chronology of real first-visitors
 *   4. Clear `edgewander:names`
 *
 * Idempotency: after a successful apply, `names` is empty and `pinned`
 * holds 4 entries. Running again would find `names` empty and do nothing.
 *
 * Run:  node --env-file=.env.local scripts/migrate-pinned.mjs --dry
 *       node --env-file=.env.local scripts/migrate-pinned.mjs --apply
 */

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!URL || !TOKEN) {
  console.error("missing UPSTASH_REDIS_REST_URL / _TOKEN");
  process.exit(1);
}

const EXCLUDE_NAME = "刘睿皞";
const SRC_KEY = "edgewander:names";
const DST_KEY = "edgewander:names:pinned";

const mode = process.argv.includes("--apply")
  ? "apply"
  : process.argv.includes("--dry")
  ? "dry"
  : null;

if (!mode) {
  console.error("pass --dry or --apply");
  process.exit(1);
}

async function rest(cmd) {
  const r = await fetch(URL + "/" + cmd.join("/"), {
    headers: { Authorization: "Bearer " + TOKEN },
  });
  if (!r.ok) throw new Error(cmd[0] + " failed: " + r.status);
  return (await r.json()).result;
}

async function restPipeline(cmds) {
  const r = await fetch(URL + "/pipeline", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + TOKEN,
      "content-type": "application/json",
    },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error("pipeline failed: " + r.status);
  return r.json();
}

(async () => {
  const src = await rest(["lrange", SRC_KEY, "0", "-1"]);
  const dstBefore = await rest(["lrange", DST_KEY, "0", "-1"]);
  console.log("src (" + SRC_KEY + ") has", src.length, "entries (newest first):");
  for (const raw of src) console.log("  ", raw);
  console.log(
    "dst (" + DST_KEY + ") has",
    dstBefore.length,
    "entries already pinned.",
  );

  // Parse and sort oldest first by `at`
  const parsed = src
    .map((raw) => {
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return null;
      }
    })
    .filter((e) => e && typeof e.name === "string");

  parsed.sort((a, b) => (a.at || 0) - (b.at || 0));

  const kept = parsed.filter((e) => e.name !== EXCLUDE_NAME);
  const dropped = parsed.filter((e) => e.name === EXCLUDE_NAME);

  console.log("\nplanned pinned order (oldest → newest):");
  kept.forEach((e, i) =>
    console.log(`  [${i}] ${e.name} · ${new Date(e.at).toISOString()} · ${e.message}`),
  );
  console.log("\nwill drop:", dropped.map((e) => e.name));

  if (mode === "dry") {
    console.log("\n--dry: no writes. pass --apply to execute.");
    return;
  }

  if (dstBefore.length > 0) {
    console.error(
      "\nABORT: destination " + DST_KEY + " is not empty. Inspect before migrating.",
    );
    process.exit(2);
  }
  if (kept.length === 0) {
    console.log("\nnothing to migrate.");
    return;
  }

  // Atomic-ish: single pipeline appends all + deletes source key. Upstash
  // executes pipeline commands in order server-side.
  const cmds = [
    ...kept.map((e) => ["rpush", DST_KEY, JSON.stringify(e)]),
    ["del", SRC_KEY],
  ];
  console.log("\nsubmitting pipeline of", cmds.length, "commands...");
  const res = await restPipeline(cmds);
  console.log("pipeline ok:", JSON.stringify(res));

  const after = await rest(["lrange", DST_KEY, "0", "-1"]);
  console.log("\ndst now has", after.length, "entries:");
  for (const raw of after) console.log("  ", raw);
})().catch((e) => {
  console.error("MIGRATION FAILED:", e);
  process.exit(1);
});
