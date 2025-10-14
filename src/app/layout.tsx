import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { StoreProvider } from "@/store";
import { AuthProvider } from "@/components/organisms/AuthProvider";
import { ApiLogoutInterceptor } from "@/hooks/useApi";

import "./globals.css";
import { RuntimeConfigProvider } from "@/contexts/RuntimeConfigProvider";

const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KMC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Kippenstummel" />
      </head>
      <body className={`${lato.variable} bg-white dark:bg-slate-800`}>
        <AuthProvider>
          <StoreProvider>
            <RuntimeConfigProvider>
              <ApiLogoutInterceptor>{children}</ApiLogoutInterceptor>
            </RuntimeConfigProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
