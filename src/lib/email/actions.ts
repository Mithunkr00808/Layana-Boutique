import { adminDb } from "@/lib/firebase/admin";
import { getResendClient, SENDER_EMAIL } from "./client";
import { captureTelemetryError } from "@/lib/telemetry";
import { OrderConfirmationEmail } from "./templates/OrderConfirmationEmail";
import { OrderStatusEmail } from "./templates/OrderStatusEmail";

export async function sendOrderConfirmationEmail(orderId: string) {
  try {
    const resend = getResendClient();
    if (!process.env.RESEND_API_KEY) {
      console.warn("Skipping email send: RESEND_API_KEY is not set.");
      return;
    }

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) return;
    
    const order = orderDoc.data();
    if (!order) return;

    // Fetch user details for the email and name if not present directly on order
    let email = order.email;
    let customerName = order.customerName || "Customer";

    if (!email && order.userId) {
      const userDoc = await adminDb.collection("users").doc(order.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        email = userData?.email;
        customerName = userData?.firstName || userData?.fullName || "Customer";
      }
    }

    if (!email) {
      console.warn(`No email found for order ${orderId}, skipping confirmation email.`);
      return;
    }

    const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: order.currency || 'INR' });
    
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: `Order Confirmed: #${orderId.slice(-6).toUpperCase()}`,
      react: OrderConfirmationEmail({
        orderId,
        customerName,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: formatter.format(item.rawPrice || 0),
          size: item.size,
          image: item.image,
        })),
        shippingAddress: order.address ? {
          fullName: order.address.fullName,
          phone: order.address.phone,
          streetAddress: order.address.streetAddress,
          city: order.address.city,
          state: order.address.state,
          postalCode: order.address.postalCode,
        } : {},
        totalAmount: formatter.format(order.total || 0),
      }),
    });

    if (error) {
      console.error("Resend API Error (Confirmation):", error);
    } else {
      console.log("Email sent successfully!", data);
    }

  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    captureTelemetryError(error, "email_send_failed", { orderId, type: "confirmation" });
  }
}

export async function sendOrderStatusEmail(orderId: string, status: string) {
  try {
    const resend = getResendClient();
    if (!process.env.RESEND_API_KEY) {
      console.warn("Skipping email send: RESEND_API_KEY is not set.");
      return;
    }

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) return;
    const order = orderDoc.data();
    if (!order) return;

    let email = order.email;
    let customerName = order.customerName || "Customer";

    if (!email && order.userId) {
      const userDoc = await adminDb.collection("users").doc(order.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        email = userData?.email;
        customerName = userData?.firstName || userData?.fullName || "Customer";
      }
    }

    if (!email) return;

    const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: order.currency || 'INR' });

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: `Order Update: #${orderId.slice(-6).toUpperCase()}`,
      react: OrderStatusEmail({
        orderId,
        customerName,
        status,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: formatter.format(item.rawPrice || 0),
          size: item.size,
          image: item.image,
        })),
        shippingAddress: order.address ? {
          fullName: order.address.fullName,
          phone: order.address.phone,
          streetAddress: order.address.streetAddress,
          city: order.address.city,
          state: order.address.state,
          postalCode: order.address.postalCode,
        } : {},
        totalAmount: formatter.format(order.total || 0),
      }),
    });

    if (error) {
      console.error("Resend API Error (Status):", error);
    } else {
      console.log("Status email sent successfully!", data);
    }

  } catch (error) {
    console.error("Failed to send order status email:", error);
    captureTelemetryError(error, "email_send_failed", { orderId, type: "status_update", status });
  }
}
