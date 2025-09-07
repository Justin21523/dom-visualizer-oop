/* src/modules/foundations/index.js */
/**
 * Foundation Module - Entry Point
 * Exports and orchestrates all Foundation module components
 *
 * Educational Purpose:
 * This module teaches users about DOM fundamentals through interactive visualization
 *
 * @fileoverview Foundation module entry point and public API
 * @version 1.0.0
 */

import { DOMMetricsVisualizer } from './DOMMetricsVisualizer.js';

/**
 * Foundation Module Class
 * Main orchestrator for the DOM fundamentals learning experience
 */
export class FoundationModule {
  /**
   * Create a Foundation module instance
   * @param {HTMLElement} container - Container element for the module
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      enableAnimation: true,
      updateInterval: 16,
      theme: 'light',
      autoStart: true,
      ...options
    };

    // Component instances
    this.visualizer = null;
    this.isInitialized = false;
    this.isActive = false;

    // Bind methods
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  /**
   * Initialize the Foundation module
   * @returns {Promise<void>}
   */
  async init() {
    try {
      console.log('🏗️ Initializing Foundation Module...');

      // Create module container structure
      this.setupContainer();

      // Initialize the DOM metrics visualizer
      await this.initializeVisualizer();

      // Set up module-level event listeners
      this.bindEvents();

      this.isInitialized = true;

      if (this.options.autoStart) {
        await this.activate();
      }

      console.log('✅ Foundation Module initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Foundation Module:', error);
      throw error;
    }
  }

  /**
   * Setup the module container structure
   * @private
   */
  setupContainer() {
    if (!this.container) {
      throw new Error('Container element is required');
    }

    // Add module-specific classes
    this.container.classList.add(
      'module-container',
      'foundation-module-container'
    );

    // Create module navigation breadcrumb
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.innerHTML = `
      <span class="breadcrumb-item">
        <a href="#" class="back-button">← Back to Home</a>
      </span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item active">Foundation Module</span>
    `;

    this.container.appendChild(breadcrumb);

    // Setup back navigation
    const backButton = breadcrumb.querySelector('.back-button');
    backButton.addEventListener('click', e => {
      e.preventDefault();
      this.navigateBack();
    });
  }

  /**
   * Initialize the DOM metrics visualizer
   * @private
   */
  async initializeVisualizer() {
    try {
      // Create visualizer container
      const visualizerContainer = document.createElement('div');
      visualizerContainer.className = 'visualizer-container';
      this.container.appendChild(visualizerContainer);

      // Initialize the visualizer
      this.visualizer = new DOMMetricsVisualizer(visualizerContainer, {
        enableAnimation: this.options.enableAnimation,
        updateInterval: this.options.updateInterval,
        theme: this.options.theme,
        showGrid: true,
        scale: 0.08 // Slightly smaller scale for better fit
      });

      // Set up visualizer event listeners
      this.visualizer.on(
        'metrics:updated',
        this.handleMetricsUpdate.bind(this)
      );

      console.log('✅ DOM Metrics Visualizer initialized');
    } catch (error) {
      console.error('❌ Failed to initialize visualizer:', error);
      throw error;
    }
  }

  /**
   * Bind module-level events
   * @private
   */
  bindEvents() {
    // Listen for window resize to update visualizer
    window.addEventListener('resize', this.handleWindowResize.bind(this));

    // Listen for theme changes
    document.addEventListener(
      'theme:changed',
      this.handleThemeChange.bind(this)
    );

    // Listen for module activation/deactivation
    document.addEventListener(
      'module:activate',
      this.handleModuleActivation.bind(this)
    );
    document.addEventListener(
      'module:deactivate',
      this.handleModuleDeactivation.bind(this)
    );
  }

  /**
   * Handle metrics update from visualizer
   * @param {CustomEvent} event - Metrics update event
   * @private
   */
  handleMetricsUpdate(event) {
    const metrics = event.detail;

    // Emit module-level event for other components
    this.emit('foundation:metrics:updated', metrics);

    // Update any module-specific displays
    this.updateModuleStats(metrics);
  }

  /**
   * Handle window resize
   * @private
   */
  handleWindowResize() {
    if (this.visualizer && this.isActive) {
      // Debounce resize updates
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.visualizer.updateMetrics();
      }, 100);
    }
  }

  /**
   * Handle theme changes
   * @param {CustomEvent} event - Theme change event
   * @private
   */
  handleThemeChange(event) {
    const newTheme = event.detail.theme;

    if (this.visualizer) {
      this.visualizer.setOptions({ theme: newTheme });
    }

    this.options.theme = newTheme;
  }

  /**
   * Handle module activation requests
   * @param {CustomEvent} event - Module activation event
   * @private
   */
  handleModuleActivation(event) {
    if (event.detail.module === 'foundation') {
      this.activate();
    } else if (this.isActive) {
      this.deactivate();
    }
  }

  /**
   * Handle module deactivation requests
   * @param {CustomEvent} event - Module deactivation event
   * @private
   */
  handleModuleDeactivation(event) {
    if (event.detail.module === 'foundation' && this.isActive) {
      this.deactivate();
    }
  }

  /**
   * Activate the Foundation module
   * @returns {Promise<void>}
   */
  async activate() {
    if (this.isActive) return;

    try {
      console.log('🚀 Activating Foundation Module...');

      // Show the container
      this.container.style.display = 'block';
      this.container.classList.add('active');

      // Start the visualizer
      if (this.visualizer) {
        this.visualizer.startAnimation();
      }

      // Add introduction tutorial if first time
      if (!localStorage.getItem('foundation-module-visited')) {
        await this.showIntroductionTutorial();
        localStorage.setItem('foundation-module-visited', 'true');
      }

      this.isActive = true;

      // Emit activation event
      this.emit('foundation:activated');

      console.log('✅ Foundation Module activated');
    } catch (error) {
      console.error('❌ Failed to activate Foundation Module:', error);
    }
  }

  /**
   * Deactivate the Foundation module
   */
  deactivate() {
    if (!this.isActive) return;

    console.log('⏸️ Deactivating Foundation Module...');

    // Hide the container
    this.container.style.display = 'none';
    this.container.classList.remove('active');

    // Stop the visualizer
    if (this.visualizer) {
      this.visualizer.stopAnimation();
    }

    this.isActive = false;

    // Emit deactivation event
    this.emit('foundation:deactivated');

    console.log('✅ Foundation Module deactivated');
  }

  /**
   * Show introduction tutorial for first-time users
   * @returns {Promise<void>}
   * @private
   */
  async showIntroductionTutorial() {
    return new Promise(resolve => {
      // Create tutorial overlay
      const tutorial = document.createElement('div');
      tutorial.className = 'foundation-tutorial-overlay';
      tutorial.innerHTML = `
        <div class="tutorial-content">
          <div class="tutorial-header">
            <h3>Welcome to the Foundation Module!</h3>
            <button class="tutorial-close">×</button>
          </div>
          <div class="tutorial-body">
            <p>This module teaches you about DOM container relationships:</p>
            <ul>
              <li>🖥️ <strong>Screen:</strong> Your physical display</li>
              <li>🪟 <strong>Window:</strong> Browser window with UI</li>
              <li>📄 <strong>Document:</strong> Complete web page content</li>
              <li>👁️ <strong>Viewport:</strong> Currently visible area</li>
            </ul>
            <p>Use the interactive controls to simulate different scenarios and watch how the metrics change in real-time!</p>
          </div>
          <div class="tutorial-footer">
            <button class="tutorial-start-btn">Start Learning</button>
          </div>
        </div>
      `;

      document.body.appendChild(tutorial);

      // Handle tutorial interactions
      const closeBtn = tutorial.querySelector('.tutorial-close');
      const startBtn = tutorial.querySelector('.tutorial-start-btn');

      const closeTutorial = () => {
        document.body.removeChild(tutorial);
        resolve();
      };

      closeBtn.addEventListener('click', closeTutorial);
      startBtn.addEventListener('click', closeTutorial);

      // Auto-close after 10 seconds
      setTimeout(closeTutorial, 10000);
    });
  }

  /**
   * Update module-specific statistics
   * @param {Object} metrics - Current metrics
   * @private
   */
  updateModuleStats(metrics) {
    // Calculate some interesting derived metrics
    const stats = this.calculateDerivedStats(metrics);

    // Update any module-level displays
    this.updateStatsDisplay(stats);
  }

  /**
   * Calculate derived statistics from metrics
   * @param {Object} metrics - Current metrics
   * @returns {Object} Derived statistics
   * @private
   */
  calculateDerivedStats(metrics) {
    return {
      screenAspectRatio: (metrics.screenWidth / metrics.screenHeight).toFixed(
        2
      ),
      windowAspectRatio: (metrics.windowWidth / metrics.windowHeight).toFixed(
        2
      ),
      scrollPercentageX:
        metrics.documentWidth > metrics.viewportWidth
          ? (
              (metrics.scrollX /
                (metrics.documentWidth - metrics.viewportWidth)) *
              100
            ).toFixed(1)
          : 0,
      scrollPercentageY:
        metrics.documentHeight > metrics.viewportHeight
          ? (
              (metrics.scrollY /
                (metrics.documentHeight - metrics.viewportHeight)) *
              100
            ).toFixed(1)
          : 0,
      viewportCoverage: (
        ((metrics.viewportWidth * metrics.viewportHeight) /
          (metrics.documentWidth * metrics.documentHeight)) *
        100
      ).toFixed(1)
    };
  }

  /**
   * Update statistics display
   * @param {Object} stats - Derived statistics
   * @private
   */
  updateStatsDisplay(stats) {
    // This could update a stats panel if we add one
    console.log('📊 Module Stats:', stats);
  }

  /**
   * Navigate back to module selection
   * @private
   */
  navigateBack() {
    // Emit navigation event
    this.emit('navigation:back');

    // Deactivate module
    this.deactivate();

    // Navigate to home (this would be handled by the main app)
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '';
    }
  }

  /**
   * Get module information
   * @returns {Object} Module information
   */
  getInfo() {
    return {
      name: 'Foundation',
      title: 'DOM Container Relationships',
      description:
        'Learn about Screen, Window, Document, and Viewport relationships',
      difficulty: 'Beginner',
      estimatedTime: '10-15 minutes',
      topics: [
        'DOM Hierarchy',
        'Container Relationships',
        'Viewport Concepts',
        'Scroll Behavior',
        'Browser APIs'
      ],
      learningObjectives: [
        'Understand the difference between Screen, Window, Document, and Viewport',
        'Learn how scrolling affects container relationships',
        'Practice with real-time DOM property monitoring',
        'Explore browser measurement APIs'
      ]
    };
  }

  /**
   * Get current module progress
   * @returns {Object} Progress information
   */
  getProgress() {
    return {
      completed:
        this.isInitialized && localStorage.getItem('foundation-module-visited'),
      timeSpent: this.getTimeSpent(),
      interactionsCount: this.getInteractionsCount(),
      conceptsExplored: this.getExploredConcepts()
    };
  }

  /**
   * Get time spent in module
   * @returns {number} Time in milliseconds
   * @private
   */
  getTimeSpent() {
    const startTime = parseInt(
      localStorage.getItem('foundation-start-time') || Date.now()
    );
    return Date.now() - startTime;
  }

  /**
   * Get number of interactions
   * @returns {number} Interaction count
   * @private
   */
  getInteractionsCount() {
    return parseInt(localStorage.getItem('foundation-interactions') || '0');
  }

  /**
   * Get explored concepts
   * @returns {Array} Array of explored concept names
   * @private
   */
  getExploredConcepts() {
    const explored = localStorage.getItem('foundation-concepts');
    return explored ? JSON.parse(explored) : [];
  }

  /**
   * Export current visualization
   * @param {string} format - Export format
   * @returns {string} Data URL or blob
   */
  exportVisualization(format = 'png') {
    if (!this.visualizer) {
      throw new Error('Visualizer not available');
    }

    return this.visualizer.exportImage(format);
  }

  /**
   * Reset module progress
   */
  resetProgress() {
    localStorage.removeItem('foundation-module-visited');
    localStorage.removeItem('foundation-start-time');
    localStorage.removeItem('foundation-interactions');
    localStorage.removeItem('foundation-concepts');

    console.log('🔄 Foundation Module progress reset');
  }

  /**
   * Emit custom event
   * @param {string} eventName - Event name
   * @param {*} detail - Event detail data
   * @private
   */
  emit(eventName, detail = null) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });

    this.container.dispatchEvent(event);
  }

  /**
   * Get module status for debugging
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      hasVisualizer: !!this.visualizer,
      visualizerStatus: this.visualizer ? this.visualizer.getStatus() : null,
      options: this.options,
      progress: this.getProgress()
    };
  }

  /**
   * Destroy the Foundation module
   */
  destroy() {
    console.log('🗑️ Destroying Foundation Module...');

    // Deactivate if active
    if (this.isActive) {
      this.deactivate();
    }

    // Destroy visualizer
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleWindowResize.bind(this));
    document.removeEventListener(
      'theme:changed',
      this.handleThemeChange.bind(this)
    );
    document.removeEventListener(
      'module:activate',
      this.handleModuleActivation.bind(this)
    );
    document.removeEventListener(
      'module:deactivate',
      this.handleModuleDeactivation.bind(this)
    );

    // Clear timeouts
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove(
        'module-container',
        'foundation-module-container',
        'active'
      );
    }

    // Reset state
    this.isInitialized = false;
    this.isActive = false;

    console.log('✅ Foundation Module destroyed');
  }
}

// Default export for the module
export default FoundationModule;

// Named exports for individual components
export { DOMMetricsVisualizer } from './DOMMetricsVisualizer.js';

// Module metadata for the module system
export const moduleMetadata = {
  name: 'foundation',
  title: 'Foundation Module',
  description: 'Learn DOM container relationships and browser measurement APIs',
  category: 'fundamentals',
  difficulty: 'beginner',
  icon: '🏗️',
  estimatedTime: 15,
  prerequisites: [],
  learningObjectives: [
    'Understand DOM container hierarchy',
    'Learn viewport and scrolling concepts',
    'Practice with browser measurement APIs',
    'Visualize container relationships'
  ],
  version: '1.0.0'
};
