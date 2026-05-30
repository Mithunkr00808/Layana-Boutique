import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import AdminLoginClient from "./AdminLoginClient";

export default async function AdminLoginPage() {
  // Only redirect if the user is a verified admin.
  // Non-admin users with a regular session should see the login form.
  const adminSession = await getAdminSession();

  if (adminSession) {
    redirect("/admin");
  }

  return <AdminLoginClient />;
}
