"use client";

import { useSession } from "next-auth/react";
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
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
      return;
    }

    if (session?.error === "RefreshTokenError") {
      router.push("/signin");
      return;
    }
  }, [session, status]);

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
