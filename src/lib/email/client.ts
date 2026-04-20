import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (resendClient) return resendClient;

  // Uses RESEND_API_KEY from environment. Falls back to mock string to avoid crashing in dev
  // if you forgot to set up the key.
  const apiKey = process.env.RESEND_API_KEY || "re_mock_key_only_for_dev";
  resendClient = new Resend(apiKey);
  return resendClient;
}

export const SENDER_EMAIL =
  process.env.RESEND_SENDER_EMAIL || "Layana Boutique <orders@layanaboutique.com>";
export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "admin@layanaboutique.com";
