/**
 * Seed MongoDB with Sudarshan ERP demo data.
 * Usage: npm run seed
 */
import { config } from "dotenv";
import { seedEntities } from "../src/lib/db-entities";
import { seedUsers } from "../src/lib/seed-users";
import { connectDB, isDbConfigured } from "../src/lib/mongodb";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  if (!isDbConfigured()) {
    console.error(
      "MONGODB_URI is not set. Copy .env.example to .env.local (or .env) and set MONGODB_URI."
    );
    process.exit(1);
  }
  await connectDB();
  const entities = await seedEntities();
  const users = await seedUsers();
  console.log(JSON.stringify({ entities, users }, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
