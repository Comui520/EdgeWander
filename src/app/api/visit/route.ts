import { NextResponse } from "next/server";
import { KEYS, store } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  const count = await store().incr(KEYS.visitors);
  return NextResponse.json({ count });
}

export async function GET() {
  const raw = await store().get<number | string>(KEYS.visitors);
  const count = Number(raw ?? 0) || 0;
  return NextResponse.json({ count });
}
