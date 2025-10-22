/**
 * Current Week Schedule API Route
 * Returns games for the current week of the 2025 season
 */

import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'nfl.db');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || '7'; // Default to week 7 (current week)
    
    console.log(`📅 Fetching schedule for week ${week}...`);
    
    const db = new Database(DB_PATH);
    
    // Get games for the specified week
    const gamesStmt = db.prepare(`
      SELECT 
        g.game_id,
        g.week,
        g.home_team,
        g.away_team,
        g.home_score,
        g.away_score,
        ht.team_name as home_team_name,
        at.team_name as away_team_name,
        ht.team_abbr as home_team_abbr,
        at.team_abbr as away_team_abbr
      FROM games g
      LEFT JOIN teams ht ON g.home_team = ht.team_id
      LEFT JOIN teams at ON g.away_team = at.team_id
      WHERE g.season = 2025 AND g.week = ?
      ORDER BY g.game_id
    `);
    
    const games = gamesStmt.all(parseInt(week));
    db.close();
    
    // Format games for the frontend
    const formattedGames = games.map((game, index) => {
      // Create proper dates for each week (NFL season starts around September 7, 2025)
      const seasonStart = new Date(2025, 8, 7); // September 7, 2025
      const gameDate = new Date(seasonStart);
      gameDate.setDate(seasonStart.getDate() + (parseInt(week) - 1) * 7);
      
      return {
        id: game.game_id,
        date: gameDate.toISOString(),
      competitions: [{
        id: game.game_id,
        competitors: [
          {
            id: game.away_team,
            team: {
              id: game.away_team,
              displayName: game.away_team_name || game.away_team,
              logos: [{ href: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.away_team.toLowerCase()}.png` }]
            },
            score: game.away_score ? game.away_score.toString() : undefined
          },
          {
            id: game.home_team,
            team: {
              id: game.home_team,
              displayName: game.home_team_name || game.home_team,
              logos: [{ href: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.home_team.toLowerCase()}.png` }]
            },
            score: game.home_score ? game.home_score.toString() : undefined
          }
        ],
        broadcasts: [{ names: ['CBS', 'FOX', 'NBC', 'ESPN'] }] // Default broadcast
      }]
      };
    });
    
    console.log(`✅ Found ${formattedGames.length} games for week ${week}`);
    
    return NextResponse.json({
      week: parseInt(week),
      games: formattedGames,
      totalGames: formattedGames.length
    });
    
  } catch (error: any) {
    console.error('Error fetching current schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
