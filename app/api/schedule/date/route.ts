/**
 * Schedule API Route - Get games by specific date
 * Returns games for a given date
 */

import { NextResponse } from 'next/server';
import { getRows } from '@/lib/database/hybrid-connection';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    console.log(`📅 Fetching games for date: ${date}`);
    
    // Get games for the specified date
    const games = await getRows(`
      SELECT 
        g.game_id,
        g.week,
        g.game_date,
        g.home_team,
        g.away_team,
        g.home_score,
        g.away_score,
        ht.team_name as home_team_name,
        at.team_name as away_team_name,
        ht.team_abbr as home_team_abbr,
        at.team_abbr as away_team_abbr,
        ht.team_conference as home_conference,
        ht.team_division as home_division,
        at.team_conference as away_conference,
        at.team_division as away_division,
        ht.team_color_primary as home_primary_color,
        ht.team_color_secondary as home_secondary_color,
        at.team_color_primary as away_primary_color,
        at.team_color_secondary as away_secondary_color,
        htr.wins as home_wins,
        htr.losses as home_losses,
        htr.ties as home_ties,
        htr.win_percentage as home_win_percentage,
        atr.wins as away_wins,
        atr.losses as away_losses,
        atr.ties as away_ties,
        atr.win_percentage as away_win_percentage
      FROM games g
      LEFT JOIN teams ht ON g.home_team = ht.team_id
      LEFT JOIN teams at ON g.away_team = at.team_id
      LEFT JOIN team_records htr ON g.home_team = htr.team_id AND htr.season = 2025
      LEFT JOIN team_records atr ON g.away_team = atr.team_id AND atr.season = 2025
      WHERE DATE(g.game_date) = ?
      ORDER BY g.game_date ASC
    `, [date]);

    // Transform the data to match the expected format
    const transformedGames = games.map((game: any) => ({
      id: game.game_id,
      week: game.week,
      homeTeam: {
        id: game.home_team,
        name: game.home_team_name,
        abbr: game.home_team_abbr,
        primaryColor: game.home_primary_color || '#000000',
        secondaryColor: game.home_secondary_color || '#FFFFFF',
        record: `${game.home_wins || 0}-${game.home_losses || 0}`,
        wins: game.home_wins || 0,
        losses: game.home_losses || 0,
        ties: game.home_ties || 0,
      },
      awayTeam: {
        id: game.away_team,
        name: game.away_team_name,
        abbr: game.away_team_abbr,
        primaryColor: game.away_primary_color || '#000000',
        secondaryColor: game.away_secondary_color || '#FFFFFF',
        record: `${game.away_wins || 0}-${game.away_losses || 0}`,
        wins: game.away_wins || 0,
        losses: game.away_losses || 0,
        ties: game.away_ties || 0,
      },
      gameTime: game.game_date,
      broadcast: 'TBD', // You can add broadcast info to your database if needed
      homeScore: game.home_score,
      awayScore: game.away_score,
      status: game.home_score !== null ? 'final' : 'scheduled',
    }));

    console.log(`✅ Found ${transformedGames.length} games for ${date}`);
    
    return NextResponse.json({
      date,
      games: transformedGames,
      count: transformedGames.length
    });

  } catch (error) {
    console.error('Error fetching games by date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games for the specified date' },
      { status: 500 }
    );
  }
}
