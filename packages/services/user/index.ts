import { and, db, eq, isNull, userTable } from "@repo/database";
import {
  CreateUserWithEmailAndPasswordType,
  createUserWithEmailAndPasswordInput,
} from "./model";
import { hashPassword } from "../utils/password-hasher";
class UserService {
  private async getUserByEmail(email: string) {
    const result = await db
      .select()
      .from(userTable)
      .where(and(eq(userTable.email, email), isNull(userTable.deletedAt)))
      .limit(1);

    if (!result || result.length === 0) {
      return null;
    }

    return result[0] ?? null;
  }

  public async createUserWithEmailAndPassword(
    payload: CreateUserWithEmailAndPasswordType,
  ) {
    const { email, password, fullName } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);

    if (existingUser) {
      throw new Error(`User with ${email} is already exists`);
    }

    const passworHash: string = await hashPassword(password);

    const result = await db
      .insert(userTable)
      .values({
        email: email,
        hashPassword: passworHash,
        fullName: fullName,
      })
      .returning({
        id: userTable.id,
      });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("Something went wrong while creating user");
    }

    return { id: result[0].id };
  }
}

export default UserService;
