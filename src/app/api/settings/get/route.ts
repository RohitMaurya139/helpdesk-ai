import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import Settings from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ownerId } = await req.json();
    if (!ownerId) {
      return NextResponse.json(
        { message: "owner id is required" },
        { status: 400 },
      );
    }
    await connectDb();
    const setting = await Settings.findOne({ ownerId });
    return NextResponse.json(setting);
  } catch (error) {
    logger.error("Settings fetch error", error);
    return NextResponse.json(
      { message: "failed to fetch settings" },
      { status: 500 },
    );
  }
}
