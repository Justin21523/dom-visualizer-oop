#!/usr/bin/env node

/**
 * Project initialization script
 * Sets up the DOM Visualizer OOP project structure and dependencies
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_NAME = 'dom-visualizer-oop';

console.log('🚀 Initializing DOM Visualizer OOP project...\n');

// Step 1: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 2: Create basic files
console.log('📁 Creating basic project files...');

const basicFiles = [
  {
    path: 'src/main.js',
    content: `/**
 * Main application entry point
 * Initializes the DOM Visualizer OOP platform
 */

import { DOMVisualizerApp } from '@core/DOMVisualizerApp.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DOMVisualizerApp();
  app.initialize();
});
`
  },
  {
    path: 'public/manifest.json',
    content: JSON.stringify({
      name: 'DOM Visualizer OOP',
      short_name: 'DOM Visualizer',
      description: 'Interactive JavaScript DOM & Event Learning Platform',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#3b82f6',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }, null, 2)
  },
  {
    path: 'README.md',
    content: `# DOM Visualizer OOP

Interactive JavaScript DOM & Event Learning Platform

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## 📚 Documentation

- [Project Documentation](./docs/)
- [API Reference](./docs/api/)
- [Contributing Guide](./CONTRIBUTING.md)

## 🎯 Features

- **Foundation Module**: DOM metrics and viewport relationships
- **Events Module**: Event flow visualization and delegation
- **DOM Module**: Tree manipulation and inspection
- **Box Model Module**: 3D visualization and layout comparison
- **Performance Module**: Render pipeline and memory monitoring
- **Learning Module**: Interactive challenges and progress tracking

## 🔧 Tech Stack

- Vanilla JavaScript ES6+ with OOP patterns
- Vite for build tooling
- Vitest for unit testing
- Playwright for E2E testing
- Modern CSS with design system

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
`
  },
  {
    path: 'tests/e2e/global-setup.js',
    content: `/**
 * Global setup for Playwright E2E tests
 */

async function globalSetup() {
  console.log('Setting up E2E test environment...');
  // Add any global setup logic here
}

export default globalSetup;
`
  },
  {
    path: 'tests/e2e/global-teardown.js',
    content: `/**
 * Global teardown for Playwright E2E tests
 */

async function globalTeardown() {
  console.log('Cleaning up E2E test environment...');
  // Add any global cleanup logic here
}

export default globalTeardown;
`
  }
];

basicFiles.forEach(({ path, content }) => {
  const fullPath = join(process.cwd(), path);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(fullPath, content);
  console.log(`  ✅ Created ${path}`);
});

console.log('\n📝 Creating Git hooks...');
try {
  execSync('npx husky install', { stdio: 'inherit' });
  execSync('npx husky add .husky/pre-commit "npx lint-staged"', { stdio: 'inherit' });
  console.log('✅ Git hooks configured\n');
} catch (error) {
  console.warn('⚠️  Warning: Could not set up Git hooks:', error.message);
}

// Step 3: Initialize Git repository
console.log('🔧 Initializing Git repository...');
try {
  if (!existsSync('.git')) {
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "feat: initial project setup with core configuration"', { stdio: 'inherit' });
    console.log('✅ Git repository initialized\n');
  } else {
    console.log('ℹ️  Git repository already exists\n');
  }
} catch (error) {
  console.warn('⚠️  Warning: Could not initialize Git repository:', error.message);
}

// Step 4: Run initial checks
console.log('🔍 Running initial checks...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.warn('⚠️  Warning: Linting issues found. Run "npm run lint:fix" to auto-fix.\n');
}

console.log('🎉 Project initialization complete!');
console.log('\n📋 Next steps:');
console.log('  1. Start development server: npm run dev');
console.log('  2. Open http://localhost:3000 in your browser');
console.log('  3. Begin implementing core modules');
console.log('  4. Run tests: npm test');
console.log('\n💡 Tip: Check the project documentation in ./docs/ for detailed guides.');
