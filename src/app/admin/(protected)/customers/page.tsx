import { adminDb } from "@/lib/firebase/admin";
import { Mail, ShieldCheck, Users } from "lucide-react";
import CustomersClient from "./_components/CustomersClient";

export const dynamic = "force-dynamic";

type CustomerRecord = {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
};

type CustomerOrder = {
  id: string;
  total: number;
  status: string;
  createdAt: string | null;
  itemCount: number;
};

export default async function AdminCustomersPage() {
  let customers: CustomerRecord[] = [];
  let customerOrders: Record<string, CustomerOrder[]> = {};

  if (process.env.FIREBASE_PROJECT_ID) {
    // Fetch subset of customers to prevent payload freezing
    const snapshot = await adminDb.collection("users").limit(100).get();
    customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<CustomerRecord, "id">),
    }));

    // Fetch subset of orders and group by userId for order history
    const ordersSnap = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(100).get();
    ordersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;
      if (!userId) return;

      if (!customerOrders[userId]) {
        customerOrders[userId] = [];
      }

      const items = Array.isArray(data.items) ? data.items : [];
      customerOrders[userId].push({
        id: doc.id,
        total: data.total || data.subtotal || 0,
        status: data.status || "paid",
        createdAt: data.createdAt
          ? new Date(
              data.createdAt.seconds ? data.createdAt.seconds * 1000 : data.createdAt
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : null,
        itemCount: items.reduce(
          (sum: number, item: { quantity?: number }) => sum + (item.quantity || 1),
          0
        ),
      });
    });
  }

  const reachableCount = customers.filter((c) => Boolean(c.email)).length;
  const totalSpend = Object.values(customerOrders)
    .flat()
    .reduce((sum, o) => sum + o.total, 0);

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
          View customer profiles and their purchase history from the admin workspace.
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
            {reachableCount}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-outline-variant)]/15 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-surface)]">
            <ShieldCheck className="size-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-outline)]">
            Lifetime Revenue
          </p>
          <p className="mt-2 font-serif text-3xl text-[var(--color-on-surface)]">
            ₹{totalSpend.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <CustomersClient customers={customers} customerOrders={customerOrders} />
    </div>
  );
}
