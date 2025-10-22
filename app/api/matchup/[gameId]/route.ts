/**
 * Game Matchup API Route
 * Returns detailed matchup information for a specific game
 */

import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'nfl.db');

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const gameId = params.gameId;
    console.log(`🏈 Fetching matchup data for game: ${gameId}`);
    
    const db = new Database(DB_PATH);
    
    // Get detailed game information
    const gameStmt = db.prepare(`
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
      WHERE g.game_id = ?
    `);
    
    const game = gameStmt.get(gameId) as any;
    
    if (!game) {
      db.close();
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Get recent games for both teams (last 3 games)
    const recentGamesStmt = db.prepare(`
      SELECT 
        game_id,
        week,
        home_team,
        away_team,
        home_score,
        away_score,
        CASE 
          WHEN home_team = ? THEN 'home'
          ELSE 'away'
        END as team_side,
        CASE 
          WHEN home_team = ? AND home_score > away_score THEN 'W'
          WHEN away_team = ? AND away_score > home_score THEN 'W'
          WHEN home_score = away_score THEN 'T'
          ELSE 'L'
        END as result
      FROM games
      WHERE (home_team = ? OR away_team = ?) AND season = 2025
      ORDER BY week DESC
      LIMIT 3
    `);
    
    const homeRecentGames = recentGamesStmt.all(game.home_team, game.home_team, game.home_team, game.home_team, game.home_team);
    const awayRecentGames = recentGamesStmt.all(game.away_team, game.away_team, game.away_team, game.away_team, game.away_team);
    
    // Get top players for each team
    const topPlayersStmt = db.prepare(`
      SELECT 
        p.player_id,
        p.first_name,
        p.last_name,
        p.position,
        p.team,
        s.passing_yards,
        s.rushing_yards,
        s.receiving_yards,
        s.passing_touchdowns,
        s.rushing_touchdowns,
        s.receiving_touchdowns,
        s.games_played
      FROM players p
      LEFT JOIN player_season_stats s ON p.player_id = s.player_id AND s.season = 2025
      WHERE p.team = ? AND s.games_played > 0
      ORDER BY 
        CASE p.position
          WHEN 'QB' THEN s.passing_yards
          WHEN 'RB' THEN s.rushing_yards
          WHEN 'WR' THEN s.receiving_yards
          WHEN 'TE' THEN s.receiving_yards
          ELSE 0
        END DESC
      LIMIT 5
    `);
    
    const homeTopPlayers = topPlayersStmt.all(game.home_team);
    const awayTopPlayers = topPlayersStmt.all(game.away_team);
    
    db.close();
    
    // Format the response
    const matchupData = {
      game: {
        id: game.game_id,
        week: game.week,
        date: game.game_date,
        homeScore: game.home_score,
        awayScore: game.away_score,
        status: game.home_score !== null ? 'final' : 'scheduled'
      },
      homeTeam: {
        id: game.home_team,
        name: game.home_team_name || game.home_team,
        abbr: game.home_team_abbr || game.home_team,
        conference: game.home_conference,
        division: game.home_division,
        primaryColor: game.home_primary_color || '#000000',
        secondaryColor: game.home_secondary_color || '#FFFFFF',
        record: `${game.home_wins || 0}-${game.home_losses || 0}${game.home_ties > 0 ? `-${game.home_ties}` : ''}`,
        wins: game.home_wins || 0,
        losses: game.home_losses || 0,
        ties: game.home_ties || 0,
        winPercentage: game.home_win_percentage || 0,
        recentGames: homeRecentGames,
        topPlayers: homeTopPlayers.map((player: any) => ({
          ...player,
          player_name: `${player.first_name} ${player.last_name}`
        }))
      },
      awayTeam: {
        id: game.away_team,
        name: game.away_team_name || game.away_team,
        abbr: game.away_team_abbr || game.away_team,
        conference: game.away_conference,
        division: game.away_division,
        primaryColor: game.away_primary_color || '#000000',
        secondaryColor: game.away_secondary_color || '#FFFFFF',
        record: `${game.away_wins || 0}-${game.away_losses || 0}${game.away_ties > 0 ? `-${game.away_ties}` : ''}`,
        wins: game.away_wins || 0,
        losses: game.away_losses || 0,
        ties: game.away_ties || 0,
        winPercentage: game.away_win_percentage || 0,
        recentGames: awayRecentGames,
        topPlayers: awayTopPlayers.map((player: any) => ({
          ...player,
          player_name: `${player.first_name} ${player.last_name}`
        }))
      }
    };
    
    console.log(`✅ Found matchup data for ${game.away_team_name} @ ${game.home_team_name}`);
    
    return NextResponse.json(matchupData);
    
  } catch (error: any) {
    console.error('Error fetching matchup data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
