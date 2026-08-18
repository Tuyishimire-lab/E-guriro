/**
 * Client-side upload helper
 * Sends a file to /api/upload and returns the Vercel Blob CDN URL.
 * Usage: const url = await uploadImage(file);
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error ?? 'Upload failed');
  }

  const { url } = await res.json();
  return url as string;
}

/**
 * Upload multiple images, returns array of CDN URLs.
 * Uploads in parallel.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadImage));
}
