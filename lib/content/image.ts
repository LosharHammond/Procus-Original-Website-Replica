// Images uploaded from the admin panel are served by our own route and are
// already the size the admin chose, so skip Next's image optimiser for them.
export function isUploadedImage(src: string) {
  return src.startsWith("/uploads/") || src.startsWith("https://");
}
