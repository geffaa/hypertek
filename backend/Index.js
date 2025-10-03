import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { DBConnections } from "./Database/Db.js"; 

// import Rotues 
import { Route } from "./Routes/User.js";

// Load environment variables
dotenv.config({ path: "./Config/.env" });
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// Database Connectivity
DBConnections();

// Routes
app.use(`/api/v1`,Route);

// Port from .env
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
