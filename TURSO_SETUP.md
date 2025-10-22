# 🚀 Turso Database Setup for Vercel Deployment

## Why Turso?
- ✅ **SQLite-compatible** - minimal code changes
- ✅ **Serverless-friendly** - works with Vercel
- ✅ **Fast** - built for edge computing
- ✅ **Free tier** - generous limits

## 📋 Setup Steps

### 1. Create Turso Account
1. Go to [turso.tech](https://turso.tech)
2. Sign up with GitHub
3. Create a new database called `nfl-data`

### 2. Get Your Credentials
1. In Turso dashboard, click on your database
2. Copy the **Database URL**
3. Go to Settings → Tokens
4. Create a new token and copy the **Auth Token**

### 3. Set Environment Variables
Create a `.env.local` file in your project root:

```bash
# Turso Database Configuration
TURSO_URL=your-database-url-here
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 4. Migrate Your Data
```bash
# Run the migration script
node scripts/migrate-to-turso.js
```

### 5. Test Locally
```bash
# Test with Turso
npm run dev
```

### 6. Deploy to Vercel
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `TURSO_URL`
   - `TURSO_AUTH_TOKEN`
4. Deploy!

## 🔧 Migration Script Usage

The migration script will:
1. ✅ Connect to your local SQLite database
2. ✅ Create tables in Turso
3. ✅ Copy all data (teams, players, games, stats)
4. ✅ Verify the migration

## 🚨 Important Notes

- **Local Development**: Uses SQLite (faster, no network)
- **Production**: Uses Turso (serverless-compatible)
- **Hybrid System**: Automatically switches based on environment
- **Fallback**: If Turso fails, falls back to SQLite

## 📊 Database Schema

The migration preserves your current schema:
- `teams` - Team information
- `players` - Player information  
- `games` - Game schedules and results
- `player_game_stats` - Individual game statistics
- `player_season_stats` - Season aggregates
- `injuries` - Injury reports
- `team_records` - Team win/loss records

## 🎯 Next Steps

1. Set up Turso account
2. Get credentials
3. Run migration script
4. Test locally
5. Deploy to Vercel
6. Push to GitHub

Your app will work seamlessly in both environments! 🚀
