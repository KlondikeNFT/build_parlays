/**
 * Today's Games API Route
 * Returns games scheduled for today
 */

import { NextResponse } from 'next/server';
import { getRows } from '@/lib/database/hybrid-connection';

export async function GET(request: Request) {
  try {
    console.log('📅 Fetching today\'s games...');
    
    // Get today's date in Eastern Time
    const today = new Date();
    const todayString = today.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); // YYYY-MM-DD format in ET
    
    console.log(`📅 Looking for games on: ${todayString}`);
    
    // Get games scheduled for today's actual date from real schedule
    const games = await getRows(`
      SELECT
        game_id,
        week,
        game_date,
        game_time,
        home_team_name,
        home_team_abbr,
        away_team_name,
        away_team_abbr,
        broadcast_primary,
        status
      FROM real_schedule_2025
      WHERE game_date = ?
      ORDER BY game_time ASC
    `, [todayString]);    // Format games for the frontend
    const formattedGames = games.map((game: any) => {
      // Parse game time and create proper datetime
      const timeMatch = game.game_time.match(/(\d{1,2}):(\d{2})([ap])\s*\(([A-Z]{2})\)/i);
      let gameDateTime = new Date(game.game_date);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        const ampm = timeMatch[3].toLowerCase();
        const timezone = timeMatch[4];
        
        if (ampm === 'p' && hours !== 12) hours += 12;
        if (ampm === 'a' && hours === 12) hours = 0;
        
        // Convert to Eastern Time if it's Pacific Time
        if (timezone === 'PT') {
          hours += 3; // PT is 3 hours behind ET
        }
        
        gameDateTime.setHours(hours, parseInt(minutes), 0, 0);
      }
      
      return {
        id: game.game_id,
        week: game.week,
        homeTeam: {
          id: game.home_team_abbr,
          name: game.home_team_name,
          abbr: game.home_team_abbr,
          primaryColor: '#000000',
          secondaryColor: '#FFFFFF',
          record: '0-0',
          wins: 0,
          losses: 0,
          ties: 0
        },
        awayTeam: {
          id: game.away_team_abbr,
          name: game.away_team_name,
          abbr: game.away_team_abbr,
          primaryColor: '#000000',
          secondaryColor: '#FFFFFF',
          record: '0-0',
          wins: 0,
          losses: 0,
          ties: 0
        },
        gameTime: gameDateTime.toISOString(),
        broadcast: game.broadcast_primary || 'TBD',
        homeScore: null,
        awayScore: null,
        status: game.status || 'scheduled'
      };
    });
    
    console.log(`✅ Found ${formattedGames.length} games for today`);
    
    return NextResponse.json({
      date: todayString,
      games: formattedGames,
      totalGames: formattedGames.length
    });
    
  } catch (error: any) {
    console.error('Error fetching today\'s games:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
