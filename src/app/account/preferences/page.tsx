/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updatePreferences } from "@/app/account/actions";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@/lib/firebase/config";
import { updatePassword, signInWithEmailAndPassword } from "firebase/auth";

const prefSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number (starts with 6-9)"),
  visibility: z.boolean().optional(),
  newsletter: z.boolean().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(6, "Confirm your new password"),
  })
  .refine((vals) => vals.newPassword === vals.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type PrefForm = z.infer<typeof prefSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function PreferencesPage() {
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PrefForm>({
    resolver: zodResolver(prefSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      visibility: false,
      newsletter: true,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    async function loadPrefs() {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data() || {};
        const fullName = data.fullName || data.name || user.displayName || user.email?.split("@")[0] || "";
        const [firstNameDefault, ...rest] = fullName.trim().split(" ");
        const lastNameDefault = rest.join(" ");

        reset({
          firstName: data.firstName || firstNameDefault || "",
          lastName: data.lastName || lastNameDefault || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          visibility: data.preferences?.visibility ?? false,
          newsletter: data.preferences?.newsletter ?? true,
        });
      } catch (e) {
        console.error("Failed to load preferences:", e);
      } finally {
        setInitialLoaded(true);
      }
    }
    loadPrefs();
  }, [user, reset]);

  const onSubmit = async (values: PrefForm) => {
    if (!user) return;
    setSaving(true);
    try {
      const result = await updatePreferences({
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        phone: values.phone,
        visibility: !!values.visibility,
        newsletter: !!values.newsletter,
      });

      if (!result.success) {
        console.error("Failed to save preferences:", result.error);
      }
    } catch (e) {
      console.error("Failed to save preferences:", e);
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    if (!user || !auth.currentUser) {
      setPasswordError("Session is stale. Please sign out and sign back in to update your password.");
      return;
    }
    const emailForAuth = auth.currentUser.email || user.email;
    if (!emailForAuth) {
      setPasswordError("No email found for this session. Please sign in again.");
      return;
    }

    const hasPasswordProvider = auth.currentUser.providerData.some((p) => p.providerId === "password");
    if (!hasPasswordProvider) {
      setPasswordError(
        "This account was created with a social/provider login. Re-sign in with email & password to change it here."
      );
      return;
    }

    setPasswordMessage(null);
    setPasswordError(null);
    try {
      // Fallback: sign in again with email/password to refresh credentials, then update password
      const signedIn = await signInWithEmailAndPassword(auth, emailForAuth, values.currentPassword);

      await updatePassword(signedIn.user, values.newPassword);

      // Refresh session cookie after password change
      const idToken = await signedIn.user.getIdToken(true);
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      setPasswordMessage("Password updated successfully.");
      resetPasswordForm();
    } catch (err: any) {
      const code = err?.code || "auth/error";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setPasswordError("Current password is incorrect or session expired.");
        return;
      }
      if (code === "auth/weak-password") {
        setPasswordError("New password is too weak.");
        return;
      }
      setPasswordError("Could not update password. Please try again.");
      console.error("Password update failed:", err);
    }
  };

  if (loading || !initialLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm text-zinc-500">Loading preferences…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface,#fbf9f8)] text-[var(--color-on-surface,#1b1c1c)]">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="hidden md:block md:col-span-3 lg:col-span-2">
            <AccountSidebar active="preferences" email={user?.email || ""} />
          </div>

          <section className="md:col-span-9 lg:col-span-10">
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight">Account Preferences</h1>
              <p className="text-sm text-zinc-500 max-w-xl mt-3">
                Refine your experience. Manage profile details, security, and how we keep in touch.
              </p>
            </header>

            <div className="space-y-16">
              <section className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4">
                  <h2 className="text-xl font-serif mb-2">Account Details</h2>
                  <p className="text-sm text-zinc-500">
                    Manage your core identity and security credentials.
                  </p>
                </div>
                <div className="md:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                        First Name
                      </label>
                      <input
                        {...register("firstName")}
                        className="w-full bg-transparent border-b border-zinc-300 py-3 focus:outline-none focus:border-blue-900 transition-colors font-light"
                        placeholder="First name"
                      />
                      {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                        Last Name
                      </label>
                      <input
                        {...register("lastName")}
                        className="w-full bg-transparent border-b border-zinc-300 py-3 focus:outline-none focus:border-blue-900 transition-colors font-light"
                        placeholder="Last name"
                      />
                      {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                        Phone Number
                      </label>
                      <input
                        {...register("phone")}
                        maxLength={10}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full bg-transparent border-b border-zinc-300 py-3 focus:outline-none focus:border-blue-900 transition-colors font-light"
                        placeholder="10-digit mobile"
                      />
                      {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                      Email Address
                    </label>
                    <input
                      {...register("email")}
                      className="w-full bg-transparent border-b border-zinc-300 py-3 focus:outline-none focus:border-blue-900 transition-colors font-light text-zinc-400"
                      placeholder="you@example.com"
                      type="email"
                      readOnly
                      aria-readonly
                    />
                    <p className="text-xs text-zinc-500 mt-1">Email is managed through your account sign-in and cannot be edited here.</p>
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4">
                  <h2 className="text-xl font-serif mb-2">Password &amp; Security</h2>
                  <p className="text-sm text-zinc-500">Update your password securely.</p>
                </div>
                <div className="md:col-span-8 space-y-6">
                  {auth.currentUser?.providerData.some((p) => p.providerId === "password") ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                            Current Password
                          </label>
                          <input
                            type="password"
                            {...registerPassword("currentPassword")}
                            className="w-full bg-transparent border-b border-zinc-300 py-3 focus:outline-none focus:border-blue-900 transition-colors font-light"
                            placeholder="••••••••"
                          />
                          {passwordErrors.currentPassword && (
                            <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                            New Password
                          </label>
                          <input
                            type="password"
                            {...registerPassword("newPassword")}
                            className="w-full bg-transparent border-b border-zinc-300 py-3 focus:outline-none focus:border-blue-900 transition-colors font-light"
                            placeholder="New password"
                          />
                          {passwordErrors.newPassword && (
                            <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="md:w-1/2">
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          {...registerPassword("confirmNewPassword")}
                          className="w-full bg-transparent border-b border-zinc-300 py-3 focus:outline-none focus:border-blue-900 transition-colors font-light"
                          placeholder="Repeat new password"
                        />
                        {passwordErrors.confirmNewPassword && (
                          <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmNewPassword.message}</p>
                        )}
                      </div>

                      {passwordMessage && (
                        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
                          {passwordMessage}
                        </p>
                      )}
                      {passwordError && (
                        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                          {passwordError}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                          onClick={() => resetPasswordForm()}
                          type="button"
                          className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-800 transition-colors underline underline-offset-8"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitPassword(onPasswordSubmit)}
                          disabled={isChangingPassword}
                          className="px-8 py-3 bg-blue-900 text-white text-xs uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-blue-900/15 hover:shadow-blue-900/25 hover:scale-[1.01] transition disabled:opacity-50"
                        >
                          {isChangingPassword ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <p className="text-sm font-medium text-zinc-800">
                          Signed in with Google
                        </p>
                      </div>
                      <p className="text-sm text-zinc-500">
                        Your account is secured by Google. To change your password or manage security settings, visit your Google Account.
                      </p>
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-900 hover:opacity-70 transition-opacity"
                      >
                        Manage Google Security
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                      </a>
                    </div>
                  )}
                </div>
              </section>

              <footer className="flex items-center justify-end gap-6 pt-8 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-800 transition-colors underline underline-offset-8"
                >
                  Cancel Changes
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving || !isDirty}
                  className="px-10 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white text-xs uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-blue-900/15 hover:shadow-blue-900/25 hover:scale-[1.01] transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </footer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
