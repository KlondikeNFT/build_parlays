# 🏈 NFLverse Database Setup

This guide will help you set up NFLverse as your local NFL database for BuildParlays.

## What is NFLverse?

NFLverse is a comprehensive NFL data repository that provides:
- **Player Stats**: Game-by-game and season statistics
- **Team Data**: Rosters, standings, schedules
- **Game Information**: Scores, schedules, weather
- **Historical Data**: Data going back to 1999
- **Multiple Formats**: CSV, Parquet, RDS

## Quick Start

### 1. Install Dependencies

```bash
npm install better-sqlite3 csv-parser
```

### 2. Download NFL Data

```bash
# Download all NFLverse data
node scripts/download-nflverse-data.js all

# Or download specific season
node scripts/download-nflverse-data.js season 2024
```

### 3. Import Data into Database

```bash
# Import all downloaded data
node scripts/import-nflverse-data.js all
```

### 4. Verify Setup

```bash
# Check database statistics
node scripts/db-manager.js stats

# View top performers
node scripts/db-manager.js top 2024
```

## Complete Update Workflow

For a complete update with backup and verification:

```bash
# Update all data (recommended)
node scripts/update-nfl-data.js all

# Update specific season
node scripts/update-nfl-data.js season 2024
```

## Database Management

### View Database Statistics
```bash
node scripts/db-manager.js stats
```

### View Top Performers
```bash
node scripts/db-manager.js top 2024
```

### View Teams
```bash
node scripts/db-manager.js teams
```

### View Upcoming Games
```bash
node scripts/db-manager.js upcoming 2024
```

### View Recent Games
```bash
node scripts/db-manager.js recent 2024
```

### Create Database Backup
```bash
node scripts/db-manager.js backup
```

### Clear Database
```bash
node scripts/db-manager.js clear
```

## Data Update Schedule

### Recommended Update Frequency

- **Weekly**: During the NFL season (September - February)
- **After Each Game**: For real-time accuracy
- **Offseason**: Monthly or as needed

### Manual Update Process

1. **Before Games**: Update data to get latest rosters and schedules
2. **After Games**: Update to get latest stats and results
3. **Weekly**: Full update to ensure data consistency

### Automated Updates (Optional)

You can set up a cron job for automatic updates:

```bash
# Add to crontab for weekly updates (Sundays at 6 AM)
0 6 * * 0 cd /path/to/build-parlays && node scripts/update-nfl-data.js all
```

## Database Structure

The database includes these main tables:

- **teams**: Team information, colors, divisions
- **players**: Player details, positions, teams
- **games**: Game schedules, scores, status
- **player_game_stats**: Individual game statistics
- **player_season_stats**: Season totals and averages
- **injuries**: Injury reports and status

## File Locations

- **Database**: `data/nfl.db`
- **CSV Data**: `data/nflverse/`
- **Backups**: `data/nfl-backup-*.db`
- **Scripts**: `scripts/`

## Troubleshooting

### Database is Empty
```bash
# Check if data was downloaded
ls -la data/nflverse/

# Re-download and import
node scripts/update-nfl-data.js all
```

### Import Errors
```bash
# Clear database and retry
node scripts/db-manager.js clear
node scripts/import-nflverse-data.js all
```

### Performance Issues
```bash
# Create backup and clear old data
node scripts/db-manager.js backup
node scripts/db-manager.js clear
node scripts/update-nfl-data.js all
```

## Data Sources

All data comes from the official NFLverse repository:
- **Repository**: https://github.com/nflverse/nflverse-data
- **Data Format**: CSV files
- **Update Frequency**: Real-time during games
- **Historical Coverage**: 1999-present

## Benefits of Local Database

✅ **Faster Loading**: No API calls or rate limits  
✅ **Offline Access**: Works without internet  
✅ **Cost Effective**: No API subscription fees  
✅ **Full Control**: Custom queries and analysis  
✅ **Historical Data**: Access to years of data  
✅ **Reliability**: No external service dependencies  

## Next Steps

1. **Test the Setup**: Visit your site and check player/team pages
2. **Set Update Schedule**: Decide how often to update data
3. **Monitor Performance**: Check database size and query speed
4. **Customize Queries**: Add your own database queries as needed

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure you have write permissions to the `data/` directory
4. Try the troubleshooting steps above

The database will automatically fall back to mock data if NFLverse data is not available, so your site will continue to work even if there are data issues.


