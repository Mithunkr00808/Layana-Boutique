import Razorpay from "razorpay";

let _instance: Razorpay | null = null;

/**
 * Returns the Razorpay client instance, creating it lazily on first call.
 * Throws a descriptive error if required environment variables are missing.
 */
export function getRazorpay(): Razorpay {
  if (_instance) return _instance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay is not configured: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required."
    );
  }

  _instance = new Razorpay({ key_id, key_secret });
  return _instance;
}
