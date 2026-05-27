import { seedEntities } from "@/lib/db-entities";
import { seedUsers } from "@/lib/seed-users";
import { isDbConfigured } from "@/lib/mongodb";
import { ok, fail } from "@/lib/api-response";

export async function POST() {
  if (!isDbConfigured()) {
    return fail("MONGODB_URI is not configured", 503);
  }
  try {
    const [entities, users] = await Promise.all([seedEntities(), seedUsers()]);
    return ok({
      entities,
      users,
      message:
        entities.seeded || users.seeded
          ? "Database seeded successfully"
          : "Database already seeded",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Seed failed";
    return fail(message, 500);
  }
}
