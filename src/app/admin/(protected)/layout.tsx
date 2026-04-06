import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminSession } from "@/lib/auth/admin-session";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminSession();

  return (
    <div className="flex min-h-screen bg-[#fbf9f8]">
      <AdminSidebar />
      <main className="ml-64 flex-grow p-10">{children}</main>
    </div>
  );
}
