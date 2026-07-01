import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },

      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.username, username),
        });

        if (!user || user.status !== "ACTIVE") {
          return null;
        }

        const validPassword = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & {
          id?: string;
          role?: unknown;
        }).id = token.id as string;

        (session.user as typeof session.user & {
          role?: unknown;
        }).role = token.role;
      }

      return session;
    },
  },
});