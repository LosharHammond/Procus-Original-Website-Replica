import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/adminAuth";
import { deleteSubmission, updateSubmission } from "@/lib/submissions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (typeof body?.read !== "boolean") return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
  const updated = await updateSubmission(id, { read: body.read });
  if (!updated) return NextResponse.json({ error: "This submission no longer exists." }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const { id } = await params;
  if (!(await deleteSubmission(id))) return NextResponse.json({ error: "This submission no longer exists." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
