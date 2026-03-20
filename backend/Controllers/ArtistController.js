import Artist from "../Models/Artist.js";

// GET all artists
export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });
    res.json({ success: true, artists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single artist
export const getArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });
    res.json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create artist
export const createArtist = async (req, res) => {
  try {
    const { name, email, paymentPreference, walletAddress, bankDetails, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const artist = await Artist.create({
      name, email, paymentPreference, walletAddress, bankDetails, notes,
    });
    res.status(201).json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update artist
export const updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });
    res.json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE artist
export const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });
    res.json({ success: true, message: "Artist deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
