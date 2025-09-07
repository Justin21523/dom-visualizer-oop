/**
 * Main application entry point
 * Initializes the DOM Visualizer OOP learning platform
 *
 * @fileoverview Entry point for the DOM Visualizer application
 * @version 1.0.0
 */

// Import main stylesheet
import './styles/main.css';

// Import core application
import { DOMVisualizerApp } from '@core/DOMVisualizerApp.js';

// Import error handling
import { ErrorHandler } from '@core/ErrorHandler.js';

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

    // Initialize error handler
    const errorHandler = new ErrorHandler();
    errorHandler.initialize();

    // Wait for DOM to be ready
    await waitForDOM();

    // Initialize main application
    const app = new DOMVisualizerApp(APP_CONFIG);
    await app.initialize();

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
      if ('memory' in performance) {
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
        // This will be updated by the StateManager
        stateDebug.textContent = 'State debugging initialized...';
      }

      // Toggle dev panel
      const devToggle = devTools.querySelector('.dev-toggle');
      const devPanel = devTools.querySelector('.dev-panel');

      if (devToggle && devPanel) {
        devToggle.addEventListener('click', () => {
          devPanel.classList.toggle('hidden');
        });
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
 * Handle service worker registration (for PWA functionality)
 */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }
}

/**
 * Initialize performance monitoring
 */
function initializePerformanceMonitoring() {
  // Mark the start of app initialization
  performance.mark('app-init-start');

  // Measure app initialization time
  window.addEventListener('load', () => {
    performance.mark('app-init-end');
    performance.measure('app-initialization', 'app-init-start', 'app-init-end');

    const measures = performance.getEntriesByName('app-initialization');
    if (measures.length > 0) {
      console.log(
        `App initialization took: ${measures[0].duration.toFixed(2)}ms`
      );
    }
  });

  // Monitor Core Web Vitals if available
  if ('web-vitals' in window) {
    import('web-vitals')
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      })
      .catch(() => {
        // web-vitals not available, continue without it
      });
  }
}

/**
 * Initialize analytics (only in production)
 */
async function initializeAnalytics() {
  if (APP_CONFIG.enableAnalytics) {
    // Initialize analytics tracking here
    // This would typically be Google Analytics, Mixpanel, etc.
    console.log('Analytics initialized');
  }
}

/**
 * Main initialization sequence
 */
async function main() {
  // Initialize performance monitoring
  initializePerformanceMonitoring();

  // Register service worker
  await registerServiceWorker();

  // Initialize analytics
  await initializeAnalytics();

  // Initialize the main application
  await initializeApp();
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
    showError: showErrorScreen
  };
}
