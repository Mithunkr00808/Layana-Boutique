import { adminDb } from "@/lib/firebase/admin";
import { Mail, ShieldCheck, Users } from "lucide-react";

export const dynamic = "force-dynamic";

type CustomerRecord = {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
};

export default async function AdminCustomersPage() {
  let customers: CustomerRecord[] = [];

  if (process.env.FIREBASE_PROJECT_ID) {
    const snapshot = await adminDb.collection("users").limit(24).get();
    customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<CustomerRecord, "id">),
    }));
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-outline)]">
          Client Registry
        </p>
        <h1 className="font-serif text-4xl tracking-tight text-[var(--color-on-surface)]">
          Customers
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
          View customer identities captured in Firebase without leaving the protected admin
          workspace. This route now resolves normally, so the sidebar no longer sends admins into
          a 404 state.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-outline-variant)]/15 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-fixed)] text-[var(--color-primary)]">
            <Users className="size-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
            Profiles
          </p>
          <p className="mt-2 font-serif text-3xl text-[var(--color-on-surface)]">
            {customers.length}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-outline-variant)]/15 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]">
            <Mail className="size-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
            Reachable
          </p>
          <p className="mt-2 font-serif text-3xl text-[var(--color-on-surface)]">
            {customers.filter((customer) => Boolean(customer.email)).length}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-outline-variant)]/15 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-surface)]">
            <ShieldCheck className="size-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
            Protected Access
          </p>
          <p className="mt-2 font-serif text-3xl text-[var(--color-on-surface)]">Admin</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/15 bg-white shadow-sm">
        <div className="border-b border-[var(--color-outline-variant)]/10 px-6 py-5">
          <h2 className="font-serif text-2xl text-[var(--color-on-surface)]">
            Recent Customer Profiles
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container-low)]/60">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                  Customer
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                  Email
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                  Phone
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
                  Firebase ID
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-[var(--color-outline-variant)]/5 transition-colors hover:bg-[var(--color-surface-container-lowest)]"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-on-surface)]">
                      {customer.name || "Unnamed customer"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">
                      {customer.email || "No email"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">
                      {customer.phone || "No phone"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--color-outline)]">
                      {customer.id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-14 text-center text-sm text-[var(--color-on-surface-variant)]"
                  >
                    No customer profiles are available in Firebase yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
