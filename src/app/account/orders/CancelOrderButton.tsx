"use client";

import { useState } from "react";
import { cancelUserOrder } from "./actions";

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    setErrorMsg("");

    try {
      const response = await cancelUserOrder(orderId);
      if (!response.success) {
        setErrorMsg(response.error || "Failed to cancel order.");
        setIsCancelling(false);
      } else {
        // Successful - close modal and let Next.js handle the server-side revalidation
        setShowModal(false);
      }
    } catch (error) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsCancelling(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs uppercase tracking-widest font-semibold text-red-600 border-b border-red-600 pb-0.5 hover:opacity-70 transition block mt-auto"
      >
        Cancel Order
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-[0_24px_48px_rgba(27,28,28,0.12)] animate-in zoom-in-95 duration-200">
            <h3 className="font-serif text-3xl text-[var(--color-on-surface)] mb-3 font-light">
              Cancel Order
            </h3>
            <p className="text-sm text-[var(--color-secondary)] mb-8 leading-relaxed">
              Are you sure you want to cancel order #{orderId}? We will immediately initiate a full refund to your original payment method.
            </p>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-4 rounded-xl border border-red-100 mb-8 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={isCancelling}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-sans tracking-[0.15em] uppercase text-[var(--color-secondary)] border border-[var(--color-outline-variant)]/40 hover:bg-zinc-50 transition disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={isCancelling}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-full text-xs font-sans tracking-[0.15em] uppercase hover:bg-red-700 transition disabled:opacity-50 flex flex-row items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing
                  </>
                ) : (
                  "Confirm Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
