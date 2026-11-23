import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/adminAuth";
import { saveUpload } from "@/lib/content/store";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "No image was sent." }, { status: 400 });

  try {
    const url = await saveUpload(file.name, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Upload failed." }, { status: 400 });
  }
}
