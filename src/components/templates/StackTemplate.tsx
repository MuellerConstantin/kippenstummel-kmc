"use client";

import React, { useMemo } from "react";
import { Navbar } from "@/components/organisms/Navbar";
import { Footer } from "@/components/molecules/Footer";
import { useEnv } from "@/contexts/RuntimeConfigProvider";
import { MessageBannerCarousel } from "../organisms/MessageBannerCarousel";

export function StackTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isTestSystem = useEnv("NEXT_PUBLIC_IS_TEST_SYSTEM") === "true";
  const isPreRelease = useEnv("NEXT_PUBLIC_IS_PRE_RELEASE") === "true";

  const messages = useMemo(() => {
    const messages: {
      title: string;
      description: string;
      variant?: "default" | "success" | "error" | "info" | "warning";
    }[] = [];

    if (isTestSystem) {
      messages.push({
        title: "Notice:",
        description:
          "This is a test environment. Any changes or inputs here will not affect the live system.",
        variant: "warning",
      });
    }

    if (isPreRelease) {
      messages.push({
        title: "Pre-Release:",
        description:
          "This is a not officially released version. Changes and errors may occur.",
        variant: "warning",
      });
    }

    return messages;
  }, [isTestSystem, isPreRelease]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header>
        <Navbar />
        <MessageBannerCarousel messages={messages} />
      </header>
      <main className="flex grow flex-col bg-white dark:bg-slate-800">
        {children}
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
