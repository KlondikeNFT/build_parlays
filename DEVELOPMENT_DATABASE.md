# Development Database Options

You can now choose between two database options for local development:

## Option 1: Local SQLite Database (Default)
**Use when:** You want fast development with local data
```bash
npm run dev:sqlite
# or
npm run dev
```

**Pros:**
- ⚡ Very fast (no network requests)
- 🔄 Easy to reset/clear data
- 📊 Works offline
- 🛠️ Easy to debug

**Cons:**
- 📝 Data might be different from production
- 🔄 Need to manually sync data changes

## Option 2: Production Turso Database
**Use when:** You want to test with real production data
```bash
npm run dev:turso
```

**Prerequisites:**
Make sure you have these environment variables set in your `.env.local` file:
```env
TURSO_URL=libsql://your-turso-url
TURSO_AUTH_TOKEN=your-turso-token
```

**Pros:**
- 🎯 Real production data
- 🔄 Always up-to-date
- 🧪 Perfect for testing before deployment
- 📊 Same data as live site

**Cons:**
- 🌐 Requires internet connection
- ⏱️ Slightly slower (network requests)
- 💰 Uses Turso API calls

## Quick Commands

```bash
# Start with local SQLite (fast)
npm run dev:sqlite

# Start with production Turso (real data)
npm run dev:turso

# Regular development (defaults to SQLite)
npm run dev
```

## Which Should You Use?

### Use SQLite when:
- 🚀 Rapid development and testing
- 🔧 Building new features
- 🐛 Debugging issues
- 📱 Testing UI/UX changes

### Use Turso when:
- 🧪 Testing with real data
- 🔍 Verifying data accuracy
- 🚀 Pre-deployment testing
- 📊 Testing search and player pages

## Switching Between Databases

You can switch between databases anytime by stopping the dev server and running the other command. No code changes needed!

## Environment Variables

The system automatically detects which database to use based on:
- `NODE_ENV=production` → Always uses Turso
- `USE_TURSO_LOCALLY=true` → Forces Turso in development
- Default → Uses SQLite in development
