"use client";

import { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface GoogleSignInButtonProps {
  /** URL to redirect to after successful sign-in */
  redirectTo?: string;
  /** Called after session cookie is set successfully */
  onSuccess?: () => void;
  /** Called when sign-in fails */
  onError?: (error: string) => void;
  /** Button label variant */
  label?: "signin" | "signup";
}

const googleProvider = new GoogleAuthProvider();
// Only request minimal scopes — email and profile
googleProvider.addScope("email");
googleProvider.addScope("profile");
// Always prompt for account selection for explicit user intent
googleProvider.setCustomParameters({ prompt: "select_account" });

export default function GoogleSignInButton({
  redirectTo,
  onSuccess,
  onError,
  label = "signin",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if we just returned from a mobile redirect sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          onSuccess?.();
        }
      })
      .catch((err) => {
        const firebaseError = err as { code?: string; message?: string };
        if (firebaseError.code === "auth/account-exists-with-different-credential") {
          const msg = "An account already exists with this email using a different sign-in method.";
          setError(msg);
          onError?.(msg);
        } else {
          const msg = "Sign-in failed after redirect. Please try again.";
          setError(msg);
          onError?.(msg);
        }
      });
  }, [onError, onSuccess]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Redirect completely leaves the app. No need to clear loading.
        await signInWithRedirect(auth, googleProvider);
      } else {
        // Firebase popup-based Google sign-in
        // After this resolves, AuthContext's onIdTokenChanged fires automatically
        // and handles: session cookie creation, cart migration, and user state.
        // The login/signup page's useEffect then handles redirect when user is set.
        await signInWithPopup(auth, googleProvider);

        // Keep loading state active — the page will redirect once AuthContext
        // sets the user, which unmounts this component. Don't set isLoading=false.
        onSuccess?.();
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      let message = "Sign-in failed. Please try again.";

      switch (firebaseError.code) {
        case "auth/popup-closed-by-user":
          // User intentionally closed — don't show error
          setIsLoading(false);
          return;
        case "auth/popup-blocked":
          // Fallback to redirect if popup is blocked on desktop
          try {
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (redirectErr) {
            message = "Pop-up was blocked and redirect failed. Please allow pop-ups for this site.";
          }
          break;
        case "auth/account-exists-with-different-credential":
          message =
            "An account already exists with this email using a different sign-in method. Try signing in with your email and password instead.";
          break;
        case "auth/network-request-failed":
          message =
            "Network error. Please check your connection and try again.";
          break;
        case "auth/cancelled-popup-request":
          // Another popup was opened — ignore silently
          setIsLoading(false);
          return;
      }

      setError(message);
      onError?.(message);
      setIsLoading(false);
    }
  };

  const buttonText =
    label === "signup" ? "Sign up with Google" : "Sign in with Google";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        id="google-sign-in-button"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-zinc-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{isLoading ? "Connecting..." : buttonText}</span>
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center px-2">{error}</p>
      )}
    </div>
  );
}
