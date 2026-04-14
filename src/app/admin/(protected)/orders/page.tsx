import { getAllOrders } from "@/lib/data";
import OrdersClient from "./_components/OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const orders = await getAllOrders();

  // Serialize Firestore timestamps to ISO strings for the client
  const serializedOrders = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt
      ? new Date(
          o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null,
  }));

  return <OrdersClient orders={serializedOrders} expandId={params.id as string} />;
}
