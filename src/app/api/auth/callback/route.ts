import { scalekit } from "@/lib/scalekit";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  if (!code) {
    return NextResponse.json({ message: "code is not found" }, { status: 400 });
  }
  try {
    const session = await scalekit.authenticateWithCode(code, redirectUri);
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}`,
    );
    response.cookies.set("access_token", session.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      path: "/",
    });
    return response;
  } catch (error) {
    logger.error("Auth callback failed", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
  }
}
