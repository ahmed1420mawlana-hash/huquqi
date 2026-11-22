/** Document upload rules, shared by the server action, the upload route and the forms. */
export const ALLOWED_TYPES = new Map([
  ["application/pdf", ".pdf"], ["image/jpeg", ".jpg"], ["image/png", ".png"],
  ["image/webp", ".webp"], ["image/heic", ".heic"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
]);
export const ACCEPT = [...ALLOWED_TYPES.keys()].join(",");

/**
 * A 1,000-page scanned PDF is usually 100–400 MB. On Vercel files go straight from the browser
 * to Blob storage, so the 4.5 MB function limit does not apply. Local disk uploads pass through
 * the server action, whose body limit is set in next.config.ts.
 */
export const MAX_BLOB_BYTES = 500 * 1024 * 1024;
export const MAX_LOCAL_BYTES = 200 * 1024 * 1024;

const BY_EXT: Record<string, string> = {
  pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  heic: "image/heic", doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
/** Some phones send HEIC or Word files without a type; fall back to the extension. */
export function fileType(name: string, type: string): string {
  if (type) return type;
  return BY_EXT[name.split(".").pop()?.toLowerCase() ?? ""] ?? "";
}

export function cleanFilename(name: string, ext = ""): string {
  return name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120) || `document${ext}`;
}
