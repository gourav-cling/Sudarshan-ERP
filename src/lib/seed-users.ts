import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { SEED_DATA } from "@/lib/seed-data";

const DEFAULT_PASSWORD = "sudarshan123";

export async function seedUsers() {
  await connectDB();
  await User.deleteMany({});
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  await User.insertMany(
    SEED_DATA.USERS.map((u) => ({
      email: u.email,
      name: u.name,
      role: u.role,
      employeeId: u.employeeId,
      passwordHash: hash,
    }))
  );
  return { seeded: true, count: SEED_DATA.USERS.length };
}
