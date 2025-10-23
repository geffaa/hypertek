import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { DBConnections } from "./Database/Db.js";
import EventEmitter from "events";
EventEmitter.defaultMaxListeners = 20;

// Routes
import { Route } from "./Routes/User.js";
import router from "./Routes/MarketPlace.js";
import Landrouter from "./Routes/LandRoute.js";
import ActivityRouter from "./Routes/Activity.js";
import HistoryRoute from "./Routes/History.js";
import { CardRoute } from "./Routes/Paywithcard.js";
import { SaveCardRoute } from "./Routes/SaveCard.js";
import { PaymentRotue } from "./Routes/Payment-intent.js";
import { PaymentHook } from "./Routes/webhookroute.js";
import { PcheckingRoute } from "./Routes/checkPayment.js";
import { searchRouter } from "./Routes/SearchRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "Config", ".env") });
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://hyper-tek-games.deventiatech.com",
  "https://www.hyper-tek-games.deventiatech.com",
  "https://frontend-21msmlhc7-hazrat-usmans-projects.vercel.app",
  "https://frontend-qhftc02lt-hazrat-usmans-projects.vercel.app",
  "https://dreich-extortionately-shavonne.ngrok-free.dev/"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Database connection
try {
  DBConnections();
  console.log("✅ Database connected");
} catch (error) {
  console.error("❌ Database connection error:", error);
}

// ⚠️ CRITICAL FIX: Apply raw body parser ONLY to webhook route
// Use express.raw() instead of bodyParser.raw()
app.post(
  "/api/v1/payment/stripe/webhook",
  express.raw({ type: "application/json" }), // ✅ Use express.raw()
  StripeWebhook
);

// ⚠️ Remove this line - you're already applying the webhook route above
// app.use('/api/v1/payment/stripe', PaymentHook);

// Now apply JSON parser for ALL other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Other routes (they will use JSON parser)
app.use("/api/v1/payment", PaymentRotue);
app.use("/api/v1/card", SaveCardRoute);
app.use("/api/v1", Route);
app.use("/api/v1/market", router);
app.use("/api/v1/land", Landrouter);
app.use("/api/v1/activity", ActivityRouter);
app.use("/api/v1/history", HistoryRoute);
app.use("/api/v1/game", PcheckingRoute);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/card", CardRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));