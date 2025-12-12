import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import cors from "cors";
import { DBConnections } from "./Database/Db.js";
import EventEmitter from "events";
EventEmitter.defaultMaxListeners = 20;
import { StripeWebhook } from "./Controllers/Stripewebhook.js";

// Routes
import { Route } from "./Routes/User.js";
import router from "./Routes/MarketPlace.js";
import Landrouter from "./Routes/LandRoute.js";
import ActivityRouter from "./Routes/Activity.js";
import HistoryRoute from "./Routes/History.js";
import { CardRoute } from "./Routes/Paywithcard.js";
import { SaveCardRoute } from "./Routes/SaveCard.js";
import { PaymentRotue } from "./Routes/Payment-intent.js";
import { PcheckingRoute } from "./Routes/checkPayment.js";
import { searchRouter } from "./Routes/SearchRoute.js";
import OfferRoute from "./Routes/Offer.js";
import Dashboard from "./Routes/Dashboard.js";
import NFTRouter from "./Routes/NFT.js";
import News from  "./Routes/News.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "Config", ".env") });
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://hypertek100.com",
  "https://hyper-tek-games.deventiatech.com",
  "https://www.hyper-tek-games.deventiatech.com",
  "https://frontend-21msmlhc7-hazrat-usmans-projects.vercel.app",
  "https://frontend-qhftc02lt-hazrat-usmans-projects.vercel.app",
  "https://dreich-extortionately-shavonne.ngrok-free.dev/"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allows cookies
}));

// Database connectivity with error handling
try {
  DBConnections();
  console.log("✅ Database connected");
} catch (error) {
  console.error("❌ Database connection error:", error);
}

// ⚠️ IMPORTANT: Stripe webhook MUST come BEFORE express.json()
app.post(
  "/api/v1/payment/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  StripeWebhook
);

// ⚠️ NOW apply regular JSON parsing for all OTHER routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Payment and Card routes
app.use('/api/v1/card', SaveCardRoute);
app.use("/api/v1/payment", PaymentRotue);
app.use("/api/v1/card", CardRoute);

// Other existing routes
app.use("/api/v1", Route);
app.use("/api/v1/market", router);
app.use("/api/v1/land", Landrouter);
app.use("/api/v1/activity", ActivityRouter);
app.use("/api/v1/history", HistoryRoute);
app.use('/api/v1/game', PcheckingRoute);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/offer", OfferRoute);
app.use("/api/dashboard", Dashboard);

// ✨ NEW: NFT Marketplace Routes with Blockchain
app.use("/api/v1/nft", NFTRouter);
app.use("/api/v1/news", News);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    blockchain: {
      nftContract: !!process.env.MYNFT_ADDRESS,
      marketContract: !!process.env.MARKETPLACE_ADDRESS,
      provider: !!process.env.ALCHEMY_RPC_URL
    },
    database: 'Connected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Port from .env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 NFT Marketplace Server');
  console.log('='.repeat(60));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔗 NFT Contract: ${process.env.MYNFT_ADDRESS || 'Not deployed'}`);
  console.log(`🏪 Marketplace: ${process.env.MARKETPLACE_ADDRESS || 'Not deployed'}`);
  console.log(`💰 Platform Wallet: ${process.env.PLATFORM_WALLET_ADDRESS || 'Not set'}`);
  console.log('='.repeat(60) + '\n');
});