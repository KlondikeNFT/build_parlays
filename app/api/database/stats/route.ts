/**
 * Database Stats API Route
 * Server-side endpoint for database statistics
 */

import { NextResponse } from 'next/server';
import { getDatabaseStats } from '@/lib/database/connection';

export async function GET() {
  try {
    const stats = getDatabaseStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting database stats:', error);
    return NextResponse.json(
      { error: 'Failed to get database stats' },
      { status: 500 }
    );
  }
}


