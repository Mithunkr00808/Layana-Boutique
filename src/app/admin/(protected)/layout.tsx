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
      <main className="flex-grow md:ml-64 px-4 pt-20 pb-6 md:p-10 md:pt-10">{children}</main>
    </div>
  );
}
