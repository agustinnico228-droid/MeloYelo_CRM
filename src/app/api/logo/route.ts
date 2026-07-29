import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    // Use meloyelo-logo.png as the official MeloYelo logo
    const logoPath = path.join(process.cwd(), "public", "meloyelo-logo.png");
    const logoBuffer = await readFile(logoPath);

    return new NextResponse(logoBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Logo not found", { status: 404 });
  }
}
