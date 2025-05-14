import type { Metadata } from "next";
import { StackTemplate } from "@/components/templates/StackTemplate";
import { AuthGuard } from "@/components/organisms/AuthGuard";

export const metadata: Metadata = {
  title: "KMC | CVMs",
};

export default function CvmsLayout({
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
