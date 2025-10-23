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
    
                        // Get games for the specified date from real NFL schedule table with team records
                        const games = await getRows(`
                          SELECT
                            rs.game_id,
                            rs.week,
                            rs.game_date,
                            rs.game_time,
                            rs.home_team_name,
                            rs.home_team_abbr,
                            rs.away_team_name,
                            rs.away_team_abbr,
                            rs.venue_name,
                            rs.venue_city,
                            rs.venue_state,
                            rs.broadcast_primary,
                            rs.status,
                            rs.game_type,
                            htr.wins as home_wins,
                            htr.losses as home_losses,
                            htr.ties as home_ties,
                            atr.wins as away_wins,
                            atr.losses as away_losses,
                            atr.ties as away_ties
                          FROM real_schedule_2025 rs
                          LEFT JOIN team_records htr ON rs.home_team_abbr = htr.team_id AND htr.season = 2025
                          LEFT JOIN team_records atr ON rs.away_team_abbr = atr.team_id AND atr.season = 2025
                          WHERE rs.game_date = ?
                          ORDER BY rs.game_time ASC
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
               record: `${game.home_wins || 0}-${game.home_losses || 0}${game.home_ties ? `-${game.home_ties}` : ''}`,
               wins: game.home_wins || 0,
               losses: game.home_losses || 0,
               ties: game.home_ties || 0,
             },
             awayTeam: {
               id: game.away_team_abbr,
               name: game.away_team_name,
               abbr: game.away_team_abbr,
               primaryColor: '#000000', // Default colors - you can enhance this later
               secondaryColor: '#FFFFFF',
               record: `${game.away_wins || 0}-${game.away_losses || 0}${game.away_ties ? `-${game.away_ties}` : ''}`,
               wins: game.away_wins || 0,
               losses: game.away_losses || 0,
               ties: game.away_ties || 0,
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
