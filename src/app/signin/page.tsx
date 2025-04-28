"use client";

import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/atoms/Button";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [session, router]);

  const onSignIn = useCallback(async () => {
    await signIn("keycloak");
  }, []);

  return (
    <div className="flex grow items-center justify-center">
      <div className="flex grow flex-col items-center justify-center p-4">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
            <div className="flex w-fit items-center justify-center md:space-x-4">
              <Image
                src="/images/logo.svg"
                width={64}
                height={64}
                className="h-6 -rotate-16 md:h-16"
                alt="Kippenstummel"
              />
            </div>
            <div className="flex flex-col items-center text-xl font-semibold">
              <span className="block">Kippenstummel</span>
              <span className="block">Management Console</span>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onPress={() => onSignIn()}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
