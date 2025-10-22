/**
 * Players API Route
 * Server-side endpoint for player data
 */

import { NextResponse } from 'next/server';
import { getRows, getRow } from '@/lib/database/hybrid-connection';
import { mockDataService } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const team = searchParams.get('team');
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const top = searchParams.get('top');

    if (id) {
      // Get specific player by ID
      console.log(`API: Fetching player by ID: ${id}`);
      
      // Get player info
      const player = await getRow(`
        SELECT 
          p.player_id,
          p.first_name,
          p.last_name,
          p.position,
          p.team,
          p.jersey_number,
          p.headshot_url,
          p.status,
          p.height,
          p.weight,
          p.birth_date,
          p.college,
          p.experience
        FROM players p
        WHERE p.player_id = ?
      `, [id]);
      
      if (!player) {
        console.log('Player not found, using mock data');
        return NextResponse.json(await mockDataService.getMockPlayerWithStats());
      }
      
      // Get season stats
      const seasonStats = await getRow(`
        SELECT *
        FROM player_season_stats
        WHERE player_id = ? AND season = 2025
        ORDER BY season DESC
        LIMIT 1
      `, [id]);
      
      // Get game log
      const gameLog = await getRows(`
        SELECT *
        FROM player_game_stats
        WHERE player_id = ? AND season = 2025
        ORDER BY week DESC
        LIMIT 10
      `, [id]);
      
      const result = {
        player: {
          PlayerID: player.player_id,
          FirstName: player.first_name,
          LastName: player.last_name,
          Position: player.position,
          Team: player.team || seasonStats?.team || 'Unknown',
          Number: player.jersey_number,
          PhotoUrl: player.headshot_url,
          Status: player.status,
          Height: player.height,
          Weight: player.weight,
          BirthDate: player.birth_date,
          College: player.college,
          Experience: player.experience
        },
        seasonStats: seasonStats ? {
          PlayerID: seasonStats.player_id,
          Name: `${player.first_name} ${player.last_name}`,
          Team: seasonStats.team,
          Position: player.position,
          Played: seasonStats.games_played || 0,
          Started: seasonStats.games_started || 0,
          PassingYards: seasonStats.passing_yards || 0,
          PassingTouchdowns: seasonStats.passing_touchdowns || 0,
          PassingInterceptions: seasonStats.passing_interceptions || 0,
          PassingCompletions: seasonStats.passing_completions || 0,
          PassingAttempts: seasonStats.passing_attempts || 0,
          RushingYards: seasonStats.rushing_yards || 0,
          RushingTouchdowns: seasonStats.rushing_touchdowns || 0,
          RushingAttempts: seasonStats.rushing_attempts || 0,
          ReceivingYards: seasonStats.receiving_yards || 0,
          ReceivingTouchdowns: seasonStats.receiving_touchdowns || 0,
          Receptions: seasonStats.receptions || 0,
          ReceivingTargets: seasonStats.receiving_targets || 0
        } : null,
        gameLog: gameLog.map(game => ({
          PlayerID: game.player_id,
          Name: `${player.first_name} ${player.last_name}`,
          Team: game.team,
          Position: player.position,
          Week: game.week,
          Opponent: game.opponent,
          HomeOrAway: game.home_away,
          Played: game.played || 0,
          PassingYards: game.passing_yards || 0,
          PassingTouchdowns: game.passing_touchdowns || 0,
          PassingInterceptions: game.passing_interceptions || 0,
          PassingCompletions: game.passing_completions || 0,
          PassingAttempts: game.passing_attempts || 0,
          RushingYards: game.rushing_yards || 0,
          RushingTouchdowns: game.rushing_touchdowns || 0,
          RushingAttempts: game.rushing_attempts || 0,
          ReceivingYards: game.receiving_yards || 0,
          ReceivingTouchdowns: game.receiving_touchdowns || 0,
          Receptions: game.receptions || 0,
          ReceivingTargets: game.receiving_targets || 0
        }))
      };
      
      console.log(`✅ Retrieved real player data for ${player.first_name} ${player.last_name}`);
      return NextResponse.json(result);
      
    } else if (name) {
      // Search players by name
      console.log(`API: Searching players by name: ${name}`);
      
      const searchQuery = `%${name.toLowerCase()}%`;
      const players = await getRows(`
        SELECT DISTINCT
          p.player_id,
          p.first_name,
          p.last_name,
          p.position,
          p.team,
          p.jersey_number,
          p.headshot_url,
          p.status
        FROM players p
        WHERE 
          (LOWER(p.first_name || ' ' || p.last_name) LIKE ? OR
          LOWER(p.last_name) LIKE ? OR
          LOWER(p.first_name) LIKE ?)
          AND p.status = 'ACT'
        ORDER BY p.last_name, p.first_name
        LIMIT 10
      `, [searchQuery, searchQuery, searchQuery]);
      
      const result = players.map(player => ({
        PlayerID: player.player_id,
        FirstName: player.first_name,
        LastName: player.last_name,
        Position: player.position,
        Team: player.team || 'Unknown',
        Number: player.jersey_number,
        PhotoUrl: player.headshot_url,
        Status: player.status
      }));
      
      console.log(`✅ Found ${result.length} players matching "${name}"`);
      return NextResponse.json(result);
      
    } else if (search) {
      // Legacy search parameter
      const searchQuery = `%${search.toLowerCase()}%`;
      const players = await getRows(`
        SELECT DISTINCT
          p.player_id,
          p.first_name,
          p.last_name,
          p.position,
          p.team,
          p.jersey_number,
          p.headshot_url,
          p.status
        FROM players p
        WHERE 
          (LOWER(p.first_name || ' ' || p.last_name) LIKE ? OR
          LOWER(p.last_name) LIKE ? OR
          LOWER(p.first_name) LIKE ?)
          AND p.status = 'ACT'
        ORDER BY p.last_name, p.first_name
        LIMIT 10
      `, [searchQuery, searchQuery, searchQuery]);
      
      return NextResponse.json(players);
      
    } else if (top) {
      // Get top performers for 2025 season
      const topPerformers = await getRows(`
        SELECT 
          p.player_id,
          p.first_name,
          p.last_name,
          p.position,
          p.team,
          p.jersey_number,
          p.headshot_url,
          s.passing_yards,
          s.passing_touchdowns,
          s.rushing_yards,
          s.rushing_touchdowns,
          s.receiving_yards,
          s.receiving_touchdowns
        FROM players p
        JOIN player_season_stats s ON p.player_id = s.player_id
        WHERE s.season = 2025 AND p.status = 'ACT'
        ORDER BY (s.passing_yards + s.rushing_yards + s.receiving_yards) DESC
        LIMIT 10
      `);
      
      return NextResponse.json(topPerformers);
    }

    // Default: return mock top players
    console.log('API: Returning mock top players.');
    const topPlayers = await mockDataService.getTopPlayers();
    return NextResponse.json(topPlayers);

  } catch (error: any) {
    console.error('Error getting players:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}