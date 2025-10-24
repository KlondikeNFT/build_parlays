# BuildParlays - NFL Stats & Analytics Platform

A modern web application for viewing NFL team and player statistics, game schedules, and analytics. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Landing Page** - Beautiful hero section with featured teams and upcoming games
- **All Teams** - Browse all 32 NFL teams with logos and team colors
- **Team Details** - View detailed team information and complete rosters organized by position
- **Player Profiles** - Access individual player statistics and information
- **Game Schedule** - View NFL game schedules with dates, times, venues, and broadcast information
- **Search** - Quickly find teams and players across the platform
- **Real-time Data** - Integrated with ESPN's public API for live NFL data

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Source:** ESPN Public API
- **Icons:** Lucide React
- **Date Handling:** date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd build-parlays
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
build-parlays/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout with navbar
│   ├── globals.css          # Global styles
│   ├── teams/               # Teams pages
│   │   ├── page.tsx        # All teams list
│   │   └── [id]/           # Team detail page
│   ├── players/            # Player pages
│   │   └── [id]/           # Player detail page
│   ├── schedule/           # Schedule page
│   └── search/             # Search results page
├── components/              # React components
│   └── Navbar.tsx          # Navigation bar
├── lib/                     # Utility functions
│   └── api.ts              # API integration
├── public/                  # Static assets
└── package.json            # Dependencies
```

## API Integration

The app uses ESPN's public API endpoints:
- Teams data
- Team rosters
- Player information
- Game schedules and scores

No API key required for the ESPN public endpoints used in this project.

## Features Roadmap

### Current Features ✅
- Landing page with featured content
- Team browsing and filtering
- Team detail pages with full rosters
- Player profile pages
- Game schedule with broadcast info
- Search functionality for teams

### Future Enhancements 🚀
- Player statistics and performance metrics
- Advanced search for players across all teams
- Parlay building tools
- Outcome probability calculations
- Betting odds integration
- Historical data and trends
- User accounts and saved parlays
- Mobile app

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Data provided by ESPN's public API
- Icons from Lucide React
- Built with Next.js and Tailwind CSS


# Deployment trigger Fri Oct 24 15:16:51 EDT 2025
