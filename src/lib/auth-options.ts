import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = 5 * 60; // 5 minutes

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null;
    accessToken?: string;
    expiresAt?: number;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        if (!process.env.ADMIN_USER) {
          throw new Error("ADMIN_USER is not defined");
        }

        if (!process.env.ADMIN_PASSWORD) {
          throw new Error("ADMIN_PASSWORD is not defined");
        }

        const adminUser = process.env.ADMIN_USER;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (
          credentials.username === adminUser &&
          bcryptjs.compareSync(credentials.password, adminPass)
        ) {
          return { id: credentials.username, name: credentials.username };
        }

        return null;
      },
    }),
  ],
  jwt: {
    maxAge: 7 * 86400, // 7 days
  },
  session: {
    strategy: "jwt",
    maxAge: 1 * 86400, // 1 day
    updateAge: 6 * 3600, // 6 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }

      if (user) {
        const accessToken = jwt.sign(
          { username: user.name },
          process.env.JWT_SECRET,
          {
            algorithm: "HS256",
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            subject: user.id,
          },
        );

        token.sub = user.id;
        token.username = user.name;
        token.accessToken = accessToken;
        token.expiresAt = Date.now() + ACCESS_TOKEN_EXPIRES_IN * 1000;

        return token;
      }

      if (
        token.accessToken &&
        token.expiresAt &&
        Date.now() >= token.expiresAt
      ) {
        const accessToken = jwt.sign(
          { username: token.username },
          process.env.JWT_SECRET,
          {
            algorithm: "HS256",
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            subject: token.sub,
          },
        );

        token.accessToken = accessToken;
        token.expiresAt = Date.now() + ACCESS_TOKEN_EXPIRES_IN * 1000;

        return token;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.username;
        session.accessToken = token.accessToken;
      }

      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/not-found",
    signOut: "/not-found",
    verifyRequest: "/not-found",
    newUser: "/not-found",
  },
};
