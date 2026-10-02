// One-off migration for the Gems rate change from 250 to 2500 per $1.
// Multiplies every existing Gems balance, the Gems ledger and the Gems reward
// on each package by 10, so nobody who paid at the old rate ends up with less.
//
//   node scripts/migrateGemsRate.js           dry run, prints what would change
//   node scripts/migrateGemsRate.js --apply   writes the changes
//
// Run it exactly once, together with the deploy that sets HB_TO_USD to 2500.
// A marker in the migrations collection blocks a second run.
import "dotenv/config";
import mongoose from "mongoose";

const FACTOR = 10;
const MARKER = "gems-rate-250-to-2500";
const apply = process.argv.includes("--apply");

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  const db = mongoose.connection.db;
  const users = db.collection("users");
  const ledger = db.collection("hbledgers");
  const packages = db.collection("packages");
  const migrations = db.collection("migrations");

  if (await migrations.findOne({ _id: MARKER })) {
    console.log("Already applied, nothing to do.");
    return;
  }

  const holders = await users.countDocuments({ hyperBucks: { $gt: 0 } });
  const [total] = await users
    .aggregate([{ $group: { _id: null, sum: { $sum: "$hyperBucks" } } }])
    .toArray();
  const ledgerRows = await ledger.countDocuments({});
  const rewardPackages = await packages.countDocuments({ "resourceRewards.resource": "HB" });

  console.log(`Users with a balance:     ${holders}`);
  console.log(`Total Gems now:           ${total?.sum ?? 0}`);
  console.log(`Total Gems after:         ${(total?.sum ?? 0) * FACTOR}`);
  console.log(`Ledger rows:              ${ledgerRows}`);
  console.log(`Packages with Gems:       ${rewardPackages}`);

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write.");
    return;
  }

  await migrations.insertOne({ _id: MARKER, startedAt: new Date() });
  await users.updateMany({ hyperBucks: { $gt: 0 } }, { $mul: { hyperBucks: FACTOR } });
  // cashoutUSD is a dollar figure and stays as it is.
  await ledger.updateMany({}, { $mul: { amount: FACTOR, balanceAfter: FACTOR } });
  await packages.updateMany(
    { "resourceRewards.resource": "HB" },
    { $mul: { "resourceRewards.$[r].amount": FACTOR } },
    { arrayFilters: [{ "r.resource": "HB" }] }
  );
  await migrations.updateOne({ _id: MARKER }, { $set: { finishedAt: new Date() } });
  console.log("\nApplied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
