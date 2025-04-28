"use client";

import React from "react";
import { Navbar } from "@/components/organisms/Navbar";
import { Footer } from "@/components/molecules/Footer";

export function StackTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header>
        <Navbar />
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
