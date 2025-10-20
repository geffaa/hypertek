

import Land from "../Models/LandModel.js"
import Marketplace from "../Models/MarketPlace.js"

// search something with the title 
const searchByTitle = async (req, res) => {
  try {
    const { query } = req.query;
    console.log("your query are here :",req.query);

    if (!query) return res.status(400).json({ message: "Query is required" });

    // Search in Land
    const lands = await Land.find({
      title: { $regex: query, $options: "i" }, // case-insensitive
    }).limit(10);

    // Search in Marketplace
    const nfas = await Marketplace.find({
      title: { $regex: query, $options: "i" },
    }).limit(10);

    res.status(200).json({ lands, nfas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/// get the details of the item 
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try finding in Land first
    let item = await Land.findById(id);

    // If not found, try Marketplace
    if (!item) {
      item = await Marketplace.findById(id);
    }

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export { searchByTitle , getItemById}
