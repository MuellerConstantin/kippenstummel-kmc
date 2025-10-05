"use client";

import React from "react";
import { Navbar } from "@/components/organisms/Navbar";
import { Footer } from "@/components/molecules/Footer";
import { useEnv } from "@/contexts/RuntimeConfigProvider";
import TestSystemBanner from "../organisms/TestSystemBanner";
import PreReleaseBanner from "../organisms/PreReleaseBanner";

export function StackTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isTestSystem = useEnv("NEXT_PUBLIC_IS_TEST_SYSTEM") === "true";
  const isPreRelease = useEnv("NEXT_PUBLIC_IS_PRE_RELEASE") === "true";

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header>
        <Navbar />
        {isTestSystem && <TestSystemBanner />}
        {isPreRelease && <PreReleaseBanner />}
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
