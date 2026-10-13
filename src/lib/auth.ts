import "server-only";

import { compare } from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

export async function loginWithEmail(email?: string, password?: string) {
  if (!email || !password) return null;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user?.password) return null;
  const isPasswordValid = await compare(password, user.password);
  return isPasswordValid ? user : null;
}

function oauthProviders() {
  const providers = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      })
    );
  }
  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GithubProvider({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      })
    );
  }
  return providers;
}

/** Which OAuth buttons to render on the auth pages. */
export const enabledOAuthProviders = {
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  github: Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    ...oauthProviders(),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await loginWithEmail(
          credentials?.email,
          credentials?.password
        );
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: { signIn: "/auth/sign-in" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (!user) return token;

      if (account && account.provider !== "credentials") {
        // OAuth: make sure there is a matching DB user so the rest of the
        // app (projects, billing) can key off a real ObjectId.
        if (!user.email) return token;
        const dbUser = await prisma.user.upsert({
          where: { email: user.email.toLowerCase() },
          update: {},
          create: {
            email: user.email.toLowerCase(),
            name: user.name ?? user.email.split("@")[0],
            image: user.image,
          },
        });
        return { ...token, id: dbUser.id };
      }

      return { ...token, id: user.id };
    },
    session({ session, token }) {
      return {
        ...session,
        user: { ...session.user, id: token.id ?? "" },
      };
    },
  },
};

/** Server-side session helper (RSC, route handlers, server actions). */
export function auth() {
  return getServerSession(authOptions);
}
