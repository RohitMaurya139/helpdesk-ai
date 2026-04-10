import crypto from "crypto";
import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import Settings from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { ownerId, businessName, supportEmail, knowledge } = await req.json();
    if (!ownerId) {
      return NextResponse.json(
        { message: "owner id is required" },
        { status: 400 },
      );
    }

    // Input validation
    if (supportEmail && !EMAIL_RE.test(supportEmail)) {
      return NextResponse.json(
        { message: "invalid email format" },
        { status: 400 },
      );
    }
    if (businessName && businessName.length > 200) {
      return NextResponse.json(
        { message: "business name must be under 200 characters" },
        { status: 400 },
      );
    }
    if (knowledge && knowledge.length > 50000) {
      return NextResponse.json(
        { message: "knowledge base must be under 50,000 characters" },
        { status: 400 },
      );
    }

    await connectDb();

    // Check if settings already exist (to preserve existing apiKey)
    const existing = await Settings.findOne({ ownerId });
    const apiKey = existing?.apiKey || crypto.randomBytes(24).toString("hex");

    const settings = await Settings.findOneAndUpdate(
      { ownerId },
      { ownerId, apiKey, businessName, supportEmail, knowledge },
      { new: true, upsert: true },
    );
    return NextResponse.json(settings);
  } catch (error) {
    logger.error("Settings save error", error);
    return NextResponse.json(
      { message: "failed to save settings" },
      { status: 500 },
    );
  }
}
