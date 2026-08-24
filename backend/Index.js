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
import News from "./Routes/News.js";
import chatRoutes from "./Routes/chat.js";
import WithdrawalRoute from "./Routes/WithdrawalRoute.js"; // Import Withdrawal Route
import ContentRoute from "./Routes/ContentRoute.js";
import WaitlistRouter from "./Routes/WaitlistRoute.js";
import Nft101Router from "./Routes/Nft101Route.js";
import AdminNFARouter from "./Routes/AdminNFA.js";
import AuctionRouter from "./Routes/AuctionRoute.js";
import TradeRouter from "./Routes/TradeRoute.js";
import HireRentRouter from "./Routes/HireRentRoute.js";
import BountyRouter from "./Routes/BountyRoute.js";
import HBRouter from "./Routes/HBRoute.js";
import KYCRouter from "./Routes/KYCRoute.js";
import ArtistRouter from "./Routes/ArtistRoute.js";
import BuybackRouter from "./Routes/BuybackRoute.js";
import MarketListingRouter from "./Routes/MarketListingRoute.js";
import chatbotRouter from "./Routes/chatbot.js";
import NotificationRouter from "./Routes/NotificationRoute.js";
import TransakRouter from "./Routes/transak.js";
import { socketHandler } from "./socket.js";
import { Server } from "socket.io";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables: Config/.env first, then .env.local overrides
dotenv.config({ path: path.join(__dirname, "Config", ".env") });
dotenv.config({ path: path.join(__dirname, ".env.local"), override: true });
const app = express();

// Behind nginx, so req.ip and req.secure need the real client info from the
// X-Forwarded-* headers nginx sets, not the proxy's own address. Without this,
// every visitor resolves to the server's own IP — which is what was silently
// happening in Stripe's tos_acceptance.ip and in Transak's fraud-check payload.
app.set("trust proxy", 1);

// ✨ Create HTTP server for Socket.IO
const server = http.createServer(app);

// FIXED: Changed https to http for localhost
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      process.env.ADMIN_URL || "http://localhost:5174",
      "http://localhost:3000",
      "https://hyper-tek-games.deventiatech.com",
      "https://admin-hyper-tek-game.deventiatech.com",
      "https://admin.hypertek100.com",
      "https://hypertek100.com",
      "https://www.hypertek100.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"], // Allow both transports
});

// Apply Socket.IO handler
socketHandler(io);

// Middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL || "http://localhost:5173",
        process.env.ADMIN_URL || "http://localhost:5174",
        "http://localhost:3000",
        "https://hypertek100.com",
        "https://www.hypertek100.com",
        "https://hyper-tek-games.deventiatech.com",
        "https://www.hyper-tek-games.deventiatech.com",
        "https://admin-hyper-tek-game.deventiatech.com",
        "https://admin.hypertek100.com",
      ];
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(" CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Database connection
(async () => {
  try {
    await DBConnections();
  } catch (error) {
    console.error(" Database connection error:", error);
  }
})();

// Stripe webhook (before express.json)
app.post(
  "/api/v1/payment/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  StripeWebhook
);

// Parse JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// JWKS endpoint — publishes the RS256 public key so the embedded-wallet
// provider (Coinbase CDP custom auth) can verify our wallet-auth JWTs.
// Standard well-known location, must be public over HTTPS.
app.get("/.well-known/jwks.json", async (req, res) => {
  try {
    const { getWalletAuthJwks } = await import("./utils/walletAuthKeys.js");
    res.json(getWalletAuthJwks());
  } catch (e) {
    console.error("jwks endpoint error:", e.message);
    res.status(500).json({ error: "jwks unavailable" });
  }
});

// Media proxy — serves the marketing/gameplay videos from our own domain
// instead of the shared pub-*.r2.dev bucket subdomain. Some ISPs intercept
// that shared dev subdomain with their own content-filtering TLS certificate
// (confirmed via a Telkomsel "internetbaik" cert on that host), breaking
// playback for affected users while our own domain's certificate stays
// untouched. Streaming through here (Range-request passthrough, so seeking
// still works) fixes that without needing to move DNS to Cloudflare.
const MEDIA_ALLOWLIST = new Set([
  "racing_content.mp4",
  "quest_video2.webm",
  "overlord_content.mp4",
  "download_page.mp4",
]);
const MEDIA_ORIGIN = "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev";
app.get("/media/:filename", async (req, res) => {
  const { filename } = req.params;
  if (!MEDIA_ALLOWLIST.has(filename)) return res.status(404).end();
  try {
    const axiosModule = await import("axios");
    const axios = axiosModule.default;
    const upstream = await axios.get(`${MEDIA_ORIGIN}/${filename}`, {
      responseType: "stream",
      headers: req.headers.range ? { Range: req.headers.range } : {},
      validateStatus: () => true,
    });
    res.status(upstream.status);
    for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      if (upstream.headers[h]) res.set(h, upstream.headers[h]);
    }
    res.set("Cache-Control", "public, max-age=86400");
    upstream.data.pipe(res);
  } catch (e) {
    console.error("media proxy error:", e.message);
    res.status(502).end();
  }
});

// Routes
// NOTE: specific /api/v1/admin/* routes MUST be registered before the generic
// /api/v1 User router — otherwise Route.get("/admin/:adminId") swallows them.
app.use("/api/v1/admin/nfa", AdminNFARouter);
app.use("/api/v1/admin/artists", ArtistRouter);
app.use("/api/v1/card", SaveCardRoute);
app.use("/api/v1/payment", PaymentRotue);
app.use("/api/v1/card", CardRoute);
app.use("/api/v1", Route);
app.use("/api/v1/market", router);
app.use("/api/v1/land", Landrouter);
app.use("/api/v1/activity", ActivityRouter);
app.use("/api/v1/history", HistoryRoute);
app.use("/api/v1/game", PcheckingRoute);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/offer", OfferRoute);
app.use("/api/dashboard", Dashboard);
app.use("/api/v1/nft", NFTRouter);
// ... (existing app.use calls)
app.use("/api/v1/news", News);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/withdraw", WithdrawalRoute); // Register Withdrawal Route
app.use("/api/v1/site-content", ContentRoute);
app.use("/api/v1/waitlist", WaitlistRouter);
app.use("/api/v1/nft101", Nft101Router);
app.use("/api/v1/auction", AuctionRouter);
app.use("/api/v1/trade", TradeRouter);
app.use("/api/v1/hire", HireRentRouter);
app.use("/api/v1/bounty", BountyRouter);
app.use("/api/v1/hb", HBRouter);
app.use("/api/v1/transak", TransakRouter);
app.use("/api/v1/kyc", KYCRouter);
app.use("/api/v1/buyback", BuybackRouter);
app.use("/api/v1/listings", MarketListingRouter);
app.use("/api/v1/chatbot", chatbotRouter);
app.use("/api/v1/notifications", NotificationRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    socketio: io ? "Connected" : "Not initialized",
    blockchain: {
      nftContract: !!process.env.MYNFT_ADDRESS,
      marketContract: !!process.env.MARKETPLACE_ADDRESS,
      provider: !!process.env.ALCHEMY_RPC_URL,
    },
    database: "Connected",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server with Socket.IO
const PORT = process.env.PORT || 4700; // Changed to 4700 to match your socket config

server.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 NFT Marketplace Server with Socket.IO");
  console.log("=".repeat(60));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(
    `🗄️  Database: ${process.env.MONGODB_URL ? "Connected" : "Not configured"}`
  );
  console.log(
    `🔗 NFT Contract: ${process.env.MYNFT_ADDRESS || "Not deployed"}`
  );
  console.log(
    `🏪 Marketplace: ${process.env.MARKETPLACE_ADDRESS || "Not deployed"}`
  );
  console.log(
    `💰 Platform Wallet: ${process.env.PLATFORM_WALLET_ADDRESS || "Not set"}`
  );
  console.log("=".repeat(60) + "\n");
});

export default app;