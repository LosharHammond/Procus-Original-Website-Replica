import { isAdmin } from "@/lib/adminAuth";
import { readResume } from "@/lib/submissions";

// Resumes contain personal data, so they are only available to logged-in admins.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Please log in to the admin panel first.", { status: 401 });
  const { id } = await params;
  const resume = await readResume(id);
  if (!resume) return new Response("Not found", { status: 404 });
  const fileName = resume.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return new Response(new Uint8Array(resume.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
