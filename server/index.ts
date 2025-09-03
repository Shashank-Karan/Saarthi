#!/usr/bin/env node
/**
 * Temporary startup script to launch Python FastAPI backend
 * This bridges the gap between the existing Node.js workflow and new Python backend
 */

import { spawn } from 'child_process';
import { join } from 'path';

const projectRoot = process.cwd();

console.log('🚀 Starting Saarthi with Python FastAPI backend...');

// Build frontend first
console.log('📦 Building frontend...');
const buildProcess = spawn('npx', ['vite', 'build'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  }
  
  console.log('✅ Frontend built successfully');
  console.log('🐍 Starting Python FastAPI server...');
  
  // Start Python server
  const pythonProcess = spawn('python', ['main.py'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: process.env
  });
  
  pythonProcess.on('close', (code) => {
    console.log(`Python server exited with code ${code}`);
    process.exit(code || 0);
  });
  
  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python server:', error);
    process.exit(1);
  });
});

buildProcess.on('error', (error) => {
  console.error('Failed to build frontend:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Saarthi...');
  process.exit(0);
});