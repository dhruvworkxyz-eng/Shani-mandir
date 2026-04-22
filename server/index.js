import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import Razorpay from "razorpay";

const app = express();
const port = process.env.PORT || 8787;
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

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
