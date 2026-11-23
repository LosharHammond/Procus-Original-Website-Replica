import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { listSubmissions } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  return NextResponse.json(await listSubmissions(), { headers: { "Cache-Control": "no-store" } });
}
