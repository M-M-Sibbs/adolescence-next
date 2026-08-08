import { put } from "@vercel/blob";

/**
 * Upload a File (from multipart form data) to Vercel Blob storage.
 * Requires BLOB_READ_WRITE_TOKEN in the environment (auto-set on Vercel
 * once you create a Blob store; set manually for local dev).
 * Returns the public URL and the stored filename.
 */
export async function uploadFile(
  file: File,
  subfolder: string
): Promise<{ url: string; filename: string }> {
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const filename = `${crypto.randomUUID()}${ext}`;
  const path = `${subfolder}/${filename}`;

  const blob = await put(path, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url: blob.url, filename };
}

/** Extract text from a PDF File for AI context (capped at 10k chars). */
export async function extractPdfText(file: File): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // pdf-parse is CommonJS; import dynamically so it doesn't break the edge/build.
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return (data.text || "").slice(0, 10000);
  } catch {
    return "";
  }
}
