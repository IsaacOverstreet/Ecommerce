// app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import AdminSessionWrapper from "@/components/shared-component/sessionWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Protect all admin routes
  if (!session) {
    redirect("/admin/Login");
  }

  return (
    <>
      <AdminSessionWrapper>{children}</AdminSessionWrapper>
    </>
  );
}
