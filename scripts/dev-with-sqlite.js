#!/usr/bin/env node

/**
 * Development script to run with local SQLite database
 * This uses the local SQLite database for development
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development server with local SQLite database...');
console.log('📊 This will use the local SQLite database (faster for development)');

// Unset the environment variable to use SQLite
delete process.env.USE_TURSO_LOCALLY;

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
