import { config } from "dotenv";
import { connectDB } from "../src/lib/mongodb";
import { User } from "../src/models/User";

config({ path: ".env" });

async function main() {
  await connectDB();
  const users = await User.find({});
  console.log("Users:", JSON.stringify(users, null, 2));
  process.exit(0);
}

main().catch(console.error);
