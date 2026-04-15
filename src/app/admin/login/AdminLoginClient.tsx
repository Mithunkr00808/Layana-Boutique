'use client';

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Loader2, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminLoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.replace("/admin");
    }
  }, [authLoading, isAdmin, router, user]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      if (!tokenResult.claims.admin) {
        await auth.signOut();
        const claims = Object.keys(tokenResult.claims).filter(
          (claim) =>
            !["sub", "aud", "auth_time", "iss", "iat", "exp", "user_id", "firebase"].includes(
              claim
            )
        );
        setError(`Access denied. No admin claim found. Found: [${claims.join(", ") || "none"}]`);
        setLoading(false);
        return;
      }
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      const message = (error as { message?: string })?.message;

      if (
        code === "auth/invalid-credential" ||
        code === "auth/user-not-found" ||
        code === "auth/wrong-password"
      ) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(message || "An error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  if (authLoading || (!!user && isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf9f8]">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbf9f8] px-4">
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 text-center duration-700">
        <h1 className="mb-2 font-serif text-4xl font-bold text-[#1b1c1c]">Layana Boutique</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          Management Suite Access
        </p>
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 rounded-2xl border border-[#c3c6d6]/10 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] duration-1000 delay-150">
        <form onSubmit={handleLogin} className="space-y-6">
          {error ? (
            <div className="animate-in rounded-xl border border-red-100 bg-red-50 p-4 text-xs font-medium text-red-600 duration-500">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border-none bg-[#fbf9f8] py-4 pl-12 pr-4 text-sm outline-none transition-all focus:ring-1 focus:ring-black"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Secret Key
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border-none bg-[#fbf9f8] py-4 pl-12 pr-12 text-sm outline-none transition-all focus:ring-1 focus:ring-black"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-black"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-black py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-neutral-800"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Authenticate
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={14} />
              </>
            )}
            <div className="absolute inset-0 translate-y-full bg-white/5 transition-transform duration-500 group-hover:translate-y-0" />
          </button>
        </form>

        <div className="mt-8 border-t border-gray-50 pt-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
            Restricted access area
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0051C3]/20" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0051C3]/40 delay-75" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0051C3]/60 delay-150" />
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="mt-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-black"
      >
        <ArrowRight className="rotate-180" size={12} />
        Back to boutique
      </Link>
    </div>
  );
}
