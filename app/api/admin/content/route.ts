import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin, sameOrigin } from "@/lib/adminAuth";
import { ConflictError, getContent, saveContent } from "@/lib/content/store";
import { validateContent } from "@/lib/content/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  return NextResponse.json(await getContent(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = validateContent(body?.content);
  if (!result.ok) return NextResponse.json({ error: "Please fix these problems first.", details: result.errors }, { status: 400 });

  try {
    const saved = await saveContent(result.content, String(body?.expectedUpdatedAt ?? ""));
    revalidatePath("/", "layout");
    return NextResponse.json(saved);
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: "Someone else saved changes while you were editing. Reload the admin panel to get their changes, then make yours again." },
        { status: 409 },
      );
    }
    console.error("Saving content failed", error);
    return NextResponse.json({ error: "Saving failed on the server. Check that the storage folder is writable." }, { status: 500 });
  }
}
