import type { Metadata } from "next";
import { StackTemplate } from "@/components/templates/StackTemplate";
import { AuthGuard } from "@/components/organisms/AuthGuard";

export const metadata: Metadata = {
  title: "KMC | Ident",
};

export default function IdentLayout({
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
