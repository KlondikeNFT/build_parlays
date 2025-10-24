/**
 * Placeholder image API for players without photos
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#e5e7eb"/>
      <circle cx="100" cy="80" r="40" fill="#9ca3af"/>
      <path d="M 60 160 Q 60 120 100 120 Q 140 120 140 160" fill="#9ca3af"/>
      <text x="100" y="190" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle">#${params.id}</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}














