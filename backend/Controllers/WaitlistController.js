import Waitlist from "../Models/Waitlist.js";

export const createWaitlistEntry = async (req, res) => {
  try {
    const { name, email, excitement, interest, mustPlay, crowdfunding } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await Waitlist.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "This email is already on the waitlist" });
    }

    const entry = await Waitlist.create({ name, email, excitement, interest, mustPlay, crowdfunding });
    return res.status(201).json({ message: "Successfully joined the waitlist", data: entry });
  } catch (err) {
    console.error("Waitlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getWaitlistEntries = async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ createdAt: -1 });
    return res.json({ total: entries.length, data: entries });
  } catch (err) {
    console.error("Waitlist fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
