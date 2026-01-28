/**
 * Database Setup Script (JavaScript wrapper)
 */

const { spawn } = require('child_process');
const path = require('path');

const setupScript = path.join(__dirname, 'setup-db.ts');

console.log('Running database setup with tsx...\n');

const childProcess = spawn('npx', ['tsx', setupScript], {
  stdio: 'inherit',
  shell: true
});

childProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`\nSetup script exited with code ${code}`);
  }
});
