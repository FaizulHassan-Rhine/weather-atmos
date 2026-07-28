import { NextResponse } from "next/server";
import { translateMany } from "@/lib/googleTranslate";

export const runtime = "nodejs";

/**
 * POST /api/translate
 * body: { texts: string[], target: string, source?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
  // Raise the per-request limit so chunked client batches finish faster
  const texts = Array.isArray(body?.texts) ? body.texts.slice(0, 80) : [];
    const target = typeof body?.target === "string" ? body.target : "en";
    const source = typeof body?.source === "string" ? body.source : "en";

    if (!texts.length) {
      return NextResponse.json({ translations: {} });
    }

    if (target === source || target === "en") {
      const translations = Object.fromEntries(texts.map((t) => [t, t]));
      return NextResponse.json({ translations });
    }

    const translations = await translateMany(texts, target, source);
    return NextResponse.json({ translations });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Translation failed", translations: {} },
      { status: 500 }
    );
  }
}
