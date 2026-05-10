import { NextResponse } from "next/server";
import { clampYearRange, randomArchivedPage } from "@/lib/wayback";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = clampYearRange(
    url.searchParams.get("from"),
    url.searchParams.get("to"),
  );

  const pick = await randomArchivedPage(range);
  if (!pick) {
    return NextResponse.json(
      { error: "time_machine_offline", range },
      { status: 503 },
    );
  }

  return NextResponse.json({ ...pick, range });
}
