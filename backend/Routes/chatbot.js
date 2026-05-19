import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeBase } from "../Config/knowledgeBase.js";

const router = express.Router();

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.status(503).json({ error: "AI service not configured" });
    }

    // instantiate per-request so it always picks up the current env value
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
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
