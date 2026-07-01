import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { db } from "./index";
import { users } from "./schema";

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 10);

  await db
    .insert(users)
    .values({
      id: randomUUID(),
      name: "PowerOps Admin",
      username: "admin",
      email: "admin@powerops.com",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    })
    .onConflictDoNothing();

  console.log("Demo admin user created");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});