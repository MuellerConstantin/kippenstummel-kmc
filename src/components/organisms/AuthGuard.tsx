"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (session?.error === "RefreshTokenError") {
      signOut();
      return;
    }
  }, [session, status, router]);

  if (
    status === "loading" ||
    !session ||
    session?.error === "RefreshTokenError"
  ) {
    return null;
  } else {
    return children;
  }
}
