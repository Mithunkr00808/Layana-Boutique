import { adminDb } from "@/lib/firebase/admin";
import type { Address } from "@/lib/data";

function normalizeAddress(
  addressId: string,
  input: Partial<Address> | undefined
): Address {
  return {
    id: input?.id ?? addressId,
    fullName: input?.fullName ?? "",
    phone: input?.phone ?? "",
    streetAddress: input?.streetAddress ?? "",
    city: input?.city ?? "",
    state: input?.state ?? "",
    postalCode: input?.postalCode ?? "",
    addressType: input?.addressType,
  };
}

export async function getUserAddressById(
  uid: string,
  addressId: string
): Promise<Address | null> {
  const addressDoc = await adminDb
    .collection("users")
    .doc(uid)
    .collection("addresses")
    .doc(addressId)
    .get()
    .catch(() => null);

  if (addressDoc?.exists) {
    return normalizeAddress(addressDoc.id, addressDoc.data() as Partial<Address>);
  }

  const userDoc = await adminDb.collection("users").doc(uid).get();
  const userData = userDoc.data();
  if (userData && Array.isArray(userData.addresses)) {
    const match = (userData.addresses as Address[]).find((address) => address.id === addressId);
    if (match) {
      return normalizeAddress(match.id, match);
    }
  }

  return null;
}
