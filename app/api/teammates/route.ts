import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/hybrid-connection';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    
    // First, get the player's team from season stats
    const playerQuery = `
      SELECT p.team, s.team as season_team
      FROM players p
      LEFT JOIN player_season_stats s ON p.player_id = s.player_id AND s.season = 2025
      WHERE p.player_id = ?
    `;
    const player = db.prepare(playerQuery).get(playerId);
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    const team = player.season_team || player.team;
    console.log(`🔍 Finding teammates for ${team} based on recent game participation...`);
    
    // Get all players from the team who have played in any game this season
    // with their total play counts, ordered by most plays, excluding inactive players
    const teammatesQuery = `
      SELECT 
        p.player_id,
        p.first_name,
        p.last_name,
        p.position,
        p.jersey_number,
        pgs.team,
        p.status,
        t.team_logo_url,
        SUM(COALESCE(pgs.passing_attempts, 0) + 
            COALESCE(pgs.rushing_attempts, 0) + 
            COALESCE(pgs.receiving_targets, 0) + 
            COALESCE(pgs.passing_completions, 0) +
            COALESCE(pgs.receptions, 0)) as total_plays
      FROM players p
      LEFT JOIN player_game_stats pgs ON p.player_id = pgs.player_id AND pgs.season = 2025
      LEFT JOIN teams t ON pgs.team = t.team_abbr
      WHERE pgs.team = ? AND p.player_id != ? 
        AND (p.status = 'ACT' OR p.status IS NULL)
      GROUP BY p.player_id, p.first_name, p.last_name, p.position, p.jersey_number, pgs.team, p.status, t.team_logo_url
      ORDER BY total_plays DESC
      LIMIT 30
    `;
    
    const allTeammates = db.prepare(teammatesQuery).all(team, playerId);
    
    // Separate offense and defense players
    const offensePositions = ['QB', 'RB', 'WR', 'TE', 'FB', 'OL', 'C', 'G', 'T'];
    const defensePositions = ['DE', 'DT', 'NT', 'LB', 'ILB', 'OLB', 'CB', 'S', 'FS', 'SS', 'DB'];
    
    const offensePlayers = allTeammates.filter(p => offensePositions.includes(p.position));
    const defensePlayers = allTeammates.filter(p => defensePositions.includes(p.position));
    
    // Take top 10 from offense, top 5 from defense (or more if not enough defense players)
    const topOffense = offensePlayers.slice(0, 10);
    const topDefense = defensePlayers.slice(0, 5);
    
    // Combine and format the results
    const teammates = [...topOffense, ...topDefense].map(player => ({
      id: player.player_id,
      name: `${player.first_name} ${player.last_name}`,
      position: player.position,
      number: player.jersey_number || '?',
      team: player.team,
      totalPlays: player.total_plays,
      photoUrl: `https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${player.player_id}.png`,
      teamLogoUrl: player.team_logo_url
    }));
    
    console.log(`✅ Found ${teammates.length} active teammates (${topOffense.length} offense, ${topDefense.length} defense)`);
    
    return NextResponse.json({ 
      teammates,
      recentGame: {
        week: null,
        gameId: null
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching teammates:', error);
    return NextResponse.json({ error: 'Failed to fetch teammates' }, { status: 500 });
  }
}
