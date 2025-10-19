import {
    Payment
} from "../Models/Payment.js"; // Adjust path if needed

// Check if user already purchased the game
const checkPayment = async (req, res) => {
    try {
        const {
            userId,
            productId
        } = req.body;
        console.log("Request body:", req.body);

        if (!userId || !productId) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        // Check if payment already exists with succeeded status
        const existingPayment = await Payment.findOne({
            productId,
            userId,
            status: "succeeded",
        });

        if (!existingPayment) {

            return res.status(200).json({
                message: "Payment not found, you can purchase this game",
                exist: "no",
            });
        }

        if (existingPayment) {
            return res.status(200).json({
                message: "Sorry, you have already purchased this game",
                exist: "yes",
            });
        }



    } catch (error) {
        console.error("Payment check error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export {
    checkPayment
};