import { NextRequest, NextResponse } from 'next/server';
import { searchPlayersAndTeams } from '@/lib/playerService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json({ players: [], teams: [] });
    }

    const results = await searchPlayersAndTeams(query.trim());
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
