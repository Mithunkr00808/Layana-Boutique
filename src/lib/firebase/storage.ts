import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./config";

const storage = getStorage(app);

export async function uploadImage(file: File): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  const storageRef = ref(storage, `product-images/${id}-${safeName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export { storage };
