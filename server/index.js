import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import Razorpay from "razorpay";

const app = express();
const port = process.env.PORT || 8787;
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const emailJsServiceId = process.env.EMAILJS_SERVICE_ID;
const emailJsOrderTemplateId = process.env.EMAILJS_ORDER_TEMPLATE_ID;
const emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
const emailJsPrivateKey = process.env.EMAILJS_PRIVATE_KEY;
const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const sendEmailJsEmail = async (templateParams) => {
  if (!emailJsServiceId || !emailJsOrderTemplateId || !emailJsPublicKey) {
    throw new Error("EmailJS order notification variables are not configured.");
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: emailJsServiceId,
      template_id: emailJsOrderTemplateId,
      user_id: emailJsPublicKey,
      accessToken: emailJsPrivateKey || undefined,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to send EmailJS notification.");
  }
};

app.post("/api/notifications/order", async (req, res) => {
  try {
    const { order } = req.body;

    if (!order?.orderId || !order?.customer?.email) {
      res.status(400).json({ message: "Missing required order notification details." });
      return;
    }

    if (!adminNotificationEmail) {
      res.status(500).json({ message: "Admin notification email is not configured." });
      return;
    }

    const itemsSummary = Array.isArray(order.items)
      ? order.items
          .map((item) => `${item.name} | Qty: ${item.quantity} | Rs. ${Number(item.price || 0) * Number(item.quantity || 0)}`)
          .join("\n")
      : "";

    const commonParams = {
      customer_name: order.customer?.name || "",
      customer_email: order.customer?.email || "",
      customer_phone: order.customer?.phone || "",
      customer_address: order.customer?.address || "",
      order_id: order.orderId || "",
      payment_id: order.paymentId || "",
      payment_method: order.method || "",
      order_status: order.status || "Confirmed",
      total_amount: `Rs. ${Number(order.total || 0).toLocaleString("en-IN")}`,
      item_count: String(order.itemCount || order.items?.length || 0),
      ordered_items: itemsSummary,
      created_at: order.createdAt || new Date().toISOString(),
    };

    await Promise.all([
      sendEmailJsEmail({
        ...commonParams,
        to_email: order.customer.email,
        subject: `Order Confirmation - ${order.orderId}`,
        recipient_type: "Customer",
      }),
      sendEmailJsEmail({
        ...commonParams,
        to_email: adminNotificationEmail,
        subject: `New Order Received - ${order.orderId}`,
        recipient_type: "Admin",
      }),
    ]);

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Unable to send order notifications.",
    });
  }
});

app.post("/api/payments/razorpay/order", async (req, res) => {
  if (!razorpay) {
    res.status(500).json({ message: "Razorpay server keys are not configured." });
    return;
  }

  try {
    const { amount, donationType, donor, notes, receiptPrefix } = req.body;
    const amountInSubunits = Number(amount) * 100;

    if (!amountInSubunits || amountInSubunits < 100) {
      res.status(400).json({ message: "Please provide a valid donation amount." });
      return;
    }

    const order = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: "INR",
      receipt: `${receiptPrefix || "donation"}_${Date.now()}`,
      notes: {
        donationType,
        donorName: donor?.name || "",
        donorEmail: donor?.email || "",
        donorPhone: donor?.phone || "",
        ...(notes || {}),
      },
    });

    res.json({
      keyId: razorpayKeyId,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.error?.description || error.message || "Unable to create Razorpay order.",
    });
  }
});

app.post("/api/payments/razorpay/verify", (req, res) => {
  if (!razorpayKeySecret) {
    res.status(500).json({ message: "Razorpay secret is not configured." });
    return;
  }

  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400).json({ message: "Missing payment verification fields." });
    return;
  }

  const expectedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const verified = expectedSignature === razorpaySignature;

  if (!verified) {
    res.status(400).json({ verified: false, message: "Payment signature verification failed." });
    return;
  }

  res.json({
    verified: true,
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    message: "Payment verified successfully.",
  });
});

app.listen(port, () => {
  console.log(`Razorpay verification server running on port ${port}`);
});
