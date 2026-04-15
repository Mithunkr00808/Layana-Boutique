import { adminDb } from "@/lib/firebase/admin";

type AdminAuditEvent = {
  actorUid: string;
  actorEmail: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
};

export async function logAdminAuditEvent(event: AdminAuditEvent): Promise<void> {
  await adminDb.collection("adminAuditLogs").add({
    ...event,
    metadata: event.metadata || {},
    createdAt: new Date().toISOString(),
  });
}

