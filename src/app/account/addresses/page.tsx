"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { ArrowLeft, Plus, MapPin, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number"),
  streetAddress: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Must be a valid 6-digit PIN code"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface Address extends AddressFormValues {
  id: string;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().addresses) {
          setAddresses(userDoc.data().addresses);
        }
      } catch (error) {
        console.error("Failed to load addresses:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAddresses();
  }, [user]);

  const onSubmit = async (data: AddressFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const newAddress: Address = {
        ...data,
        id: crypto.randomUUID(),
      };
      
      const updatedAddresses = [...addresses, newAddress];
      await setDoc(doc(db, "users", user.uid), { addresses: updatedAddresses }, { merge: true });
      
      setAddresses(updatedAddresses);
      setIsAdding(false);
      reset();
    } catch (error) {
      console.error("Failed to save address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAddress = async (idOfAddressToRemove: string) => {
    if (!user) return;
    try {
      const updatedAddresses = addresses.filter(addr => addr.id !== idOfAddressToRemove);
      await setDoc(doc(db, "users", user.uid), { addresses: updatedAddresses }, { merge: true });
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Failed to remove address:", error);
    }
  };

  if (isLoading) {
    return <div className="min-h-[60vh] flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-24 min-h-[80vh]">
      <div className="max-w-3xl mx-auto">
        <Link href="/account" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to Account
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl tracking-tight text-zinc-900">Your Addresses</h1>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Address
            </button>
          )}
        </div>

        {isAdding && (
          <div className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200 shadow-sm mb-10">
            <h2 className="text-xl font-semibold mb-6">Add a new delivery address</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                  <input {...register("fullName")} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-zinc-900 focus:border-zinc-900" />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Mobile Number (10 digit)</label>
                  <input {...register("phone")} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-zinc-900 focus:border-zinc-900" />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Street Address, Apt, Floor</label>
                <input {...register("streetAddress")} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-zinc-900 focus:border-zinc-900" />
                {errors.streetAddress && <p className="mt-1 text-sm text-red-600">{errors.streetAddress.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">City</label>
                  <input {...register("city")} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-zinc-900 focus:border-zinc-900" />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">State</label>
                  <input {...register("state")} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-zinc-900 focus:border-zinc-900" />
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">PIN Code</label>
                  <input {...register("postalCode")} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-zinc-900 focus:border-zinc-900" />
                  {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 border border-zinc-300 rounded-md font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-zinc-900 text-white rounded-md font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="border border-zinc-200 rounded-xl p-6 bg-white relative group flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">{address.fullName}</h3>
                <p className="text-zinc-600 text-sm mb-1">{address.streetAddress}</p>
                <p className="text-zinc-600 text-sm mb-1">{address.city}, {address.state} {address.postalCode}</p>
                <p className="text-zinc-600 text-sm mt-3 flex items-center">
                  <span className="font-medium mr-2">Phone:</span> +91 {address.phone}
                </p>
              </div>
              <button 
                onClick={() => removeAddress(address.id)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Delete address"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {addresses.length === 0 && !isAdding && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-xl">
              <MapPin size={48} className="mx-auto text-zinc-300 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 mb-1">No addresses saved</h3>
              <p className="text-zinc-500">Add an address to make checkout faster next time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
