import { NextResponse } from "next/server";
import { getEonetEvents } from "@/lib/eonet";
import { getNoaaEvents } from "@/lib/noaa";

export const runtime = "nodejs";
export const revalidate = 180;

/**
 * GET /api/disasters?days=7
 * Aggregates NASA EONET + NOAA disaster feeds for the client.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days")) || 7;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const [eonetResult, noaaResult] = await Promise.allSettled([
      getEonetEvents({ days, limit: 150 }, controller.signal),
      getNoaaEvents(controller.signal),
    ]);

    const eonet =
      eonetResult.status === "fulfilled" ? eonetResult.value.events : [];
    const noaa =
      noaaResult.status === "fulfilled" ? noaaResult.value.events : [];

    if (!eonet.length && !noaa.length) {
      const message =
        eonetResult.reason?.message ||
        noaaResult.reason?.message ||
        "Unable to load disaster feeds.";
      return NextResponse.json({ error: message, events: [] }, { status: 502 });
    }

    return NextResponse.json(
      {
        events: [...eonet, ...noaa],
        sources: {
          eonet: eonetResult.status === "fulfilled",
          noaa: noaaResult.status === "fulfilled",
        },
        generated: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=180, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unable to load disaster feeds.",
        events: [],
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
