import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeBase } from "../Config/knowledgeBase.js";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * POST /api/v1/chatbot/message
 * Body: { message: string, history: Array<{role, parts}> }
 * No auth required — public chatbot widget
 */
router.post("/message", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "AI service not configured" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: knowledgeBase,
    });

    // history format: [{ role: "user"|"model", parts: [{ text: "..." }] }]
    const safeHistory = Array.isArray(history)
      ? history.filter(
          (h) =>
            h &&
            (h.role === "user" || h.role === "model") &&
            Array.isArray(h.parts) &&
            h.parts.every((p) => typeof p.text === "string")
        )
      : [];

    const chat = model.startChat({ history: safeHistory });
    const result = await chat.sendMessage(message.trim());
    const response = result.response.text();

    res.json({ response });
  } catch (err) {
    console.error("[Chatbot] Error:", err.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
