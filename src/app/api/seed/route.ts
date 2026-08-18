/**
 * Seed API Route — /api/seed
 * Populates Firestore with initial data.
 * DELETE this file after seeding to prevent unauthorized re-seeding.
 *
 * Call: GET http://localhost:3001/api/seed
 */
import { NextResponse } from 'next/server';
import { seedFirestore } from '@/lib/seed';

export async function GET() {
  try {
    await seedFirestore();
    return NextResponse.json({ success: true, message: 'Firestore seeded successfully. Delete /api/seed now.' });
  } catch (error) {
    console.error('[Seed API]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
