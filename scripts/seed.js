/**
 * Database Seeding Script (JavaScript version)
 * 
 * This is a JavaScript wrapper for the TypeScript seed script.
 * Uses tsx to run TypeScript directly.
 */

const { spawn } = require('child_process');
const path = require('path');

const seedScript = path.join(__dirname, 'seed.ts');

console.log('Running database seeding with tsx...\n');

const childProcess = spawn('npx', ['tsx', seedScript], {
  stdio: 'inherit',
  shell: true
});

childProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`\nSeed script exited with code ${code}`);
  }
});
