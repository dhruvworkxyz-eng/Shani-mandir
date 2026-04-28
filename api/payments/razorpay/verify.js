import crypto from "node:crypto";

const safeCompare = (leftValue, rightValue) => {
  const leftBuffer = Buffer.from(String(leftValue || ""), "utf8");
  const rightBuffer = Buffer.from(String(rightValue || ""), "utf8");

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Only POST requests are allowed." });
  }

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeySecret) {
    return res.status(500).json({ message: "Razorpay secret is not configured." });
  }

  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = req.body || {};

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: "Missing payment verification fields." });
  }

  const expectedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (!safeCompare(expectedSignature, razorpaySignature)) {
    return res.status(400).json({
      verified: false,
      message: "Payment signature verification failed.",
    });
  }

  return res.status(200).json({
    verified: true,
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    message: "Payment verified successfully.",
  });
}
