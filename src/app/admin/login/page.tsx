import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import AdminLoginClient from "./AdminLoginClient";

export default async function AdminLoginPage() {
  const adminSession = await getAdminSession();

  if (adminSession) {
    redirect("/admin");
  }

  return <AdminLoginClient />;
}
