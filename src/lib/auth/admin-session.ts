import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";

export type AdminSession = {
  uid: string;
  email: string | null;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    if (!decoded.admin) {
      return null;
    }

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
    };
  } catch (error) {
    console.warn("Failed to verify admin session:", (error as Error)?.message || String(error));
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function assertAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
