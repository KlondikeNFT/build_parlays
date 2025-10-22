/**
 * Teams API Route
 * Server-side endpoint for team data
 */

import { NextResponse } from 'next/server';
import { getAllTeams } from '@/lib/database/queries';

export async function GET() {
  try {
    const teams = await getAllTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error getting teams:', error);
    return NextResponse.json(
      { error: 'Failed to get teams' },
      { status: 500 }
    );
  }
}



