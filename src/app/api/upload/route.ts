/**
 * POST /api/upload
 * Uploads a file to Vercel Blob and returns the public CDN URL.
 * The BLOB_READ_WRITE_TOKEN lives server-side only — never exposed to the browser.
 *
 * Body: FormData with field "file" (image file)
 * Returns: { url: string }
 */
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 });
    }

    // Build a clean filename: products/timestamp_originalname
    const ext = file.name.split('.').pop() ?? 'jpg';
    const filename = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',         // publicly readable CDN URL
      addRandomSuffix: false,   // we already add randomness in filename
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('[Upload API]', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
