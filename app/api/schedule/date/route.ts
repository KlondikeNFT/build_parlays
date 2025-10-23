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
    
                        // Get games for the specified date from real NFL schedule table
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
                            venue_name,
                            venue_city,
                            venue_state,
                            broadcast_primary,
                            status,
                            game_type
                          FROM real_schedule_2025
                          WHERE game_date = ?
                          ORDER BY game_time ASC
                        `, [date]);

           // Transform the real schedule data to match the expected format
           const transformedGames = games.map((game: any) => ({
             id: game.game_id,
             week: game.week,
             homeTeam: {
               id: game.home_team_abbr,
               name: game.home_team_name,
               abbr: game.home_team_abbr,
               primaryColor: '#000000', // Default colors - you can enhance this later
               secondaryColor: '#FFFFFF',
               record: '0-0', // Default record - you can enhance this later
               wins: 0,
               losses: 0,
               ties: 0,
             },
             awayTeam: {
               id: game.away_team_abbr,
               name: game.away_team_name,
               abbr: game.away_team_abbr,
               primaryColor: '#000000', // Default colors - you can enhance this later
               secondaryColor: '#FFFFFF',
               record: '0-0', // Default record - you can enhance this later
               wins: 0,
               losses: 0,
               ties: 0,
             },
                    gameTime: (() => {
                      // Parse game_time like "8:20p (ET)" or "5:15p (PT)" 
                      const timeMatch = game.game_time.match(/(\d{1,2}):(\d{2})([ap])\s*\(([A-Z]{2})\)/i);
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
                        
                        return `${game.game_date}T${hours.toString().padStart(2, '0')}:${minutes}:00`;
                      }
                      return `${game.game_date}T12:00:00`; // fallback to noon
                    })(),
             gameTimeFormatted: game.game_time,
             broadcast: game.broadcast_primary || 'TBD',
             broadcastNetworks: null,
             homeScore: null,
             awayScore: null,
             status: game.status,
             gameType: game.game_type,
             venue: {
               name: game.venue_name,
               city: game.venue_city,
               state: game.venue_state,
               capacity: null,
               indoor: null,
               location: game.venue_city && game.venue_state ? `${game.venue_city}, ${game.venue_state}` : null
             },
             weather: null
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
