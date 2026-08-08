/**
 * Seeds a single credentials user for local testing.
 * Idempotent: skips insert if email already exists.
 *
 *   bun --env-file=../../.env run db:seed
 */
import { eq, isNull, and } from "drizzle-orm";
import { argon2id, hash, type HashOptions } from "argon2";
import { db } from "./index";
import { accountTable, userTable } from "./schema";

const ARGON2_OPTIONS: HashOptions = {
  type: argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

export const TEST_USER = {
  email: "demo@demo.com",
  password: "Test1234!",
  name: "Demo User",
  username: "demo",
} as const;

async function seed() {
  const [existing] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(
      and(eq(userTable.email, TEST_USER.email), isNull(userTable.deletedAt)),
    )
    .limit(1);

  if (existing) {
    console.log(`✓ Test user already exists: ${TEST_USER.email}`);
    console.log(`  password: ${TEST_USER.password}`);
    process.exit(0);
  }

  const passwordHash = await hash(TEST_USER.password, ARGON2_OPTIONS);

  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(userTable)
      .values({
        email: TEST_USER.email,
        name: TEST_USER.name,
        username: TEST_USER.username,
        emailVerifiedAt: new Date(),
      })
      .returning({ id: userTable.id });

    if (!user?.id) {
      throw new Error("Failed to insert test user");
    }

    await tx.insert(accountTable).values({
      userId: user.id,
      provider: "CREDENTIALS",
      providerAccountId: user.id,
      passwordHash,
    });
  });

  console.log("✓ Seeded test user");
  console.log(`  email:    ${TEST_USER.email}`);
  console.log(`  password: ${TEST_USER.password}`);
  console.log(`  name:     ${TEST_USER.name}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
