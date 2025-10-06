import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { DBConnections } from "./Database/Db.js"; 
import { Route } from "./Routes/User.js";

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize app
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Fix for ES modules (so we can use __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static uploads (so images are accessible)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect Database
DBConnections();

// ✅ Routes
app.use("/api/v1", Route);

// ✅ Fallback route (optional, for testing)
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
