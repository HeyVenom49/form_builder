import {
  accountTable,
  and,
  authTokenTable,
  db,
  eq,
  gt,
  isNull,
  sessionTable,
  userTable,
  type SelectUser,
} from "@repo/database";
import { hashPassword, verifyPassword } from "../utils/password-hasher";
import EmailService from "../email";
import {
  createOpaqueToken,
  EMAIL_VERIFICATION_TTL_MS,
  hashToken,
  PASSWORD_RESET_TTL_MS,
  SESSION_TTL_MS,
} from "../utils/session-token";
import {
  changePasswordInput,
  createUserWithEmailAndPasswordInput,
  loginWithEmailAndPasswordInput,
  publicUserSchema,
  requestPasswordResetInput,
  resetPasswordInput,
  verifyEmailInput,
  type ChangePasswordType,
  type CreateUserWithEmailAndPasswordType,
  type LoginWithEmailAndPasswordType,
  type PublicUser,
  type RequestPasswordResetType,
  type ResetPasswordType,
  type SessionMeta,
  type VerifyEmailType,
} from "./model";

type AuthSuccess = {
  id: string;
  sessionToken: string;
  user: PublicUser;
};

class AuthService {
  private readonly email = new EmailService();
  private toPublicUser(user: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    avatarUrl: string | null;
    role: PublicUser["role"];
    themeMode: PublicUser["themeMode"];
    emailVerifiedAt: Date | null;
  }): PublicUser {
    return publicUserSchema.parse(user);
  }

  private async getUserByEmail(email: string): Promise<SelectUser | null> {
    const [user] = await db
      .select()
      .from(userTable)
      .where(and(eq(userTable.email, email), isNull(userTable.deletedAt)))
      .limit(1);

    return user ?? null;
  }

  private async getUserById(id: string): Promise<SelectUser | null> {
    const [user] = await db
      .select()
      .from(userTable)
      .where(and(eq(userTable.id, id), isNull(userTable.deletedAt)))
      .limit(1);

    return user ?? null;
  }

  private async createSession(userId: string, meta?: SessionMeta) {
    const sessionToken = createOpaqueToken();
    const tokenHash = hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await db.insert(sessionTable).values({
      userId,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return sessionToken;
  }

  private async getCredentialsAccount(userId: string) {
    const [account] = await db
      .select()
      .from(accountTable)
      .where(
        and(
          eq(accountTable.userId, userId),
          eq(accountTable.provider, "CREDENTIALS"),
        ),
      )
      .limit(1);

    return account ?? null;
  }

  private async createAuthToken(args: {
    userId: string | null;
    email: string;
    type: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
    ttlMs: number;
  }) {
    const token = createOpaqueToken();
    const tokenHash = hashToken(token);

    await db.insert(authTokenTable).values({
      userId: args.userId,
      email: args.email,
      type: args.type,
      tokenHash,
      expiresAt: new Date(Date.now() + args.ttlMs),
    });

    return token;
  }

  private async consumeAuthToken(
    rawToken: string,
    type: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
  ) {
    const tokenHash = hashToken(rawToken);

    const [row] = await db
      .select()
      .from(authTokenTable)
      .where(
        and(
          eq(authTokenTable.tokenHash, tokenHash),
          eq(authTokenTable.type, type),
          isNull(authTokenTable.usedAt),
          gt(authTokenTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    const [consumed] = await db
      .update(authTokenTable)
      .set({ usedAt: new Date() })
      .where(
        and(eq(authTokenTable.id, row.id), isNull(authTokenTable.usedAt)),
      )
      .returning();

    return consumed ?? null;
  }

  public async createUserWithEmailAndPassword(
    payload: CreateUserWithEmailAndPasswordType,
    meta?: SessionMeta,
  ): Promise<AuthSuccess> {
    const { email, password, name } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error(`User with ${email} already exists`);
    }

    const passwordHash = await hashPassword(password);

    const id = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(userTable)
        .values({ email, name })
        .returning({ id: userTable.id });

      if (!user?.id) {
        throw new Error("Something went wrong while creating user");
      }

      await tx.insert(accountTable).values({
        userId: user.id,
        provider: "CREDENTIALS",
        providerAccountId: user.id,
        passwordHash,
      });

      return user.id;
    });

    const sessionToken = await this.createSession(id, meta);
    const user = await this.getMe(id);
    if (!user) {
      throw new Error("Something went wrong while creating user");
    }

    const emailVerificationToken = await this.createAuthToken({
      userId: id,
      email: user.email,
      type: "EMAIL_VERIFICATION",
      ttlMs: EMAIL_VERIFICATION_TTL_MS,
    });

    try {
      await this.email.sendEmailVerification({
        to: user.email,
        name: user.name,
        token: emailVerificationToken,
      });
    } catch (error) {
      console.error("[email] failed to send verification after signup", error);
    }

    return { id, sessionToken, user };
  }

  public async loginWithEmailAndPassword(
    payload: LoginWithEmailAndPasswordType,
    meta?: SessionMeta,
  ): Promise<AuthSuccess> {
    const { email, password } =
      await loginWithEmailAndPasswordInput.parseAsync(payload);

    const [row] = await db
      .select({
        userId: userTable.id,
        passwordHash: accountTable.passwordHash,
      })
      .from(userTable)
      .innerJoin(
        accountTable,
        and(
          eq(accountTable.userId, userTable.id),
          eq(accountTable.provider, "CREDENTIALS"),
        ),
      )
      .where(and(eq(userTable.email, email), isNull(userTable.deletedAt)))
      .limit(1);

    // Same message for missing user / bad password — avoid account enumeration.
    if (!row?.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const valid = await verifyPassword(row.passwordHash, password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    await db
      .update(userTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(userTable.id, row.userId));

    const sessionToken = await this.createSession(row.userId, meta);
    const user = await this.getMe(row.userId);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    return { id: row.userId, sessionToken, user };
  }

  public async logout(sessionToken: string) {
    const tokenHash = hashToken(sessionToken);

    await db
      .update(sessionTable)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessionTable.tokenHash, tokenHash),
          isNull(sessionTable.revokedAt),
        ),
      );
  }

  public async logoutAll(userId: string) {
    await db
      .update(sessionTable)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(sessionTable.userId, userId), isNull(sessionTable.revokedAt)),
      );
  }

  public async getMe(userId: string): Promise<PublicUser | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    return this.toPublicUser({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      role: user.role,
      themeMode: user.themeMode,
      emailVerifiedAt: user.emailVerifiedAt,
    });
  }

  public async resolveSession(sessionToken: string): Promise<string | null> {
    const tokenHash = hashToken(sessionToken);

    const session = await db.query.sessionTable.findFirst({
      where: and(
        eq(sessionTable.tokenHash, tokenHash),
        isNull(sessionTable.revokedAt),
        gt(sessionTable.expiresAt, new Date()),
      ),
      columns: { userId: true },
    });

    return session?.userId ?? null;
  }

  public async changePassword(
    userId: string,
    payload: ChangePasswordType,
    meta?: SessionMeta,
  ) {
    const { currentPassword, newPassword } =
      await changePasswordInput.parseAsync(payload);

    if (currentPassword === newPassword) {
      throw new Error("New password must be different from current password");
    }

    const account = await this.getCredentialsAccount(userId);
    if (!account?.passwordHash) {
      throw new Error("Password login is not available for this account");
    }

    const valid = await verifyPassword(account.passwordHash, currentPassword);
    if (!valid) {
      throw new Error("Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(accountTable)
      .set({ passwordHash })
      .where(eq(accountTable.id, account.id));

    await this.logoutAll(userId);
    const sessionToken = await this.createSession(userId, meta);

    return { ok: true as const, sessionToken };
  }

  /**
   * Always succeeds from the caller's POV when email is unknown (no enumeration).
   * Returns a raw token only when a user exists — caller should email it.
   */
  public async requestPasswordReset(payload: RequestPasswordResetType) {
    const { email } = await requestPasswordResetInput.parseAsync(payload);
    const user = await this.getUserByEmail(email);

    if (!user) {
      return { ok: true as const };
    }

    const token = await this.createAuthToken({
      userId: user.id,
      email: user.email,
      type: "PASSWORD_RESET",
      ttlMs: PASSWORD_RESET_TTL_MS,
    });

    await this.email.sendPasswordReset({
      to: user.email,
      name: user.name,
      token,
    });

    return { ok: true as const };
  }

  public async resetPassword(payload: ResetPasswordType) {
    const { token, newPassword } = await resetPasswordInput.parseAsync(payload);
    const authToken = await this.consumeAuthToken(token, "PASSWORD_RESET");

    if (!authToken?.userId) {
      throw new Error("Invalid or expired reset token");
    }

    const account = await this.getCredentialsAccount(authToken.userId);
    if (!account) {
      throw new Error("Password login is not available for this account");
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(accountTable)
      .set({ passwordHash })
      .where(eq(accountTable.id, account.id));

    await this.logoutAll(authToken.userId);

    return { ok: true as const };
  }

  public async requestEmailVerification(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerifiedAt) {
      return { ok: true as const, alreadyVerified: true as const };
    }

    const token = await this.createAuthToken({
      userId: user.id,
      email: user.email,
      type: "EMAIL_VERIFICATION",
      ttlMs: EMAIL_VERIFICATION_TTL_MS,
    });

    await this.email.sendEmailVerification({
      to: user.email,
      name: user.name,
      token,
    });

    return { ok: true as const, alreadyVerified: false as const };
  }

  public async verifyEmail(payload: VerifyEmailType) {
    const { token } = await verifyEmailInput.parseAsync(payload);
    const authToken = await this.consumeAuthToken(token, "EMAIL_VERIFICATION");

    if (!authToken?.userId) {
      throw new Error("Invalid or expired verification token");
    }

    await db
      .update(userTable)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(userTable.id, authToken.userId));

    return { ok: true as const };
  }
}

export default AuthService;
export {
  hashToken as hashSessionToken,
  createOpaqueToken as createSessionToken,
  type PublicUser,
  type CreateUserWithEmailAndPasswordType,
  type LoginWithEmailAndPasswordType,
  type ChangePasswordType,
  type RequestPasswordResetType,
  type ResetPasswordType,
  type VerifyEmailType,
};
