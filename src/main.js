/**
 * Main application entry point
 * Initializes the DOM Visualizer OOP learning platform
 *
 * @fileoverview Entry point for the DOM Visualizer application
 * @version 1.0.0
 */

// Import main stylesheet
import './styles/main.css';

/**
 * Application initialization configuration
 */
const APP_CONFIG = {
  container: '#app',
  development: import.meta.env.DEV,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enableDevTools: import.meta.env.DEV,
  enableAnalytics: import.meta.env.PROD
};

/**
 * Initialize the application when DOM is ready
 */
async function initializeApp() {
  try {
    // Show loading screen
    showLoadingScreen();

    // Wait for DOM to be ready
    await waitForDOM();

    // Initialize basic functionality
    await initializeBasicApp();

    // Hide loading screen and show app
    hideLoadingScreen();
    showApplication();

    // Initialize development tools if in dev mode
    if (APP_CONFIG.development) {
      await initializeDevTools();
    }

    console.log('🚀 DOM Visualizer OOP initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    showErrorScreen(error);
  }
}

/**
 * Initialize basic application functionality
 */
async function initializeBasicApp() {
  // Add basic event listeners
  setupModuleNavigation();
  setupThemeToggle();
  setupSettingsModal();

  console.log('✅ Basic app functionality initialized');
}

/**
 * Setup module navigation
 */
function setupModuleNavigation() {
  const moduleCards = document.querySelectorAll('.module-card');
  const navLinks = document.querySelectorAll('.nav-link');

  // Add click handlers for module cards
  moduleCards.forEach(card => {
    card.addEventListener('click', e => {
      const module = card.dataset.module;
      if (module) {
        navigateToModule(module);
      }
    });
  });

  // Add click handlers for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const module = link.dataset.module;
      if (module) {
        navigateToModule(module);
      }
    });
  });
}

/**
 * Navigate to a specific module
 * @param {string} moduleName - Name of the module to navigate to
 */
function navigateToModule(moduleName) {
  console.log(`Navigating to ${moduleName} module`);

  // Update URL
  window.history.pushState({}, '', `#${moduleName}`);

  // Update active navigation
  updateActiveNavigation(moduleName);

  // Show module placeholder
  showModulePlaceholder(moduleName);
}

/**
 * Update active navigation state
 * @param {string} moduleName - Active module name
 */
function updateActiveNavigation(moduleName) {
  // Remove active class from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Add active class to current module
  const activeLink = document.querySelector(`[data-module="${moduleName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/**
 * Show module placeholder content
 * @param {string} moduleName - Module name to display
 */
function showModulePlaceholder(moduleName) {
  const moduleContainer = document.getElementById('module-container');

  const moduleInfo = {
    foundation: {
      title: 'Foundation Module',
      description: 'Learn DOM basics and viewport relationships',
      features: [
        'DOM Metrics Visualization',
        'Viewport Management',
        'Scroll Tracking'
      ]
    },
    events: {
      title: 'Events Module',
      description: 'Master event flow and delegation patterns',
      features: [
        'Event Flow Visualization',
        'Event Delegation Demo',
        'Custom Events'
      ]
    },
    dom: {
      title: 'DOM Module',
      description: 'Manipulate and inspect DOM elements',
      features: ['DOM Tree Editor', 'Attribute Inspector', 'Selector Tester']
    },
    boxmodel: {
      title: 'Box Model Module',
      description: 'Visualize CSS layout and positioning',
      features: ['3D Box Model', 'Layout Comparator', 'Responsive Simulator']
    },
    performance: {
      title: 'Performance Module',
      description: 'Monitor and optimize rendering performance',
      features: ['FPS Monitor', 'Memory Leak Detector', 'Render Pipeline']
    },
    learning: {
      title: 'Learning Module',
      description: 'Test your skills with interactive challenges',
      features: ['Challenge Engine', 'Progress Tracker', 'Achievement System']
    }
  };

  const info = moduleInfo[moduleName] || {
    title: 'Module',
    description: 'Coming soon...',
    features: []
  };

  moduleContainer.innerHTML = `
    <div class="module-content">
      <div class="module-header">
        <h1 class="module-title">${info.title}</h1>
        <p class="module-description">${info.description}</p>
      </div>

      <div class="module-features">
        <h3>Features:</h3>
        <ul class="feature-list">
          ${info.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>

      <div class="module-placeholder">
        <div class="placeholder-content">
          <h3>🚧 Under Development</h3>
          <p>This module is currently being built. Check back soon for interactive content!</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Setup theme toggle functionality
 */
function setupThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem(
        'theme',
        document.body.classList.contains('dark-theme') ? 'dark' : 'light'
      );
    });

    // Restore saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }
}

/**
 * Setup settings modal functionality
 */
function setupSettingsModal() {
  const settingsBtn = document.querySelector('.settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const modalClose = settingsModal?.querySelector('.modal-close');
  const modalOverlay = settingsModal?.querySelector('.modal-overlay');

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });

    const closeModal = () => {
      settingsModal.classList.add('hidden');
    };

    modalClose?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);

    // Close on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }
}

/**
 * Wait for DOM to be ready
 * @returns {Promise<void>} Promise that resolves when DOM is ready
 */
function waitForDOM() {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
  }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
}

/**
 * Show main application
 */
function showApplication() {
  const elements = ['app-header', 'app-main', 'app-footer'];

  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('hidden');
    }
  });
}

/**
 * Show error screen
 * @param {Error} error - The error that occurred
 */
function showErrorScreen(error) {
  hideLoadingScreen();

  const errorBoundary = document.getElementById('error-boundary');
  const errorMessage = errorBoundary?.querySelector('.error-message');
  const errorStack = errorBoundary?.querySelector('.error-stack');
  const retryButton = errorBoundary?.querySelector('.error-retry-btn');

  if (errorBoundary) {
    errorBoundary.classList.remove('hidden');

    if (errorMessage) {
      errorMessage.textContent =
        error.message || 'An unexpected error occurred';
    }

    if (errorStack) {
      errorStack.textContent = error.stack || 'No stack trace available';
    }

    if (retryButton) {
      retryButton.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }
}

/**
 * Initialize development tools
 */
async function initializeDevTools() {
  try {
    const devTools = document.getElementById('dev-tools');
    if (devTools) {
      devTools.classList.remove('hidden');

      // Initialize FPS counter
      let lastTime = performance.now();
      let frames = 0;

      function updateFPS() {
        frames++;
        const currentTime = performance.now();

        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frames * 1000) / (currentTime - lastTime));
          const fpsCounter = document.getElementById('fps-counter');
          if (fpsCounter) {
            fpsCounter.textContent = fps;
          }

          frames = 0;
          lastTime = currentTime;
        }

        requestAnimationFrame(updateFPS);
      }

      updateFPS();

      // Initialize memory usage monitor
      if (performance.memory) {
        setInterval(() => {
          const memoryInfo = performance.memory;
          const memoryUsage = Math.round(
            memoryInfo.usedJSHeapSize / 1024 / 1024
          );
          const memoryElement = document.getElementById('memory-usage');
          if (memoryElement) {
            memoryElement.textContent = `${memoryUsage} MB`;
          }
        }, 1000);
      }

      // Initialize state debugger
      const stateDebug = document.getElementById('state-debug');
      if (stateDebug) {
        stateDebug.textContent = JSON.stringify(
          {
            currentModule: 'welcome',
            theme: localStorage.getItem('theme') || 'light',
            initialized: true
          },
          null,
          2
        );
      }

      // Toggle dev panel
      const devToggle = devTools.querySelector('.dev-toggle');
      const devPanel = devTools.querySelector('.dev-panel');

      if (devToggle && devPanel) {
        let panelVisible = false;
        devToggle.addEventListener('click', () => {
          panelVisible = !panelVisible;
          devPanel.style.display = panelVisible ? 'block' : 'none';
        });

        // Initially hide the panel
        devPanel.style.display = 'none';
      }
    }
  } catch (error) {
    console.warn('Failed to initialize dev tools:', error);
  }
}

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);

  // Prevent the default browser behavior
  event.preventDefault();

  // Show error in dev mode
  if (APP_CONFIG.development) {
    const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
    showErrorScreen(error);
  }
});

/**
 * Handle uncaught errors
 */
window.addEventListener('error', event => {
  console.error('Uncaught error:', event.error);

  // Show error screen for critical errors
  if (event.error && !APP_CONFIG.development) {
    showErrorScreen(event.error);
  }
});

/**
 * Initialize performance monitoring
 */
function initializePerformanceMonitoring() {
  // Mark the start of app initialization
  if (performance.mark) {
    performance.mark('app-init-start');
  }

  // Measure app initialization time
  window.addEventListener('load', () => {
    if (performance.mark && performance.measure) {
      performance.mark('app-init-end');
      performance.measure(
        'app-initialization',
        'app-init-start',
        'app-init-end'
      );

      const measures = performance.getEntriesByName('app-initialization');
      if (measures.length > 0) {
        console.log(
          `App initialization took: ${measures[0].duration.toFixed(2)}ms`
        );
      }
    }
  });
}

/**
 * Handle browser back/forward navigation
 */
window.addEventListener('popstate', event => {
  const hash = window.location.hash.slice(1);
  if (hash) {
    navigateToModule(hash);
  } else {
    // Show welcome screen
    const moduleContainer = document.getElementById('module-container');
    const welcomeScreen = document.getElementById('welcome-screen');
    if (moduleContainer && welcomeScreen) {
      moduleContainer.innerHTML = '';
      moduleContainer.appendChild(welcomeScreen);
    }
  }
});

/**
 * Main initialization sequence
 */
async function main() {
  // Initialize performance monitoring
  initializePerformanceMonitoring();

  // Initialize the main application
  await initializeApp();

  // Handle initial URL hash
  const hash = window.location.hash.slice(1);
  if (hash) {
    setTimeout(() => navigateToModule(hash), 100);
  }
}

// Start the application
main().catch(error => {
  console.error('Critical application error:', error);
  showErrorScreen(error);
});

// Export for debugging in development
if (APP_CONFIG.development) {
  window.__DOM_VISUALIZER_DEBUG__ = {
    config: APP_CONFIG,
    reinitialize: initializeApp,
    showError: showErrorScreen,
    navigateToModule
  };
}
