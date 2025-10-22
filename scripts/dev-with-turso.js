#!/usr/bin/env node

/**
 * Development script to run with Turso database
 * This allows you to test locally with the production database
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development server with Turso database...');
console.log('📊 This will use the production Turso database instead of local SQLite');
console.log('⚠️  Make sure you have the TURSO_URL and TURSO_AUTH_TOKEN environment variables set');

// Set the environment variable to use Turso
process.env.USE_TURSO_LOCALLY = 'true';

// Start the Next.js development server
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

devProcess.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});

devProcess.on('error', (error) => {
  console.error('Failed to start development server:', error);
});
