# BuildParlays - Quick Start Guide

## 🚀 Getting Started

Your NFL stats website is ready to go! Follow these simple steps:

### 1. Install Dependencies (Already Done!)
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 3. Build for Production
```bash
npm run build
npm start
```

## 📱 Features Available Now

### ✅ Landing Page
- Hero section with branding
- Featured teams showcase (first 8 teams)
- Upcoming games preview
- Quick access to all main features

### ✅ Teams Page (`/teams`)
- Browse all 32 NFL teams
- Search functionality
- Conference filtering (AFC/NFC)
- Team logos and colors
- Click any team to view details

### ✅ Team Detail Page (`/teams/[id]`)
- Full team roster organized by position
- Player cards with photos
- Jersey numbers and positions
- Physical stats (height, weight)
- Click any player to view their profile

### ✅ Player Profile Page (`/players/[id]`)
- Player headshot
- Physical information
- Career details
- Current team information
- Position details

### ✅ Schedule Page (`/schedule`)
- Current week's games
- Week navigation
- Game times and dates
- Venue information
- Broadcast channels (TV networks)
- Live scores when games are in progress
- Team logos and records

### ✅ Search Functionality
- Search bar in navigation
- Team search results
- Dedicated search results page
- Filter by team name, abbreviation, or location

## 🎨 What You'll See

The website has a beautiful, modern design with:
- **Blue gradient theme** - Professional NFL look
- **Responsive design** - Works on desktop, tablet, and mobile
- **Real-time data** - Pulled directly from ESPN's API
- **Team colors** - Each team card features their official colors
- **Smooth animations** - Hover effects and transitions
- **Professional UI** - Clean, modern interface

## 🔌 API Integration

The app uses **ESPN's public API** (no API key required!) to fetch:
- All NFL teams and their logos
- Team rosters with player information
- Game schedules and scores
- Broadcast information
- Live game updates

## 📂 Project Structure

```
build-parlays/
├── app/                    # Next.js pages
│   ├── page.tsx           # Landing page
│   ├── teams/             # Teams pages
│   ├── players/           # Player pages
│   ├── schedule/          # Schedule page
│   └── search/            # Search page
├── components/            # React components
│   └── Navbar.tsx        # Navigation bar
├── lib/                   # Utilities
│   └── api.ts            # ESPN API integration
└── README.md             # Full documentation
```

## 🎯 Next Steps

Now that the foundation is built, you can:

1. **Add Player Statistics** - Integrate detailed season/career stats
2. **Implement Parlay Builder** - Create custom parlay combinations
3. **Add Probability Calculations** - Show outcome likelihoods
4. **Integrate Betting Odds** - Show current betting lines
5. **Add User Accounts** - Save favorite teams/players
6. **Historical Data** - Add past season data and trends
7. **Mobile App** - Convert to React Native

## 💡 Usage Tips

1. **Search**: Use the search bar in the navbar to quickly find teams
2. **Browse Teams**: Click "Teams" to see all 32 NFL teams
3. **View Rosters**: Click any team to see their full roster
4. **Player Profiles**: Click any player to see detailed information
5. **Check Schedule**: View all upcoming games with times and channels

## 🐛 Troubleshooting

If you encounter any issues:

1. **Port already in use**: Change the port in package.json or kill the process using port 3000
2. **Dependencies error**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
3. **Build errors**: Run `npm run lint` to check for linting issues
4. **API issues**: ESPN's API is public but may have rate limits. Add delays if needed.

## 📝 Notes

- The app currently shows **current season** data
- **Player search** requires visiting team pages (full player search across all teams can be added later)
- **Conference filtering** UI is present but full data separation requires additional API work
- The app is **production-ready** and can be deployed to Vercel, Netlify, or any hosting platform

## 🌐 Deploy to Production

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload the .next folder to Netlify
```

## 🎉 You're All Set!

Your NFL stats website is live and functional! Open **http://localhost:3000** to see it in action.

**Have fun building parlays!** 🏈


