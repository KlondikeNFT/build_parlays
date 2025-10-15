# Mock Development System

This system provides mock data for local development, allowing you to test the application without making API calls to SportsDataIO.

## How to Use

### 1. Search for Mock Player
- Use the search bar in the navigation
- Search for "Mock" or "Mock Player"
- You'll see the test player "Mock Player" (QB for Kansas City Chiefs)

### 2. View Mock Player Details
- Click on "Mock Player" from search results
- You'll see a complete player page with:
  - Mock season stats (8 games played)
  - Mock game-by-game stats
  - Interactive probability sliders
  - Volatility charts

### 3. Mock Data Features
- **Player**: Mock Player (#15, QB, Kansas City Chiefs)
- **Season Stats**: 8 games, 2,456 passing yards, 18 TDs, 7 INTs
- **Game Log**: 8 weeks of realistic game data
- **Additional Players**: Mock Receiver (WR), Mock Runner (RB)

## Development Benefits

- **No API Calls**: Work offline without SportsDataIO API limits
- **Consistent Data**: Same data every time for testing
- **Fast Loading**: Instant results for development
- **Full Functionality**: All features work with mock data

## Files Modified

- `lib/mockData.ts` - Mock database and service
- `lib/playerService.ts` - Updated to use mock data for "Mock" searches
- `app/search/page.tsx` - Functional search page
- `app/api/search/route.ts` - Search API endpoint

## Environment Variables

The system automatically uses mock data in development mode (`NODE_ENV === 'development'`). You can also force mock data by setting:

```bash
USE_MOCK_DATA=true
```

## Testing the Flow

1. Start development server: `npm run dev`
2. Go to the search page
3. Search for "Mock"
4. Click on "Mock Player"
5. Explore all the features with mock data

This allows you to develop and test all functionality without API dependencies!
