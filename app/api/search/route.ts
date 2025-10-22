/**
 * Search API Route
 * Handles search for players and teams using real database
 */

import { NextResponse } from 'next/server';
import { getDatabase, getRows } from '@/lib/database/hybrid-connection';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'all', 'players', 'teams'
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        players: [], 
        teams: [],
        message: 'Query must be at least 2 characters long'
      });
    }

    console.log(`🔍 Searching for: "${query}" (type: ${type || 'all'})`);

    // Connect to database
    const db = getDatabase();
    
    const searchQuery = `%${query.trim().toLowerCase()}%`;
    const results: { players: any[], teams: any[] } = { players: [], teams: [] };

    // Search players if not teams-only
    if (type !== 'teams') {
      const players = await getRows(`
        SELECT DISTINCT
          p.player_id,
          p.first_name,
          p.last_name,
          p.position,
          p.team,
          p.jersey_number,
          p.headshot_url,
          p.status,
          s.games_played,
          s.passing_yards,
          s.passing_touchdowns,
          s.rushing_yards,
          s.rushing_touchdowns,
          s.receiving_yards,
          s.receiving_touchdowns
        FROM players p
        LEFT JOIN player_season_stats s ON p.player_id = s.player_id AND s.season = 2025
        WHERE 
          (LOWER(p.first_name || ' ' || p.last_name) LIKE ? OR
          LOWER(p.last_name) LIKE ? OR
          LOWER(p.first_name) LIKE ? OR
          LOWER(p.position) LIKE ? OR
          LOWER(p.team) LIKE ?)
          AND p.status = 'ACT'
        ORDER BY 
          CASE WHEN LOWER(p.first_name || ' ' || p.last_name) LIKE ? THEN 1 ELSE 2 END,
          p.last_name, p.first_name
        LIMIT 20
      `, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]);
      
      // Group by player_id to avoid duplicates
      const playerMap = new Map();
      players.forEach((player: any) => {
        if (!playerMap.has(player.player_id)) {
          playerMap.set(player.player_id, {
            PlayerID: player.player_id,
            FirstName: player.first_name,
            LastName: player.last_name,
            Position: player.position,
            Team: player.team || 'Unknown',
            Number: player.jersey_number,
            PhotoUrl: player.headshot_url,
            Status: player.status,
            GamesPlayed: player.games_played || 0,
            PassingYards: player.passing_yards || 0,
            PassingTouchdowns: player.passing_touchdowns || 0,
            RushingYards: player.rushing_yards || 0,
            RushingTouchdowns: player.rushing_touchdowns || 0,
            ReceivingYards: player.receiving_yards || 0,
            ReceivingTouchdowns: player.receiving_touchdowns || 0
          });
        }
      });
      
      results.players = Array.from(playerMap.values());
    }

    // Search teams if not players-only
    if (type !== 'players') {
      const teams = await getRows(`
        SELECT 
          team_id,
          team_abbr,
          team_name,
          team_conference,
          team_division,
          team_color_primary,
          team_color_secondary
        FROM teams
        WHERE 
          LOWER(team_name) LIKE ? OR
          LOWER(team_abbr) LIKE ? OR
          LOWER(team_conference) LIKE ? OR
          LOWER(team_division) LIKE ?
        ORDER BY team_name
        LIMIT 10
      `, [searchQuery, searchQuery, searchQuery, searchQuery]);
      
      results.teams = teams.map((team: any) => ({
        TeamID: team.team_id,
        Key: team.team_abbr,
        City: team.team_name.split(' ')[0] || team.team_name,
        Name: team.team_name.split(' ').slice(1).join(' ') || team.team_name,
        FullName: team.team_name,
        Conference: team.team_conference,
        Division: team.team_division,
        PrimaryColor: team.team_color_primary,
        SecondaryColor: team.team_color_secondary
      }));
    }

    db.close();

    // Add search metadata
    const searchResults = {
      ...results,
      query: query.trim(),
      totalResults: results.players.length + results.teams.length,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Found ${searchResults.totalResults} results for "${query}"`);
    
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('❌ Error in search API:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        players: [], 
        teams: [],
        message: 'An error occurred while searching'
      },
      { status: 500 }
    );
  }
}