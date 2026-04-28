import Razorpay from "razorpay";

const parseAmountInSubunits = (amount) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount)) {
    return 0;
  }

  return Math.round(parsedAmount * 100);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Only POST requests are allowed." });
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    return res.status(500).json({ message: "Razorpay server keys are not configured." });
  }

  try {
    const { amount, donationType, donor, notes, receiptPrefix } = req.body || {};
    const amountInSubunits = parseAmountInSubunits(amount);

    if (!amountInSubunits || amountInSubunits < 100) {
      return res.status(400).json({ message: "Please provide a valid amount." });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: "INR",
      receipt: `${receiptPrefix || "donation"}_${Date.now()}`,
      notes: {
        donationType: donationType || "",
        donorName: donor?.name || "",
        donorEmail: donor?.email || "",
        donorPhone: donor?.phone || "",
        ...(notes || {}),
      },
    });

    return res.status(200).json({
      keyId: razorpayKeyId,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.error?.description || error.message || "Unable to create Razorpay order.",
    });
  }
}
