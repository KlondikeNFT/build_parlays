/**
 * NFL Team Colors
 * Primary and secondary colors for each team
 */

export interface TeamColors {
  primary: string;
  secondary: string;
  gradient: string; // Tailwind gradient classes
}

export const NFL_TEAM_COLORS: Record<string, TeamColors> = {
  // AFC East
  BUF: {
    primary: '#00338D',
    secondary: '#C60C30',
    gradient: 'from-blue-700 via-blue-600 to-red-600',
  },
  MIA: {
    primary: '#008E97',
    secondary: '#FC4C02',
    gradient: 'from-teal-600 via-teal-500 to-orange-500',
  },
  NE: {
    primary: '#002244',
    secondary: '#C60C30',
    gradient: 'from-slate-800 via-blue-900 to-red-600',
  },
  NYJ: {
    primary: '#125740',
    secondary: '#FFFFFF',
    gradient: 'from-green-800 via-green-700 to-green-600',
  },

  // AFC North
  BAL: {
    primary: '#241773',
    secondary: '#000000',
    gradient: 'from-purple-900 via-purple-800 to-black',
  },
  CIN: {
    primary: '#FB4F14',
    secondary: '#000000',
    gradient: 'from-orange-600 via-orange-500 to-black',
  },
  CLE: {
    primary: '#311D00',
    secondary: '#FF3C00',
    gradient: 'from-orange-900 via-orange-700 to-orange-600',
  },
  PIT: {
    primary: '#FFB612',
    secondary: '#000000',
    gradient: 'from-yellow-500 via-yellow-600 to-black',
  },

  // AFC South
  HOU: {
    primary: '#03202F',
    secondary: '#A71930',
    gradient: 'from-slate-900 via-blue-900 to-red-700',
  },
  IND: {
    primary: '#002C5F',
    secondary: '#A2AAAD',
    gradient: 'from-blue-900 via-blue-800 to-blue-700',
  },
  JAX: {
    primary: '#006778',
    secondary: '#D7A22A',
    gradient: 'from-teal-800 via-teal-700 to-yellow-600',
  },
  TEN: {
    primary: '#0C2340',
    secondary: '#4B92DB',
    gradient: 'from-slate-900 via-blue-900 to-blue-600',
  },

  // AFC West
  DEN: {
    primary: '#FB4F14',
    secondary: '#002244',
    gradient: 'from-orange-600 via-orange-500 to-blue-900',
  },
  KC: {
    primary: '#E31837',
    secondary: '#FFB81C',
    gradient: 'from-red-600 via-red-500 to-yellow-500',
  },
  LV: {
    primary: '#000000',
    secondary: '#A5ACAF',
    gradient: 'from-black via-gray-800 to-gray-600',
  },
  LAC: {
    primary: '#0080C6',
    secondary: '#FFC20E',
    gradient: 'from-blue-600 via-blue-500 to-yellow-400',
  },

  // NFC East
  DAL: {
    primary: '#041E42',
    secondary: '#869397',
    gradient: 'from-slate-900 via-blue-900 to-blue-800',
  },
  NYG: {
    primary: '#0B2265',
    secondary: '#A71930',
    gradient: 'from-blue-900 via-blue-800 to-red-700',
  },
  PHI: {
    primary: '#004C54',
    secondary: '#A5ACAF',
    gradient: 'from-teal-900 via-teal-800 to-gray-700',
  },
  WAS: {
    primary: '#5A1414',
    secondary: '#FFB612',
    gradient: 'from-red-900 via-red-800 to-yellow-600',
  },

  // NFC North
  CHI: {
    primary: '#0B162A',
    secondary: '#C83803',
    gradient: 'from-slate-900 via-blue-900 to-orange-600',
  },
  DET: {
    primary: '#0076B6',
    secondary: '#B0B7BC',
    gradient: 'from-blue-600 via-blue-500 to-gray-400',
  },
  GB: {
    primary: '#203731',
    secondary: '#FFB612',
    gradient: 'from-green-900 via-green-800 to-yellow-500',
  },
  MIN: {
    primary: '#4F2683',
    secondary: '#FFC62F',
    gradient: 'from-purple-700 via-purple-600 to-yellow-500',
  },

  // NFC South
  ATL: {
    primary: '#A71930',
    secondary: '#000000',
    gradient: 'from-red-700 via-red-600 to-black',
  },
  CAR: {
    primary: '#0085CA',
    secondary: '#101820',
    gradient: 'from-blue-600 via-blue-500 to-gray-900',
  },
  NO: {
    primary: '#D3BC8D',
    secondary: '#101820',
    gradient: 'from-yellow-700 via-yellow-600 to-black',
  },
  TB: {
    primary: '#D50A0A',
    secondary: '#FF7900',
    gradient: 'from-red-600 via-red-500 to-orange-500',
  },

  // NFC West
  ARI: {
    primary: '#97233F',
    secondary: '#000000',
    gradient: 'from-red-800 via-red-700 to-black',
  },
  LAR: {
    primary: '#003594',
    secondary: '#FFA300',
    gradient: 'from-blue-800 via-blue-700 to-yellow-500',
  },
  SF: {
    primary: '#AA0000',
    secondary: '#B3995D',
    gradient: 'from-red-700 via-red-600 to-yellow-700',
  },
  SEA: {
    primary: '#002244',
    secondary: '#69BE28',
    gradient: 'from-blue-900 via-blue-800 to-green-600',
  },

  // Default fallback
  FA: {
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    gradient: 'from-blue-800 via-blue-700 to-blue-600',
  },
};

/**
 * Get team colors by team abbreviation
 */
export function getTeamColors(teamAbbr: string): TeamColors {
  return NFL_TEAM_COLORS[teamAbbr] || NFL_TEAM_COLORS.FA;
}

/**
 * Get Wikipedia logo URL for team
 */
export function getWikipediaLogoUrl(teamAbbr: string): string {
  const logoUrls: Record<string, string> = {
    'ARI': 'https://upload.wikimedia.org/wikipedia/en/7/72/Arizona_Cardinals_logo.svg',
    'ATL': 'https://upload.wikimedia.org/wikipedia/en/c/c5/Atlanta_Falcons_logo.svg',
    'BAL': 'https://upload.wikimedia.org/wikipedia/en/1/16/Baltimore_Ravens_logo.svg',
    'BUF': 'https://upload.wikimedia.org/wikipedia/en/7/77/Buffalo_Bills_logo.svg',
    'CAR': 'https://upload.wikimedia.org/wikipedia/en/5/5c/Carolina_Panthers_logo.svg',
    'CHI': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Chicago_Bears_logo.svg',
    'CIN': 'https://upload.wikimedia.org/wikipedia/commons/8/81/Cincinnati_Bengals_logo.svg',
    'CLE': 'https://upload.wikimedia.org/wikipedia/en/5/5c/Cleveland_Browns_logo.svg',
    'DAL': 'https://upload.wikimedia.org/commons/8/88/Dallas_Cowboys.svg',
    'DEN': 'https://upload.wikimedia.org/wikipedia/en/4/44/Denver_Broncos_logo.svg',
    'DET': 'https://upload.wikimedia.org/wikipedia/en/7/71/Detroit_Lions_logo.svg',
    'GB': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Green_Bay_Packers_logo.svg',
    'HOU': 'https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Texans_logo.svg',
    'IND': 'https://upload.wikimedia.org/wikipedia/commons/0/00/Indianapolis_Colts_logo.svg',
    'JAX': 'https://upload.wikimedia.org/wikipedia/en/7/74/Jacksonville_Jaguars_logo.svg',
    'KC': 'https://upload.wikimedia.org/wikipedia/en/e/e1/Kansas_City_Chiefs_logo.svg',
    'LV': 'https://upload.wikimedia.org/wikipedia/en/0/01/Las_Vegas_Raiders_logo.svg',
    'LAC': 'https://upload.wikimedia.org/wikipedia/en/7/79/Los_Angeles_Chargers_logo.svg',
    'LAR': 'https://upload.wikimedia.org/wikipedia/en/8/81/Los_Angeles_Rams_logo.svg',
    'MIA': 'https://upload.wikimedia.org/wikipedia/en/3/37/Miami_Dolphins_logo.svg',
    'MIN': 'https://upload.wikimedia.org/wikipedia/en/4/48/Minnesota_Vikings_logo.svg',
    'NE': 'https://upload.wikimedia.org/wikipedia/en/b/b9/New_England_Patriots_logo.svg',
    'NO': 'https://upload.wikimedia.org/wikipedia/en/9/9a/New_Orleans_Saints_logo.svg',
    'NYG': 'https://upload.wikimedia.org/wikipedia/commons/6/60/New_York_Giants_logo.svg',
    'NYJ': 'https://upload.wikimedia.org/wikipedia/en/6/6b/New_York_Jets_logo.svg',
    'PHI': 'https://upload.wikimedia.org/wikipedia/en/8/8e/Philadelphia_Eagles_logo.svg',
    'PIT': 'https://upload.wikimedia.org/wikipedia/en/d/de/Pittsburgh_Steelers_logo.svg',
    'SF': 'https://upload.wikimedia.org/wikipedia/en/3/3a/San_Francisco_49ers_logo.svg',
    'SEA': 'https://upload.wikimedia.org/wikipedia/en/8/8e/Seattle_Seahawks_logo.svg',
    'TB': 'https://upload.wikimedia.org/wikipedia/en/a/a2/Tampa_Bay_Buccaneers_logo.svg',
    'TEN': 'https://upload.wikimedia.org/wikipedia/en/c/c1/Tennessee_Titans_logo.svg',
    'WAS': 'https://upload.wikimedia.org/wikipedia/en/6/67/Washington_Commanders_logo.svg'
  };
  
  return logoUrls[teamAbbr] || '';
}

/**
 * Get likelihood gradient based on percentage
 */
export function getLikelihoodGradient(likelihood: number): string {
  if (likelihood >= 80) {
    return 'linear-gradient(to right, #10b981, #34d399, #6ee7b7)'; // green
  } else if (likelihood >= 70) {
    return 'linear-gradient(to right, #3b82f6, #60a5fa, #22d3ee)'; // blue
  } else if (likelihood >= 60) {
    return 'linear-gradient(to right, #eab308, #facc15, #fbbf24)'; // yellow
  } else {
    return 'linear-gradient(to right, #f97316, #fb923c, #f87171)'; // orange-red
  }
}

