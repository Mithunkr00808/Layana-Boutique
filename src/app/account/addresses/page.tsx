"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterDynamic";
import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/lib/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus, Edit, Trash2, Info } from "lucide-react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number"),
  streetAddress: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Must be a valid 6-digit PIN code"),
  addressType: z.enum(["home", "work", "other"]).default("home"),
});

type AddressFormValues = z.infer<typeof addressSchema>;
type Address = AddressFormValues & { id: string };

export default function AddressesPage() {
  const { user, loading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      postalCode: "",
      addressType: "home",
    },
  });

  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const stored = (userDoc.data()?.addresses as Address[] | undefined) || [];
        setAddresses(stored);
        const data = userDoc.data() || {};
        const fullName = data.fullName || data.firstName || user.displayName || user.email?.split("@")[0] || "";
        setProfileName(fullName);
        setProfilePhone(data.phone || "");
        reset((prev) => ({
          ...prev,
          fullName: fullName || prev.fullName,
          phone: data.phone || prev.phone,
        }));
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
      const newAddress: Address = { ...data, id: crypto.randomUUID() };
      const updated = [...addresses, newAddress];
      await setDoc(doc(db, "users", user.uid), { addresses: updated }, { merge: true });
      setAddresses(updated);
      setIsAdding(false);
      reset({
        fullName: profileName || "",
        phone: profilePhone || "",
        streetAddress: "",
        city: "",
        state: "",
        postalCode: "",
        addressType: "home",
        city: "",
        state: "",
        addressType: "home",
      });
    } catch (error) {
      console.error("Failed to save address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAddress = async (id: string) => {
    if (!user) return;
    try {
      const updated = addresses.filter((addr) => addr.id !== id);
      await setDoc(doc(db, "users", user.uid), { addresses: updated }, { merge: true });
      setAddresses(updated);
    } catch (error) {
      console.error("Failed to remove address:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm text-zinc-500">Loading addresses…</div>
      </div>
    );
  }

  const maybeAutoFillCityState = async (pin: string, currentCity: string, currentState: string) => {
    if (pin.length !== 6 || currentCity || currentState) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = (await res.json()) as any[];
      const office = data?.[0]?.PostOffice?.[0];
      if (office) {
        reset((prev) => ({
          ...prev,
          city: prev.city || office?.District || "",
          state: prev.state || office?.State || "",
        }));
      }
    } catch (err) {
      console.warn("PIN lookup failed", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface,#fbf9f8)] text-[var(--color-on-surface,#1b1c1c)]">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="hidden md:block md:col-span-3 lg:col-span-2">
            <AccountSidebar active="addresses" email={user?.email || ""} />
          </div>

          <section className="md:col-span-9 lg:col-span-10">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight">Addresses</h1>
                <p className="mt-4 text-zinc-500 max-w-md font-light leading-relaxed">
                  Manage your delivery destinations and billing details for a seamless checkout experience.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAdding((v) => !v);
                  reset((prev) => ({
                    ...prev,
                    fullName: profileName || prev.fullName,
                    phone: profilePhone || prev.phone,
                  }));
                }}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center gap-2 uppercase tracking-[0.2em] text-[12px] font-semibold"
              >
                <Plus size={18} strokeWidth={1.5} /> {isAdding ? "Close Form" : "Add New Address"}
              </button>
            </header>

            {isAdding && (
              <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm mb-12">
                <h3 className="text-xl font-serif mb-6">Add a new address</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-zinc-600 mb-1">Full Name</label>
                      <input
                        {...register("fullName")}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                      />
                      {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-600 mb-1">Mobile Number</label>
                      <input
                        {...register("phone")}
                        maxLength={10}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full px-4 py-3 border border-zinc-300 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-600 mb-1">Street Address</label>
                    <input
                      {...register("streetAddress")}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                    />
                    {errors.streetAddress && <p className="mt-1 text-sm text-red-600">{errors.streetAddress.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm text-zinc-600 mb-1">City</label>
                      <input
                        {...register("city")}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-600 mb-1">State</label>
                      <input
                        {...register("state")}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                      />
                      {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-600 mb-1">PIN Code</label>
                      <input
                        {...register("postalCode", {
                          onChange: (e) =>
                            maybeAutoFillCityState(e.target.value, watch("city"), watch("state")),
                        })}
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full px-4 py-3 border border-zinc-300 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                      />
                      {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-600 mb-2">Address Type</label>
                    <div className="flex gap-3">
                      {["home", "work", "other"].map((type) => {
                        const isActive = watch("addressType") === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setValue("addressType", type as AddressFormValues["addressType"], { shouldDirty: true })}
                            className={`px-4 py-2 rounded-full border text-sm capitalize transition ${
                              isActive
                                ? "bg-blue-900 text-white border-blue-900"
                                : "bg-white text-zinc-700 border-zinc-300 hover:border-blue-900 hover:text-blue-900"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                    <input type="hidden" {...register("addressType")} />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-6 py-3 border border-zinc-300 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-blue-900 text-white rounded-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {addresses.map((address, idx) => (
                <div
                  key={address.id}
                  className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between min-h-[280px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-600">
                        {address.addressType ? address.addressType : idx === 0 ? "Home" : "Address"}
                      </span>
                      <MapPin size={18} className="text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-serif mb-3">{address.fullName}</h3>
                    <div className="text-zinc-600 font-light space-y-1 leading-relaxed">
                      <p>{address.streetAddress}</p>
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="mt-3 text-sm">+91 {address.phone}</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-zinc-200 flex items-center gap-4">
                    <button className="text-xs uppercase tracking-[0.2em] font-semibold hover:text-blue-900 transition-colors flex items-center gap-1">
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => removeAddress(address.id)}
                      className="text-xs uppercase tracking-[0.2em] font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setIsAdding(true)}
                className="group relative bg-[var(--color-surface,#fbf9f8)] flex flex-col items-center justify-center min-h-[280px] border border-dashed border-zinc-300 hover:border-blue-900/50 hover:bg-white transition-all duration-500"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 rounded-full border border-zinc-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-900 group-hover:border-blue-900 transition-all duration-400">
                    <Plus size={18} className="text-zinc-500 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500 group-hover:text-blue-900 transition-colors">
                    Add New Address
                  </span>
                </div>
              </button>
            </div>

            {addresses.length === 0 && !isAdding && (
              <div className="mt-10 py-12 text-center border border-dashed border-zinc-200 rounded-xl bg-white">
                <MapPin size={36} className="mx-auto text-zinc-300 mb-3" />
                <p className="text-sm text-zinc-500">No addresses yet. Add one to speed up checkout.</p>
              </div>
            )}

            <div className="mt-16 p-8 bg-zinc-50 rounded-xl flex items-start gap-4 border border-zinc-200/60">
              <Info size={18} className="text-blue-900 mt-1" />
              <div className="space-y-2 text-sm text-zinc-600">
                <h4 className="font-semibold tracking-[0.15em] uppercase text-xs text-zinc-700">
                  International Shipping
                </h4>
                <p className="leading-relaxed">
                  Changes to your default address apply to future orders. For active shipments, contact concierge at{" "}
                  <span className="text-blue-900 font-medium">concierge@ateliernoir.com</span>.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
