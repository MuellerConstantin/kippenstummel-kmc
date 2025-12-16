import type { Metadata } from "next";
import { StackTemplate } from "@/components/templates/StackTemplate";
import { AuthGuard } from "@/components/organisms/AuthGuard";

export const metadata: Metadata = {
  title: "Jobs",
};

export default function JobsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <StackTemplate>{children}</StackTemplate>
    </AuthGuard>
  );
}
