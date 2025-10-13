import { Router } from "express";
import OpenAI from "openai";
import { config } from "../config/env";
import { authenticateJWT } from "../middlewares/auth";

const router = Router();

const client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
router.post("/", authenticateJWT, async (req, res) => {
  
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages, // ✅ now passes full chat history
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of response) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }
    

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "AI assistant failed" });
  }
});


export default router;
