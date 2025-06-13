import { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

declare module "next-auth" {
  interface Session {
    error?: "RefreshTokenError";
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    expiresAt?: number;
    refreshToken?: string;
    error?: "RefreshTokenError";
  }
}

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.OAUTH2_CLIENT_ID!,
      clientSecret: process.env.OAUTH2_CLIENT_SECRET!,
      issuer: process.env.OAUTH2_ISSUER,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
          refreshToken: account.refresh_token,
        };
      } else if (Date.now() < token.expiresAt! * 1000) {
        return token;
      } else {
        if (!token.refreshToken) throw new TypeError("Missing refresh_token");

        try {
          const response = await fetch(process.env.OAUTH2_TOKEN_URL!, {
            method: "POST",
            body: new URLSearchParams({
              client_id: process.env.OAUTH2_CLIENT_ID!,
              client_secret: process.env.OAUTH2_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken!,
            }),
          });

          const tokensOrError = await response.json();

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_at: number;
            refresh_token?: string;
          };

          return {
            ...token,
            accessToken: newTokens.access_token,
            expiresAt: newTokens.expires_at,
            refreshToken: newTokens.refresh_token
              ? newTokens.refresh_token
              : token.refreshToken,
          };
        } catch (error) {
          console.error("Error refreshing access_token", error);
          token.error = "RefreshTokenError";
          return token;
        }
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      session.accessToken = token.accessToken;
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
