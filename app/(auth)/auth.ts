import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { db, getUser } from "@/lib/db/queries";
import {
  account as accountTable,
  session as sessionTable,
  user as userTable,
  verificationToken as verificationTokenTable,
} from "@/lib/db/schema";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
  interface User {
    id?: string;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: userTable,
    accountsTable: accountTable,
    sessionsTable: sessionTable,
    verificationTokensTable: verificationTokenTable,
  }),
  session: {
    strategy: "jwt", // Required for credentials provider, works with OAuth too
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        // Check if email is verified for credentials login
        if (!user.emailVerified) {
          return null;
        }

        console.log(
          "[AUTH] Comparing password. Input length:",
          password.length,
          "Hash from DB:",
          `${user.password.substring(0, 20)}...`
        );
        const passwordsMatch = await compare(password, user.password);
        console.log("[AUTH] Password match:", passwordsMatch);

        if (!passwordsMatch) {
          console.log("[AUTH] Password mismatch - login failed");
          return null;
        }

        console.log("[AUTH] Login successful for user:", user.id);
        return user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // When a user signs in, set the token.id from the user object
      if (user) {
        token.id = user.id as string;
      }
      // Preserve existing token.id if it exists (for subsequent requests)
      // Also use token.sub as fallback (default user ID in JWT)
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // With JWT strategy, use token.id or fall back to token.sub
        // token.sub is the default user ID in NextAuth JWT tokens
        session.user.id = (token.id as string) || (token.sub as string) || "";
      }

      return session;
    },
  },
});
