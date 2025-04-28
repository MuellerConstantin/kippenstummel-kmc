import NextAuth, { AuthOptions, User } from "next-auth";
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
        if (!token.refresh_token) throw new TypeError("Missing refresh_token");

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
            expires_in: number;
            refresh_token?: string;
          };

          return {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            refresh_token: newTokens.refresh_token
              ? newTokens.refresh_token
              : token.refresh_token,
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
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
