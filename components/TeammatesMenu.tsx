'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { getTeamColors, getWikipediaLogoUrl } from '@/lib/teamColors';

interface Teammate {
  id: string;
  name: string;
  position: string;
  number: string;
  team: string;
  photoUrl?: string;
  teamLogoUrl?: string;
}

interface TeammatesMenuProps {
  teammates: Teammate[];
  currentPlayerId: string;
}

export default function TeammatesMenu({ teammates, currentPlayerId }: TeammatesMenuProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (teammateId: string, team: string) => {
    setImageErrors(prev => new Set([...prev, teammateId]));
  };

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-600 mb-3">Teammates</h2>
      
      <div className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
        {teammates.map((teammate) => (
          <Link
            key={teammate.id}
            href={`/players/${teammate.id}?name=${encodeURIComponent(teammate.name)}&team=${teammate.team}`}
            className={`flex-shrink-0 w-16 text-center transition-transform hover:scale-105 ${
              teammate.id === currentPlayerId ? 'opacity-50 cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="relative w-12 h-12 mx-auto mb-1">
              {imageErrors.has(teammate.id) ? (
                // Show Wikipedia team logo if player image failed
                (() => {
                  const wikipediaLogoUrl = getWikipediaLogoUrl(teammate.team);
                  if (wikipediaLogoUrl) {
                    return (
                      <Image
                        src={wikipediaLogoUrl}
                        alt={`${teammate.team} logo`}
                        fill
                        className="object-contain rounded-md"
                        onError={() => {
                          // Final fallback to team-colored logo
                          const teamColors = getTeamColors(teammate.team);
                          const container = document.querySelector(`[data-teammate-id="${teammate.id}"]`);
                          if (container) {
                            container.innerHTML = `
                              <div class="w-12 h-12 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm" style="background: linear-gradient(135deg, ${teamColors.primary}, ${teamColors.secondary})">
                                ${teammate.team}
                              </div>
                            `;
                          }
                        }}
                      />
                    );
                  } else {
                    const teamColors = getTeamColors(teammate.team);
                    return (
                      <div 
                        className="w-12 h-12 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm" 
                        style={{ background: `linear-gradient(135deg, ${teamColors.primary}, ${teamColors.secondary})` }}
                      >
                        {teammate.team}
                      </div>
                    );
                  }
                })()
              ) : (
                // Try player image first
                <div data-teammate-id={teammate.id}>
                  <Image
                    src={teammate.photoUrl || `https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${teammate.id}.png`}
                    alt={teammate.name}
                    fill
                    className="object-cover rounded-md"
                    onError={() => handleImageError(teammate.id, teammate.team)}
                  />
                </div>
              )}
            </div>
            <div className="text-xs font-medium text-gray-800 truncate">
              {teammate.name}
            </div>
            <div className="text-xs text-gray-500">
              {teammate.position} • #{teammate.number}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
