import { adminDb } from "@/lib/firebase/admin";
import CatalogClient from "./_components/CatalogClient";

export const dynamic = "force-dynamic";

type CatalogProduct = {
  id: string;
  name?: string;
  category?: string;
  price?: string;
  discountPrice?: string;
  quantity?: number;
  image?: string;
  alt?: string;
};

export default async function CatalogPage() {
  let products: CatalogProduct[] = [];

  if (process.env.FIREBASE_PROJECT_ID) {
    const snapshot = await adminDb.collection("products").get();
    // JSON round-trip strips non-serializable Firestore Timestamp objects
    products = JSON.parse(
      JSON.stringify(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CatalogProduct, "id">),
        }))
      )
    );
  }

  return <CatalogClient products={products} />;
}
