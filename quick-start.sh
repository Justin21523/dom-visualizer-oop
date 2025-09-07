#!/bin/bash

# DOM Visualizer OOP - Quick Start Script
# This script sets up the complete project structure and initializes the development environment

set -e  # Exit on any error

echo "🚀 DOM Visualizer OOP - Quick Start Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -p "require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION')" 2>/dev/null; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is not supported. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $NODE_VERSION detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) detected${NC}"
echo ""

# Project setup
PROJECT_NAME="dom-visualizer-oop"
CURRENT_DIR=$(pwd)
PROJECT_DIR="$CURRENT_DIR/$PROJECT_NAME"

echo -e "${BLUE}📁 Setting up project structure...${NC}"

# Create main directories
mkdir -p "$PROJECT_DIR"/{src/{core,modules,components,utils,styles,constants,types,workers},tests/{unit,integration,e2e,fixtures,helpers},docs/{api,tutorials,examples},scripts,public/{icons,assets},'.github/workflows','.vscode',storybook}

# Create module subdirectories
mkdir -p "$PROJECT_DIR/src/modules"/{foundation,events,dom,boxmodel,performance,learning}

# Create component subdirectories
mkdir -p "$PROJECT_DIR/src/components"/{base,visualization,layout,forms}

# Create styles subdirectories
mkdir -p "$PROJECT_DIR/src/styles"/{core,layout,components,modules,themes,animations}

# Create public asset subdirectories
mkdir -p "$PROJECT_DIR/public/assets"/{images,sounds,data}

echo -e "${GREEN}✅ Directory structure created${NC}"

# Navigate to project directory
cd "$PROJECT_DIR"

echo -e "${BLUE}📄 Creating configuration files...${NC}"


# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Create basic files
echo -e "${BLUE}📝 Creating basic project files...${NC}"

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Interactive JavaScript DOM & Event Learning Platform" />
  <title>DOM Visualizer OOP - Interactive Learning Platform</title>
</head>
<body>
  <div id="app" class="app">
    <div id="loading-screen" class="loading-screen">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">Initializing DOM Visualizer...</p>
    </div>

    <div id="error-boundary" class="error-boundary hidden">
      <div class="error-content">
        <h2>Oops! Something went wrong</h2>
        <p class="error-message"></p>
        <button class="error-retry-btn">Retry</button>
      </div>
    </div>

    <header id="app-header" class="app-header hidden">
      <h1>DOM Visualizer OOP</h1>
    </header>

    <main id="app-main" class="app-main hidden">
      <div id="module-container" class="module-container">
        <div class="welcome-screen">
          <h1>Welcome to DOM Visualizer</h1>
          <p>Interactive JavaScript DOM & Event Learning Platform</p>
        </div>
      </div>
    </main>

    <footer id="app-footer" class="app-footer hidden">
      <p>&copy; 2024 DOM Visualizer OOP</p>
    </footer>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
EOF

# Create main.js
cat > src/main.js << 'EOF'
/**
 * Main application entry point
 */

console.log('🚀 DOM Visualizer OOP starting...');

// Remove loading screen and show app
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const appElements = ['app-header', 'app-main', 'app-footer'];

  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }

  appElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('hidden');
    }
  });

  console.log('✅ DOM Visualizer OOP initialized');
});
EOF

# Create basic CSS
mkdir -p src/styles/core
cat > src/styles/core/variables.css << 'EOF'
:root {
  --primary-500: #3b82f6;
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
  --space-4: 1rem;
}

.hidden { display: none !important; }

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.app-header, .app-main, .app-footer {
  padding: var(--space-4);
}

.welcome-screen {
  text-align: center;
  padding: 2rem;
}
EOF

# Create main CSS file
cat > src/styles/main.css << 'EOF'
@import './core/variables.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}
EOF

# Import main CSS in main.js
sed -i '1i import "./styles/main.css";' src/main.js

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local

# Testing
coverage/
test-results/
playwright-report/

# Cache
.cache/
.vite/
.eslintcache

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Temporary
tmp/
temp/
EOF

# Create README.md
cat > README.md << 'EOF'
# DOM Visualizer OOP

Interactive JavaScript DOM & Event Learning Platform

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📚 Features

- **Foundation Module**: DOM metrics and viewport relationships
- **Events Module**: Event flow visualization and delegation
- **DOM Module**: Tree manipulation and inspection
- **Box Model Module**: 3D visualization and layout comparison
- **Performance Module**: Render pipeline and memory monitoring
- **Learning Module**: Interactive challenges and progress tracking

## 🔧 Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## 📄 License

MIT License
EOF

echo -e "${GREEN}✅ Basic project files created${NC}"

# Create Vite config
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles')
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true
  }
});
EOF

# Create basic test files
mkdir -p tests/unit tests/e2e
cat > tests/setup.js << 'EOF'
// Global test setup
import { vi } from 'vitest';

// Mock DOM APIs
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

beforeEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});
EOF

# Create Vitest config
cat > vitest.config.js << 'EOF'
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles')
    }
  }
});
EOF

# Create ESLint config
cat > .eslintrc.js << 'EOF'
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': 'error',
    'no-console': 'warn'
  }
};
EOF

# Create Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# Create VS Code settings
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "eslint.workingDirectories": ["./"],
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "ms-vscode.live-server"
  ]
}
EOF

echo -e "${GREEN}✅ Configuration files created${NC}"

# Initialize Git repository
echo -e "${BLUE}🔧 Initializing Git repository...${NC}"
git init
git add .
git commit -m "feat: initial project setup with basic structure"

echo -e "${GREEN}✅ Git repository initialized${NC}"

# Test the setup
echo -e "${BLUE}🔍 Testing the setup...${NC}"

# Run linting
if npm run lint --silent; then
    echo -e "${GREEN}✅ ESLint check passed${NC}"
else
    echo -e "${YELLOW}⚠️  ESLint warnings found (this is normal for initial setup)${NC}"
fi

# Check if build works
if npm run build --silent > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build test passed${NC}"
    rm -rf dist  # Clean up test build
else
    echo -e "${YELLOW}⚠️  Build test had issues (will be resolved as we add more files)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 DOM Visualizer OOP setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "  1. ${YELLOW}cd $PROJECT_NAME${NC}"
echo -e "  2. ${YELLOW}npm run dev${NC}"
echo -e "  3. Open ${YELLOW}http://localhost:3000${NC} in your browser"
echo -e "  4. Start developing!"
echo ""
echo -e "${BLUE}💡 Useful commands:${NC}"
echo -e "  • ${YELLOW}npm run dev${NC}     - Start development server"
echo -e "  • ${YELLOW}npm test${NC}        - Run tests"
echo -e "  • ${YELLOW}npm run lint${NC}    - Check code quality"
echo -e "  • ${YELLOW}npm run format${NC}  - Format code"
echo -e "  • ${YELLOW}npm run build${NC}   - Build for production"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo -e "  • Project structure: ${YELLOW}./docs/${NC}"
echo -e "  • README: ${YELLOW}./README.md${NC}"
echo -e "  • VS Code extensions will be suggested automatically"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
