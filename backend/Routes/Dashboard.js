import { 
  GetTotalUsers,
  getTotalBuyers,
  getTotalSellers,
  getTotalMarketplaceCount,
  getTotalOffers,
  getCombinedCounts,
  getPayments,
  getTrades,
} from "../Controllers/Dashboard.js";
import express from "express";
import { authMiddleware } from "../Middleware/googleMiddle.js";


const Dashboard = express.Router();

// Every dashboard metric is admin-only.
Dashboard.use(authMiddleware("admin"));

Dashboard.get("/user/Count", GetTotalUsers);
Dashboard.get("/buyers/Count", getTotalBuyers);
Dashboard.get("/sellers/Count", getTotalSellers);
Dashboard.get("/marketplace/Count", getTotalMarketplaceCount);
Dashboard.get("/offers/Count", getTotalOffers);
Dashboard.get("/combined/Counts", getCombinedCounts);
Dashboard.get("/payments", getPayments);
Dashboard.get("/trades", getTrades);

export default Dashboard;