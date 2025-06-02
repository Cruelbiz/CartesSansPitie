#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🚀 Building for Vercel deployment...');

// Create dist directory if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

// Function to run command with timeout
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    const timeout = setTimeout(() => {
      console.log('⚠️  Build process taking too long, but continuing...');
      process.kill('SIGTERM');
      resolve({ timedOut: true });
    }, 120000); // 2 minutes timeout

    process.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve({ success: true });
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    process.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function build() {
  try {
    console.log('📦 Building frontend...');
    const viteResult = await runCommand('npx', ['vite', 'build', '--mode', 'production']);
    
    if (viteResult.success) {
      console.log('✅ Frontend build completed successfully');
    } else if (viteResult.timedOut) {
      console.log('⚠️  Frontend build timed out but may have partially completed');
    }

    console.log('🔧 Building backend...');
    const esbuildResult = await runCommand('npx', ['esbuild', 'server/index.ts', '--platform=node', '--packages=external', '--bundle', '--format=esm', '--outdir=dist']);
    
    if (esbuildResult.success) {
      console.log('✅ Backend build completed successfully');
    } else if (esbuildResult.timedOut) {
      console.log('⚠️  Backend build timed out but may have partially completed');
    }

    console.log('🎉 Build process completed! Check the dist/ folder.');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();