import { Payment } from "../Models/Payment";


// Save successful payment
export const savePayment = async (req, res) => {
  try {
    const { userId, amount, currency, paymentIntentId, paymentMethod, status } = req.body;

    const payment = new Payment({
      userId,
      amount,
      currency,
      paymentIntentId,
      paymentMethod,
      status,
      createdAt: new Date(),
    });

    await payment.save();

    res.status(200).json({
      message: "Payment saved successfully!",
      payment,
    });
  } catch (error) {
    console.error("Save Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
};
