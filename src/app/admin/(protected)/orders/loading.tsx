import AdminLoader from "@/app/admin/_components/AdminLoader";

export default function OrdersLoading() {
  return <AdminLoader title="Fetching orders..." subtitle="Gathering latest transactions" />;
}
