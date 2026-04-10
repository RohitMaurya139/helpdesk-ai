import connectDb from "@/lib/db";
import { corsJson, corsOptions } from "@/lib/cors";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";
import Settings from "@/model/settings.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return corsJson(
        { message: "too many requests, please try again later" },
        { status: 429 },
      );
    }

    const { message, apiKey, ownerId, history } = await req.json();
    // Support both apiKey (new) and ownerId (legacy) lookup
    const lookupKey = apiKey || ownerId;

    if (!message || !lookupKey) {
      return corsJson(
        { message: "message and apiKey are required" },
        { status: 400 },
      );
    }

    await connectDb();
    const setting = apiKey
      ? await Settings.findOne({ apiKey })
      : await Settings.findOne({ ownerId });

    if (!setting) {
      return corsJson(
        { message: "chatbot is not configured yet." },
        { status: 400 },
      );
    }

    const KNOWLEDGE = `
        business name- ${setting.businessName || "not provided"}
        supportEmail- ${setting.supportEmail || "not provided"}
        knowledge- ${setting.knowledge || "not provided"}
        `;

    // Build conversation context from history
    let conversationContext = "";
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = (history as ChatMessage[]).slice(-10);
      conversationContext = recentHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "Customer" : "Support Agent"}: ${msg.content}`,
        )
        .join("\n");
    }

    const prompt = `
You are a professional customer support assistant for this business.

Use ONLY the information provided below to answer the customer's question.
You may rephrase, summarize, or interpret the information if needed.
Do NOT invent new policies, prices, or promises.

--------------------
BUSINESS INFORMATION
--------------------
${KNOWLEDGE}

${
  conversationContext
    ? `--------------------
CONVERSATION HISTORY
--------------------
${conversationContext}

`
    : ""
}--------------------
CUSTOMER QUESTION
--------------------
${message}

--------------------
ANSWER
--------------------
`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return corsJson(res.text);
  } catch (error) {
    logger.error("Chat error", error);
    return corsJson({ message: "something went wrong" }, { status: 500 });
  }
}

export const OPTIONS = async () => corsOptions();
