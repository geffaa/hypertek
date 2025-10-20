import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { DBConnections } from "./Database/Db.js";
import EventEmitter from "events";
EventEmitter.defaultMaxListeners = 20; // or higher

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

// Load environment variables
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

// Database connectivity with error handling
try {
  DBConnections();
  console.log("✅ Database connected");
} catch (error) {
  console.error("❌ Database connection error:", error);
}


// i set this route here becasue if i put this rotue below the middleware then it will not work
// app.use('/api/v1/stripe', StripSaveRoute);
app.use('/api/v1/card',SaveCardRoute)
app.use("/api/v1/payment",PaymentHook)




// ⚠️ NOW apply regular JSON parsing for all OTHER routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Other routes
app.use("/api/v1", Route);
app.use("/api/v1/market", router);
app.use("/api/v1/land", Landrouter);
app.use("/api/v1/activity", ActivityRouter);
app.use("/api/v1/history",HistoryRoute)
app.use("/api/v1/payment",PaymentRotue)

/// check game is already purchase or not 
app.use('/api/v1/game',PcheckingRoute)

// Searching items
app.use("/api/v1/search",searchRouter)


app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/payment/stripe/webhook") {
    next(); // skip express.json for this route
  } else {
    express.json()(req, res, next);
  }
});



app.use("/api/v1/card",CardRoute)


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Something went wrong" });
});

// Port from .env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));