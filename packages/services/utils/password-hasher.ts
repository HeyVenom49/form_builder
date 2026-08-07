import { argon2id, hash, verify, type HashOptions } from "argon2";

const ARGON2_OPTIONS: HashOptions = {
  type: argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hashValue: string,
  password: string,
): Promise<boolean> {
  return verify(hashValue, password);
}
