/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to send reset email. Ensure the email is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-6 lg:px-8 bg-[#fbf9f8]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif tracking-tight text-zinc-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-lg sm:px-10 border border-zinc-100">
          {success ? (
            <div className="rounded-md bg-green-50 p-4 border border-green-100">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Reset link sent
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
                    </p>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                    >
                      Return to sign in
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </button>
              </div>

              <div className="mt-6 text-center text-sm">
                <Link
                  href="/login"
                  className="font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
