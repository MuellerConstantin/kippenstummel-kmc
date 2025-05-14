"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/api";

export default function useApi() {
  return api;
}

export function ApiLogoutInterceptor({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const api = useApi();
  const router = useRouter();

  useEffect(() => {
    const logoutInterceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (
          err.response &&
          err.response.status === 401 &&
          (err.response.data?.error === "BFF_PROXY_AUTHENICATION_ERROR" ||
            err.response.data?.error === "UNAUTHENTICATED_ERROR")
        ) {
          router.push("/signin");
        }

        return Promise.reject(err);
      },
    );

    return () => {
      api.interceptors.response.eject(logoutInterceptor);
    };
  }, [api, router]);

  return children;
}
