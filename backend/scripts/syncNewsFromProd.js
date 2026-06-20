/**
 * Sync the News collection from PRODUCTION → LOCAL (dev) database.
 *
 *   Production DB : Config/.env  MONGODB_URL  (cluster donb1153 / default db "test")
 *   Local dev DB  : .env.local   MONGODB_URL  (db "hypertek_dev")
 *
 * Usage:
 *   node scripts/syncNewsFromProd.js            # DRY RUN — only prints a comparison, writes nothing
 *   node scripts/syncNewsFromProd.js --apply    # MIRROR  — wipe local News, copy prod News verbatim (local == prod)
 *   node scripts/syncNewsFromProd.js --merge     # MERGE   — upsert prod News by _id, keep local-only extras
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Read both connection strings explicitly (don't rely on override order) ──
function readEnvVar(file, key) {
  const full = path.join(__dirname, "..", file);
  if (!fs.existsSync(full)) return undefined;
  const parsed = dotenv.parse(fs.readFileSync(full));
  return parsed[key];
}

const PROD_URL = readEnvVar("Config/.env", "MONGODB_URL");
const DEV_URL = readEnvVar(".env.local", "MONGODB_URL");

const MODE = process.argv.includes("--apply")
  ? "apply"
  : process.argv.includes("--merge")
  ? "merge"
  : "dry";

const newsSchema = new mongoose.Schema({}, { strict: false, collection: "news" });

async function main() {
  if (!PROD_URL) throw new Error("Missing MONGODB_URL in Config/.env (production)");
  if (!DEV_URL) throw new Error("Missing MONGODB_URL in .env.local (local dev)");
  if (PROD_URL === DEV_URL) throw new Error("Prod and dev URLs are identical — aborting to avoid self-sync");

  const prod = mongoose.createConnection(PROD_URL);
  const dev = mongoose.createConnection(DEV_URL);
  await Promise.all([prod.asPromise(), dev.asPromise()]);

  const ProdNews = prod.model("News", newsSchema);
  const DevNews = dev.model("News", newsSchema);

  const [prodDocs, devDocs] = await Promise.all([
    ProdNews.find({}).lean(),
    DevNews.find({}).lean(),
  ]);

  console.log(`\n  PROD db: "${prod.name}"   News count: ${prodDocs.length}`);
  console.log(`  DEV  db: "${dev.name}"   News count: ${devDocs.length}\n`);

  console.log("  ── PRODUCTION news ──");
  prodDocs.forEach((d, i) =>
    console.log(`   ${String(i + 1).padStart(2)}. ${d._id}  ${(d.heading || "").slice(0, 60)}`)
  );
  console.log("\n  ── LOCAL (dev) news ──");
  devDocs.forEach((d, i) =>
    console.log(`   ${String(i + 1).padStart(2)}. ${d._id}  ${(d.heading || "").slice(0, 60)}`)
  );

  if (MODE === "dry") {
    console.log("\n  DRY RUN — no changes written. Re-run with --apply (mirror) or --merge.\n");
  } else if (MODE === "apply") {
    await DevNews.deleteMany({});
    if (prodDocs.length) await DevNews.insertMany(prodDocs, { ordered: false });
    console.log(`\n  ✅ MIRROR done — local News replaced with ${prodDocs.length} prod docs.\n`);
  } else if (MODE === "merge") {
    let upserts = 0;
    for (const d of prodDocs) {
      await DevNews.updateOne({ _id: d._id }, { $set: d }, { upsert: true });
      upserts++;
    }
    console.log(`\n  ✅ MERGE done — upserted ${upserts} prod docs into local (extras kept).\n`);
  }

  await Promise.all([prod.close(), dev.close()]);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
