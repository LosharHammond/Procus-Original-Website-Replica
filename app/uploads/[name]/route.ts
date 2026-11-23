import { readUpload } from "@/lib/content/store";

// Serves images uploaded from the admin panel. They live in the storage folder,
// (see lib/storage.ts), not in /public, so they survive code deployments.
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  try {
    const found = await readUpload(name);
    if (!found) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(found.data), {
      headers: {
        "Content-Type": found.type,
        // File names include a random suffix, so they never change and can be cached for a long time.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // Uploaded SVGs must never run scripts.
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
