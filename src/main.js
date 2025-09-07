/* src/main.js */
/**
 * Updated Main Application Entry Point
 * Enhanced with Foundation Module integration
 *
 * @fileoverview Entry point for the DOM Visualizer application with module support
 * @version 1.1.0
 */

// Import main stylesheet
import './styles/main.css';

// Import Foundation Module
import FoundationModule from './modules/foundation/index.js';

/**
 * Application initialization configuration
 */
const APP_CONFIG = {
  container: '#app',
  development: import.meta.env.DEV,
  version: import.meta.env.VITE_APP_VERSION || '1.1.0',
  enableDevTools: import.meta.env.DEV,
  enableAnalytics: import.meta.env.PROD
};

/**
 * Module registry for managing different learning modules
 */
const MODULE_REGISTRY = new Map();

/**
 * Currently active module instance
 */
let currentModule = null;

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

    // Register available modules
    await registerModules();

    // Hide loading screen and show app
    hideLoadingScreen();
    showApplication();

    // Initialize development tools if in dev mode
    if (APP_CONFIG.development) {
      await initializeDevTools();
    }

    console.log('🚀 DOM Visualizer OOP initialized successfully');
  } catch (error) {
    console.error('� Failed to initialize application:', error);
    showErrorScreen(error);
  }
}

/**
 * Register all available modules
 */
async function registerModules() {
  try {
    // Register Foundation Module
    MODULE_REGISTRY.set('foundation', {
      name: 'foundation',
      title: 'Foundation Module',
      description: 'Learn DOM container relationships',
      icon: '🏗️',
      moduleClass: FoundationModule,
      instance: null
    });

    // Register placeholder modules for future implementation
    const placeholderModules = [
      {
        name: 'events',
        title: 'Events Module',
        description: 'Master event flow and delegation',
        icon: '⚡'
      },
      {
        name: 'dom',
        title: 'DOM Module',
        description: 'Manipulate and inspect DOM elements',
        icon: '🌳'
      },
      {
        name: 'boxmodel',
        title: 'Box Model Module',
        description: 'Visualize CSS layout and positioning',
        icon: '📦'
      },
      {
        name: 'performance',
        title: 'Performance Module',
        description: 'Monitor rendering performance',
        icon: '🚀'
      },
      {
        name: 'learning',
        title: 'Learning Module',
        description: 'Interactive challenges',
        icon: '🎯'
      }
    ];

    placeholderModules.forEach(module => {
      MODULE_REGISTRY.set(module.name, {
        ...module,
        moduleClass: null, // Placeholder
        instance: null
      });
    });

    console.log('✅ Modules registered:', Array.from(MODULE_REGISTRY.keys()));
  } catch (error) {
    console.error('❌ Failed to register modules:', error);
    throw error;
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
      const moduleName = card.dataset.module;
      if (moduleName) {
        navigateToModule(moduleName);
      }
    });
  });

  // Add click handlers for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const moduleName = link.dataset.module;
      if (moduleName) {
        navigateToModule(moduleName);
      }
    });
  });

  // Listen for navigation events from modules
  document.addEventListener('navigation:back', () => {
    navigateToHome();
  });
}

/**
 * Navigate to a specific module
 * @param {string} moduleName - Name of the module to navigate to
 */
async function navigateToModule(moduleName) {
  try {
    console.log(`🧭 Navigating to ${moduleName} module`);

    // Check if module exists
    const moduleConfig = MODULE_REGISTRY.get(moduleName);
    if (!moduleConfig) {
      console.error(`Module "${moduleName}" not found`);
      showModulePlaceholder(moduleName);
      return;
    }

    // Update URL
    window.history.pushState({ module: moduleName }, '', `#${moduleName}`);

    // Update active navigation
    updateActiveNavigation(moduleName);

    // Deactivate current module if any
    if (currentModule) {
      await deactivateCurrentModule();
    }

    // Load and activate the new module
    if (moduleConfig.moduleClass) {
      await loadAndActivateModule(moduleName, moduleConfig);
    } else {
      showModulePlaceholder(moduleName);
    }
  } catch (error) {
    console.error(`❌ Failed to navigate to module ${moduleName}:`, error);
    showErrorMessage(`Failed to load ${moduleName} module`);
  }
}

/**
 * Load and activate a module
 * @param {string} moduleName - Module name
 * @param {Object} moduleConfig - Module configuration
 */
async function loadAndActivateModule(moduleName, moduleConfig) {
  try {
    const moduleContainer = document.getElementById('module-container');

    // Clear container
    moduleContainer.innerHTML = '';

    // Create module instance if not exists
    if (!moduleConfig.instance) {
      console.log(`🏗️ Creating ${moduleName} module instance`);
      moduleConfig.instance = new moduleConfig.moduleClass(moduleContainer, {
        theme: getCurrentTheme(),
        enableAnimation: !isReducedMotion()
      });

      // Initialize the module
      await moduleConfig.instance.init();
    }

    // Activate the module
    await moduleConfig.instance.activate();
    currentModule = moduleConfig.instance;

    console.log(`✅ ${moduleName} module activated`);

    // Track module usage
    trackModuleUsage(moduleName);
  } catch (error) {
    console.error(`❌ Failed to load module ${moduleName}:`, error);
    showModulePlaceholder(moduleName, `Error loading module: ${error.message}`);
  }
}

/**
 * Deactivate the current module
 */
async function deactivateCurrentModule() {
  if (currentModule && typeof currentModule.deactivate === 'function') {
    try {
      await currentModule.deactivate();
      console.log('✅ Current module deactivated');
    } catch (error) {
      console.error('❌ Error deactivating current module:', error);
    }
  }
  currentModule = null;
}

/**
 * Navigate to home (welcome screen)
 */
function navigateToHome() {
  console.log('🏠 Navigating to home');

  // Update URL
  window.history.pushState({}, '', '#');

  // Update navigation
  updateActiveNavigation(null);

  // Deactivate current module
  if (currentModule) {
    deactivateCurrentModule();
  }

  // Show welcome screen
  showWelcomeScreen();
}

/**
 * Show welcome screen
 */
function showWelcomeScreen() {
  const moduleContainer = document.getElementById('module-container');

  // Get updated module info
  const modules = Array.from(MODULE_REGISTRY.values());

  moduleContainer.innerHTML = `
    <div id="welcome-screen" class="welcome-screen">
      <div class="welcome-content">
        <h1 class="welcome-title">Welcome to DOM Visualizer</h1>
        <p class="welcome-subtitle">
          Master JavaScript DOM manipulation and browser APIs through interactive visualizations
        </p>

        <div class="welcome-modules">
          ${modules
            .map(
              module => `
            <div class="module-card ${module.moduleClass ? '' : 'module-placeholder'}" data-module="${module.name}">
              <div class="module-icon">${module.icon}</div>
              <h3 class="module-title">${module.title}</h3>
              <p class="module-description">${module.description}</p>
              ${!module.moduleClass ? '<div class="coming-soon-badge">Coming Soon</div>' : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  // Re-bind module card events for the new content
  const moduleCards = moduleContainer.querySelectorAll('.module-card');
  moduleCards.forEach(card => {
    card.addEventListener('click', e => {
      const moduleName = card.dataset.module;
      if (moduleName && !card.classList.contains('module-placeholder')) {
        navigateToModule(moduleName);
      }
    });
  });
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
  if (moduleName) {
    const activeLink = document.querySelector(`[data-module="${moduleName}"]`);
    if (activeLink && activeLink.classList.contains('nav-link')) {
      activeLink.classList.add('active');
    }
  }
}

/**
 * Show module placeholder content
 * @param {string} moduleName - Module name to display
 * @param {string} errorMessage - Optional error message
 */
function showModulePlaceholder(moduleName, errorMessage = null) {
  const moduleContainer = document.getElementById('module-container');
  const moduleConfig = MODULE_REGISTRY.get(moduleName);

  const moduleInfo = moduleConfig || {
    title: 'Module',
    description: 'Coming soon...',
    features: []
  };

  moduleContainer.innerHTML = `
    <div class="module-content">
      <div class="breadcrumb">
        <span class="breadcrumb-item">
          <a href="#" class="back-button">← Back to Home</a>
        </span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">${moduleInfo.title}</span>
      </div>

      <div class="module-header">
        <h1 class="module-title">${moduleInfo.title}</h1>
        <p class="module-description">${moduleInfo.description}</p>
      </div>

      ${
        errorMessage
          ? `
        <div class="error-message">
          <h3>⚠️ Error</h3>
          <p>${errorMessage}</p>
        </div>
      `
          : ''
      }

      <div class="module-placeholder">
        <div class="placeholder-content">
          <h3>🚧 Under Development</h3>
          <p>This module is currently being built. Check back soon for interactive content!</p>
          ${
            moduleConfig && moduleConfig.moduleClass
              ? `
            <button class="retry-button" onclick="window.location.reload()">
              🔄 Retry Loading
            </button>
          `
              : ''
          }
        </div>
      </div>
    </div>
  `;

  // Setup back button
  const backButton = moduleContainer.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', e => {
      e.preventDefault();
      navigateToHome();
    });
  }
}

/**
 * Get current theme
 * @returns {string} Current theme name
 */
function getCurrentTheme() {
  return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
}

/**
 * Check if reduced motion is preferred
 * @returns {boolean} True if reduced motion is preferred
 */
function isReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Track module usage for analytics
 * @param {string} moduleName - Module name
 */
function trackModuleUsage(moduleName) {
  // Simple usage tracking
  const usage = JSON.parse(localStorage.getItem('module-usage') || '{}');
  usage[moduleName] = (usage[moduleName] || 0) + 1;
  usage[`${moduleName}-last-visit`] = Date.now();
  localStorage.setItem('module-usage', JSON.stringify(usage));
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--error-500);
    color: white;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    z-index: var(--z-index-toast);
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

/**
 * Setup theme toggle functionality
 */
function setupThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      const newTheme = isDark ? 'dark' : 'light';

      localStorage.setItem('theme', newTheme);

      // Notify current module of theme change
      document.dispatchEvent(
        new CustomEvent('theme:changed', {
          detail: { theme: newTheme }
        })
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

    // Setup settings controls
    setupSettingsControls();
  }
}

/**
 * Setup settings controls
 */
function setupSettingsControls() {
  // Theme selector
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = getCurrentTheme();
    themeSelect.addEventListener('change', e => {
      const theme = e.target.value;

      if (theme === 'auto') {
        // Use system preference
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        document.body.classList.toggle('dark-theme', prefersDark);
        localStorage.setItem('theme', 'auto');
      } else {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        localStorage.setItem('theme', theme);
      }

      // Notify current module
      document.dispatchEvent(
        new CustomEvent('theme:changed', {
          detail: { theme: getCurrentTheme() }
        })
      );
    });
  }

  // Animation speed
  const animationSpeed = document.getElementById('animation-speed');
  const animationValue = document.querySelector('.setting-value');
  if (animationSpeed && animationValue) {
    const savedSpeed = localStorage.getItem('animation-speed') || '1';
    animationSpeed.value = savedSpeed;
    animationValue.textContent = `${savedSpeed}x`;

    animationSpeed.addEventListener('input', e => {
      const speed = e.target.value;
      animationValue.textContent = `${speed}x`;
      localStorage.setItem('animation-speed', speed);

      // Apply animation speed globally
      document.documentElement.style.setProperty('--animation-speed', speed);
    });

    // Apply saved speed
    document.documentElement.style.setProperty('--animation-speed', savedSpeed);
  }

  // Reduced motion
  const reduceMotion = document.getElementById('reduce-motion');
  if (reduceMotion) {
    reduceMotion.checked = localStorage.getItem('reduce-motion') === 'true';
    reduceMotion.addEventListener('change', e => {
      const isReduced = e.target.checked;
      localStorage.setItem('reduce-motion', isReduced.toString());

      if (isReduced) {
        document.documentElement.style.setProperty('--transition-fast', '0ms');
        document.documentElement.style.setProperty('--transition-base', '0ms');
        document.documentElement.style.setProperty('--transition-slow', '0ms');
      } else {
        document.documentElement.style.removeProperty('--transition-fast');
        document.documentElement.style.removeProperty('--transition-base');
        document.documentElement.style.removeProperty('--transition-slow');
      }
    });
  }

  // Show FPS counter
  const showFPS = document.getElementById('show-fps');
  if (showFPS) {
    showFPS.checked = localStorage.getItem('show-fps') === 'true';
    showFPS.addEventListener('change', e => {
      const shouldShow = e.target.checked;
      localStorage.setItem('show-fps', shouldShow.toString());

      const devTools = document.getElementById('dev-tools');
      if (devTools) {
        devTools.style.display =
          shouldShow || APP_CONFIG.development ? 'block' : 'none';
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

  // Show welcome screen by default
  showWelcomeScreen();
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
      const showFPS = localStorage.getItem('show-fps') === 'true';
      devTools.style.display =
        showFPS || APP_CONFIG.development ? 'block' : 'none';
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

            // Color code FPS
            if (fps >= 55) {
              fpsCounter.style.color = 'var(--success-500)';
            } else if (fps >= 30) {
              fpsCounter.style.color = 'var(--warning-500)';
            } else {
              fpsCounter.style.color = 'var(--error-500)';
            }
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

            // Color code memory usage
            if (memoryUsage < 50) {
              memoryElement.style.color = 'var(--success-500)';
            } else if (memoryUsage < 100) {
              memoryElement.style.color = 'var(--warning-500)';
            } else {
              memoryElement.style.color = 'var(--error-500)';
            }
          }
        }, 1000);
      }

      // Initialize state debugger
      const stateDebug = document.getElementById('state-debug');
      if (stateDebug) {
        const updateStateDebug = () => {
          const state = {
            currentModule: currentModule
              ? currentModule.constructor.name
              : null,
            activeModules: Array.from(MODULE_REGISTRY.keys()).filter(
              name => MODULE_REGISTRY.get(name).instance
            ),
            theme: getCurrentTheme(),
            url: window.location.hash,
            performance: performance.memory
              ? {
                  usedJSHeapSize:
                    Math.round(
                      performance.memory.usedJSHeapSize / 1024 / 1024
                    ) + 'MB',
                  totalJSHeapSize:
                    Math.round(
                      performance.memory.totalJSHeapSize / 1024 / 1024
                    ) + 'MB'
                }
              : 'N/A',
            timestamp: new Date().toISOString()
          };

          stateDebug.textContent = JSON.stringify(state, null, 2);
        };

        // Update state debug info every 2 seconds
        updateStateDebug();
        setInterval(updateStateDebug, 2000);
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
  if (hash && MODULE_REGISTRY.has(hash)) {
    navigateToModule(hash);
  } else {
    navigateToHome();
  }
});

/**
 * Handle visibility change (page focus/blur)
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - pause expensive operations
    if (currentModule && typeof currentModule.pause === 'function') {
      currentModule.pause();
    }
  } else {
    // Page is visible - resume operations
    if (currentModule && typeof currentModule.resume === 'function') {
      currentModule.resume();
    }
  }
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
  // Cleanup current module
  if (currentModule && typeof currentModule.destroy === 'function') {
    currentModule.destroy();
  }

  // Save any pending state
  const usage = JSON.parse(localStorage.getItem('module-usage') || '{}');
  usage['app-last-session'] = Date.now();
  localStorage.setItem('module-usage', JSON.stringify(usage));
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
  if (hash && MODULE_REGISTRY.has(hash)) {
    setTimeout(() => navigateToModule(hash), 100);
  }
}

/**
 * Export for debugging in development
 */
if (APP_CONFIG.development) {
  window.__DOM_VISUALIZER_DEBUG__ = {
    config: APP_CONFIG,
    modules: MODULE_REGISTRY,
    currentModule: () => currentModule,
    navigateToModule,
    navigateToHome,
    reinitialize: initializeApp,
    showError: showErrorScreen
  };
}

// Start the application
main().catch(error => {
  console.error('Critical application error:', error);
  showErrorScreen(error);
});
