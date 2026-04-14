import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

type SessionOptions = {
  checkRevoked?: boolean;
};

async function readSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value ?? null;
}

export async function getSessionClaims(
  options: SessionOptions = {}
): Promise<DecodedIdToken | null> {
  const sessionCookie = await readSessionCookie();
  if (!sessionCookie) {
    return null;
  }

  try {
    return await adminAuth.verifySessionCookie(sessionCookie, options.checkRevoked ?? true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Failed to verify user session:", message);
    return null;
  }
}

export async function getSessionUid(
  options: SessionOptions = {}
): Promise<string | null> {
  const claims = await getSessionClaims(options);
  return claims?.uid ?? null;
}

export async function requireSessionUid(
  options: SessionOptions = {}
): Promise<string> {
  const uid = await getSessionUid(options);
  if (!uid) {
    throw new Error("Unauthenticated");
  }

  return uid;
}
