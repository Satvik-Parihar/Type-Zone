#!/usr/bin/env node

/**
 * Development start script for TypeZone
 * Runs both server and client in a single process (Windows-compatible)
 */

const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';

function startServer() {
  console.log('\n🚀 Starting TypeZone Backend...\n');
  
  const serverProcess = spawn(
    isWindows ? 'npm.cmd' : 'npm',
    ['--prefix', 'server', 'run', 'dev'],
    {
      cwd: __dirname,
      stdio: 'inherit',
      shell: isWindows
    }
  );

  serverProcess.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });

  return serverProcess;
}

function startClient() {
  console.log('\n🚀 Starting TypeZone Frontend...\n');
  
  const clientProcess = spawn(
    isWindows ? 'npm.cmd' : 'npm',
    ['--prefix', 'client', 'run', 'dev'],
    {
      cwd: __dirname,
      stdio: 'inherit',
      shell: isWindows
    }
  );

  clientProcess.on('error', (error) => {
    console.error('❌ Client error:', error);
    process.exit(1);
  });

  return clientProcess;
}

console.log(`
╔═══════════════════════════════════════════════════════════╗
║          TypeZone Development Environment                ║
║                                                           ║
║  Backend will start on:  http://localhost:5000           ║
║  Frontend will start on: http://localhost:5173           ║
║                                                           ║
║  Press Ctrl+C to stop all services                       ║
╚═══════════════════════════════════════════════════════════╝
`);

// Start both processes
const serverProcess = startServer();
const clientProcess = startClient();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down services...\n');
  serverProcess.kill();
  clientProcess.kill();
  setTimeout(() => process.exit(0), 1000);
});

process.on('SIGTERM', () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
});
