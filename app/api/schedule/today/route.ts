/**
 * Today's Games API Route
 * Returns games scheduled for today
 */

import { NextResponse } from 'next/server';
import { getRows } from '@/lib/database/hybrid-connection';

export async function GET(request: Request) {
  try {
    console.log('📅 Fetching today\'s games...');
    
    // Get today's date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`📅 Looking for games on: ${todayString}`);
    
    // Get games scheduled for today's actual date
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
        ht.team_color_primary as home_primary_color,
        ht.team_color_secondary as home_secondary_color,
        at.team_color_primary as away_primary_color,
        at.team_color_secondary as away_secondary_color,
        htr.wins as home_wins,
        htr.losses as home_losses,
        htr.ties as home_ties,
        atr.wins as away_wins,
        atr.losses as away_losses,
        atr.ties as away_ties
      FROM games g
      LEFT JOIN teams ht ON g.home_team = ht.team_id
      LEFT JOIN teams at ON g.away_team = at.team_id
      LEFT JOIN team_records htr ON g.home_team = htr.team_id AND htr.season = 2025
      LEFT JOIN team_records atr ON g.away_team = atr.team_id AND atr.season = 2025
      WHERE g.season = 2025 AND g.game_date = ?
      ORDER BY g.game_id
    `, [todayString]);// Format games for the frontend
    const formattedGames = games.map((game: any) => {
      // Use the actual game date from the database
      const gameDate = new Date(game.game_date);
      
      // Add some variety to game times (1:00 PM, 4:25 PM, 8:20 PM ET)
      const gameTimes = ['13:00', '16:25', '20:20'];
      const timeIndex = Math.floor(Math.random() * gameTimes.length);
      const gameTime = gameTimes[timeIndex];
      
      const gameDateTime = new Date(gameDate);
      const [hours, minutes] = gameTime.split(':');
      gameDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Determine broadcast network based on game time
      let broadcast = 'CBS';
      if (gameTime === '16:25') broadcast = 'FOX';
      if (gameTime === '20:20') broadcast = 'NBC';
      
      return {
        id: game.game_id,
        week: game.week,
        homeTeam: {
          id: game.home_team,
          name: game.home_team_name || game.home_team,
          abbr: game.home_team_abbr || game.home_team,
          primaryColor: game.home_primary_color || '#000000',
          secondaryColor: game.home_secondary_color || '#FFFFFF',
          record: `${game.home_wins || 0}-${game.home_losses || 0}${game.home_ties > 0 ? `-${game.home_ties}` : ''}`,
          wins: game.home_wins || 0,
          losses: game.home_losses || 0,
          ties: game.home_ties || 0
        },
        awayTeam: {
          id: game.away_team,
          name: game.away_team_name || game.away_team,
          abbr: game.away_team_abbr || game.away_team,
          primaryColor: game.away_primary_color || '#000000',
          secondaryColor: game.away_secondary_color || '#FFFFFF',
          record: `${game.away_wins || 0}-${game.away_losses || 0}${game.away_ties > 0 ? `-${game.away_ties}` : ''}`,
          wins: game.away_wins || 0,
          losses: game.away_losses || 0,
          ties: game.away_ties || 0
        },
        gameTime: gameDateTime.toISOString(),
        broadcast: broadcast,
        homeScore: game.home_score,
        awayScore: game.away_score,
        status: game.home_score !== null ? 'final' : 'scheduled'
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
