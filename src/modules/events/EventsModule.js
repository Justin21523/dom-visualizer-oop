/** src/modules/events/EventsModule.js */
/**
 * Events Module - Main controller for event flow learning
 *
 * This module teaches users about:
 * - Event flow (bubbling/capturing)
 * - Event delegation patterns
 * - Custom event creation
 * - Event performance monitoring
 *
 * @author DOM Visualizer OOP Team
 * @version 1.0.0
 */

import { EventFlowVisualizer } from './EventFlowVisualizer.js';
import { EventDelegationDemo } from './EventDelegationDemo.js';
import { CustomEventFactory } from './CustomEventFactory.js';
import { ListenerProfiler } from './ListenerProfiler.js';

/**
 * Events Module - Comprehensive event system learning platform
 * @class EventsModule
 */
export class EventsModule {
  /**
   * Initialize the Events Module
   * @param {HTMLElement} container - Container element for the module
   * @param {Object} options - Module configuration options
   */
  constructor(container, options = {}) {
    // Validate container
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('Valid container element is required');
    }

    this.container = container;
    this.options = {
      enableAnimation: true,
      animationSpeed: 'normal', // slow, normal, fast
      showPerformanceMetrics: true,
      autoPlayDemos: false,
      theme: 'light',
      debugMode: false,
      ...options
    };

    // Module state
    this.isInitialized = false;
    this.isActive = false;
    this.currentDemo = null;
    this.activeComponents = new Map();

    // Bind methods to preserve context
    this.handleDemoSelect = this.handleDemoSelect.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);

    console.log('🎭 Events Module initialized with options:', this.options);
  }

  /**
   * Initialize the module (setup but don't activate)
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ Events Module already initialized');
      return;
    }

    console.log('🚀 Initializing Events Module...');

    try {
      // Setup module structure
      this.setupModuleStructure();

      // Initialize navigation
      this.setupNavigation();

      // Initialize demo selector
      this.setupDemoSelector();

      // Initialize performance monitoring if enabled
      if (this.options.showPerformanceMetrics) {
        await this.initializePerformanceMonitoring();
      }

      // Bind global events
      this.bindGlobalEvents();

      this.isInitialized = true;
      console.log('✅ Events Module initialized successfully');

      // Track initialization for educational analytics
      this.trackProgress('module_initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Events Module:', error);
      throw error;
    }
  }

  /**
   * Activate the module (make it visible and interactive)
   * @returns {Promise<void>}
   */
  async activate() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isActive) {
      console.warn('⚠️ Events Module already active');
      return;
    }

    console.log('🎬 Activating Events Module...');

    try {
      // Show module container
      this.container.classList.add('active');

      // Start with default demo (Event Flow)
      await this.loadDemo('event-flow');

      // Mark as active
      this.isActive = true;

      // Emit activation event
      this.emit('events:module:activated');

      // Track activation
      this.trackProgress('module_activated');

      console.log('✅ Events Module activated successfully');
    } catch (error) {
      console.error('❌ Failed to activate Events Module:', error);
      throw error;
    }
  }

  /**
   * Deactivate the module
   */
  deactivate() {
    if (!this.isActive) {
      return;
    }

    console.log('⏸️ Deactivating Events Module...');

    // Hide container
    this.container.classList.remove('active');

    // Deactivate current demo
    if (this.currentDemo) {
      this.deactivateCurrentDemo();
    }

    // Stop all active components
    this.deactivateAllComponents();

    this.isActive = false;

    // Emit deactivation event
    this.emit('events:module:deactivated');

    console.log('✅ Events Module deactivated');
  }

  /**
   * Setup the basic module structure
   * @private
   */
  setupModuleStructure() {
    this.container.className = 'module-container events-module-container';

    this.container.innerHTML = `
      <div class="module-header">
        <div class="breadcrumb">
          <span class="breadcrumb-item">
            <a href="#" class="back-button">← Back to Modules</a>
          </span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item active">Events Module</span>
        </div>

        <div class="module-title-section">
          <h1 class="module-title">
            <span class="module-icon">⚡</span>
            Events & Interactions
          </h1>
          <p class="module-description">
            Master JavaScript event flow, delegation patterns, and custom events through interactive visualizations
          </p>
        </div>

        <div class="module-controls">
          <div class="demo-selector">
            <label for="demo-select">Choose Demo:</label>
            <select id="demo-select" class="demo-select">
              <option value="event-flow">Event Flow (Bubbling/Capturing)</option>
              <option value="delegation">Event Delegation</option>
              <option value="custom-events">Custom Events</option>
              <option value="performance">Performance Monitoring</option>
            </select>
          </div>

          <div class="control-buttons">
            <button class="btn btn-secondary" id="reset-demo">Reset Demo</button>
            <button class="btn btn-primary" id="toggle-performance">
              <span class="performance-indicator">📊</span>
              Performance
            </button>
          </div>
        </div>
      </div>

      <div class="module-content">
        <div class="demo-container">
          <!-- Demo content will be loaded here -->
        </div>

        <div class="sidebar">
          <div class="concept-panel">
            <h3>Key Concepts</h3>
            <div class="concept-list">
              <!-- Concepts will be populated based on active demo -->
            </div>
          </div>

          <div class="code-panel">
            <h3>Code Example</h3>
            <div class="code-viewer">
              <!-- Code examples will be shown here -->
            </div>
          </div>
        </div>
      </div>

      <div class="performance-overlay hidden" id="performance-overlay">
        <div class="performance-metrics">
          <div class="metric-item">
            <span class="metric-label">Event Listeners:</span>
            <span class="metric-value" id="listener-count">0</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Events Fired:</span>
            <span class="metric-value" id="events-fired">0</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Avg. Handler Time:</span>
            <span class="metric-value" id="avg-handler-time">0ms</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup navigation and back button
   * @private
   */
  setupNavigation() {
    const backButton = this.container.querySelector('.back-button');
    backButton.addEventListener('click', e => {
      e.preventDefault();
      this.navigateBack();
    });
  }

  /**
   * Setup demo selector functionality
   * @private
   */
  setupDemoSelector() {
    const demoSelect = this.container.querySelector('#demo-select');
    demoSelect.addEventListener('change', this.handleDemoSelect);

    // Setup control buttons
    const resetBtn = this.container.querySelector('#reset-demo');
    const performanceBtn = this.container.querySelector('#toggle-performance');

    resetBtn.addEventListener('click', () => this.resetCurrentDemo());
    performanceBtn.addEventListener('click', () =>
      this.togglePerformanceOverlay()
    );
  }

  /**
   * Initialize performance monitoring system
   * @private
   */
  async initializePerformanceMonitoring() {
    try {
      this.profiler = new ListenerProfiler({
        trackEventTiming: true,
        trackMemoryUsage: true,
        updateInterval: 1000
      });

      // Start monitoring
      this.profiler.startMonitoring();

      // Update performance display
      this.profiler.on('metrics:updated', metrics => {
        this.updatePerformanceDisplay(metrics);
      });

      console.log('📊 Performance monitoring initialized');
    } catch (error) {
      console.warn('⚠️ Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Bind global event listeners
   * @private
   */
  bindGlobalEvents() {
    // Window resize
    window.addEventListener('resize', this.handleWindowResize);

    // Theme changes
    document.addEventListener('theme:changed', this.handleThemeChange);

    // Escape key to reset/close
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isActive) {
        this.resetCurrentDemo();
      }
    });
  }

  /**
   * Handle demo selection change
   * @param {Event} event - Change event
   * @private
   */
  async handleDemoSelect(event) {
    const selectedDemo = event.target.value;
    await this.loadDemo(selectedDemo);
  }

  /**
   * Load and activate a specific demo
   * @param {string} demoName - Name of demo to load
   * @returns {Promise<void>}
   */
  async loadDemo(demoName) {
    console.log(`🎭 Loading demo: ${demoName}`);

    try {
      // Deactivate current demo first
      if (this.currentDemo) {
        this.deactivateCurrentDemo();
      }

      const demoContainer = this.container.querySelector('.demo-container');

      // Clear previous demo content
      demoContainer.innerHTML = '';

      let demoComponent;

      // Create appropriate demo component
      switch (demoName) {
        case 'event-flow':
          demoComponent = new EventFlowVisualizer(demoContainer, {
            ...this.options,
            showBubblingPath: true,
            showCapturingPath: true,
            enableInteraction: true
          });
          break;

        case 'delegation':
          demoComponent = new EventDelegationDemo(demoContainer, {
            ...this.options,
            allowDynamicElements: true,
            showDelegationBenefits: true
          });
          break;

        case 'custom-events':
          demoComponent = new CustomEventFactory(demoContainer, {
            ...this.options,
            enableEventCreation: true,
            showEventDetails: true
          });
          break;

        case 'performance':
          // Performance demo uses the profiler directly
          await this.setupPerformanceDemo(demoContainer);
          break;

        default:
          throw new Error(`Unknown demo: ${demoName}`);
      }

      // Initialize demo component if it exists
      if (demoComponent) {
        await demoComponent.initialize();
        this.activeComponents.set(demoName, demoComponent);

        // Setup demo-specific event listeners
        this.setupDemoEventListeners(demoComponent, demoName);
      }

      this.currentDemo = demoName;

      // Update concept panel and code viewer
      this.updateConceptPanel(demoName);
      this.updateCodeViewer(demoName);

      // Update demo selector
      const demoSelect = this.container.querySelector('#demo-select');
      demoSelect.value = demoName;

      // Track demo activation
      this.trackProgress('demo_activated', { demoName });

      console.log(`✅ Demo loaded: ${demoName}`);
    } catch (error) {
      console.error(`❌ Failed to load demo ${demoName}:`, error);
      throw error;
    }
  }

  /**
   * Setup performance demonstration
   * @param {HTMLElement} container - Demo container
   * @private
   */
  async setupPerformanceDemo(container) {
    container.innerHTML = `
      <div class="performance-demo">
        <h3>Event Performance Analysis</h3>

        <div class="performance-controls">
          <button class="btn" id="add-listeners">Add 100 Listeners</button>
          <button class="btn" id="trigger-events">Trigger 1000 Events</button>
          <button class="btn" id="memory-stress">Memory Stress Test</button>
          <button class="btn btn-warning" id="clear-listeners">Clear All</button>
        </div>

        <div class="performance-visualization">
          <canvas id="performance-chart" width="600" height="300"></canvas>
        </div>

        <div class="performance-tips">
          <h4>Performance Tips:</h4>
          <ul>
            <li>Use event delegation for dynamic content</li>
            <li>Remove unused event listeners</li>
            <li>Throttle/debounce high-frequency events</li>
            <li>Avoid memory leaks in closures</li>
          </ul>
        </div>
      </div>
    `;

    // Setup performance demo controls
    this.setupPerformanceDemoControls(container);
  }

  /**
   * Setup performance demo control buttons
   * @param {HTMLElement} container - Demo container
   * @private
   */
  setupPerformanceDemoControls(container) {
    const addListenersBtn = container.querySelector('#add-listeners');
    const triggerEventsBtn = container.querySelector('#trigger-events');
    const memoryStressBtn = container.querySelector('#memory-stress');
    const clearBtn = container.querySelector('#clear-listeners');

    addListenersBtn.addEventListener('click', () => {
      // Simulate adding many listeners for performance testing
      for (let i = 0; i < 100; i++) {
        document.body.addEventListener('click', () => {
          // Dummy handler
        });
      }
      this.profiler.updateMetrics();
    });

    triggerEventsBtn.addEventListener('click', () => {
      // Trigger many events for performance analysis
      for (let i = 0; i < 1000; i++) {
        document.body.dispatchEvent(new CustomEvent('test-event'));
      }
    });

    memoryStressBtn.addEventListener('click', () => {
      // Create potential memory leak scenario
      this.simulateMemoryStress();
    });

    clearBtn.addEventListener('click', () => {
      // Clear all test listeners (in real implementation)
      this.profiler.reset();
    });
  }

  /**
   * Setup event listeners for demo components
   * @param {Object} component - Demo component instance
   * @param {string} demoName - Name of the demo
   * @private
   */
  setupDemoEventListeners(component, demoName) {
    // Listen for educational events from demo components
    component.on('concept:explained', data => {
      this.trackProgress('concept_learned', {
        demo: demoName,
        concept: data.concept
      });
    });

    component.on('interaction:performed', data => {
      this.trackProgress('interaction', {
        demo: demoName,
        action: data.action
      });
    });

    // Handle demo-specific events
    switch (demoName) {
      case 'event-flow':
        component.on('event:bubbled', data => {
          console.log('🫧 Event bubbled through:', data.path);
        });

        component.on('event:captured', data => {
          console.log('🎯 Event captured at:', data.target);
        });
        break;

      case 'delegation':
        component.on('delegation:demonstrated', data => {
          console.log(
            '🎯 Event delegation:',
            data.delegator,
            '->',
            data.target
          );
        });
        break;

      case 'custom-events':
        component.on('custom-event:created', data => {
          console.log('✨ Custom event created:', data.eventType);
        });
        break;
    }
  }

  /**
   * Update concept panel based on active demo
   * @param {string} demoName - Name of active demo
   * @private
   */
  updateConceptPanel(demoName) {
    const conceptList = this.container.querySelector('.concept-list');

    const concepts = this.getConceptsForDemo(demoName);

    conceptList.innerHTML = concepts
      .map(
        concept => `
      <div class="concept-item">
        <h4>${concept.title}</h4>
        <p>${concept.description}</p>
        ${concept.interactive ? '<span class="interactive-badge">Interactive</span>' : ''}
      </div>
    `
      )
      .join('');
  }

  /**
   * Update code viewer with relevant examples
   * @param {string} demoName - Name of active demo
   * @private
   */
  updateCodeViewer(demoName) {
    const codeViewer = this.container.querySelector('.code-viewer');
    const codeExample = this.getCodeExampleForDemo(demoName);

    codeViewer.innerHTML = `
      <pre><code class="language-javascript">${codeExample}</code></pre>
    `;
  }

  /**
   * Get learning concepts for a specific demo
   * @param {string} demoName - Demo name
   * @returns {Array} Array of concept objects
   * @private
   */
  getConceptsForDemo(demoName) {
    const conceptMap = {
      'event-flow': [
        {
          title: 'Event Bubbling',
          description: 'Events propagate from target to document root',
          interactive: true
        },
        {
          title: 'Event Capturing',
          description: 'Events propagate from document root to target',
          interactive: true
        },
        {
          title: 'Event.stopPropagation()',
          description: 'Stops event from continuing its propagation',
          interactive: true
        }
      ],
      delegation: [
        {
          title: 'Event Delegation',
          description: 'Handle events on parent for better performance',
          interactive: true
        },
        {
          title: 'Dynamic Elements',
          description: 'Delegation works with dynamically added elements',
          interactive: true
        }
      ],
      'custom-events': [
        {
          title: 'CustomEvent API',
          description: 'Create and dispatch custom events',
          interactive: true
        },
        {
          title: 'Event Data',
          description: 'Pass custom data with events',
          interactive: true
        }
      ],
      performance: [
        {
          title: 'Listener Performance',
          description: 'Monitor event listener memory usage',
          interactive: false
        },
        {
          title: 'Event Frequency',
          description: 'Analyze event firing frequency',
          interactive: false
        }
      ]
    };

    return conceptMap[demoName] || [];
  }

  /**
   * Get code example for a specific demo
   * @param {string} demoName - Demo name
   * @returns {string} Code example
   * @private
   */
  getCodeExampleForDemo(demoName) {
    const codeMap = {
      'event-flow': `// Event bubbling example
element.addEventListener('click', (e) => {
  console.log('Bubbling phase');
  // Event bubbles up from target
});

// Event capturing example
element.addEventListener('click', (e) => {
  console.log('Capturing phase');
}, true); // useCapture = true`,

      delegation: `// Event delegation pattern
parent.addEventListener('click', (e) => {
  if (e.target.matches('.child-button')) {
    console.log('Button clicked:', e.target);
  }
});

// Works for dynamically added elements
const newButton = document.createElement('button');
newButton.className = 'child-button';
parent.appendChild(newButton);`,

      'custom-events': `// Create custom event
const customEvent = new CustomEvent('myEvent', {
  detail: { message: 'Hello World!' },
  bubbles: true
});

// Listen for custom event
element.addEventListener('myEvent', (e) => {
  console.log(e.detail.message);
});

// Dispatch custom event
element.dispatchEvent(customEvent);`,

      performance: `// Monitor event listener performance
const profiler = new ListenerProfiler();

// Track listener additions
profiler.trackListener(element, 'click', handler);

// Analyze performance
const metrics = profiler.getMetrics();
console.log('Listeners:', metrics.listenerCount);
console.log('Memory:', metrics.memoryUsage);`
    };

    return codeMap[demoName] || '// No example available';
  }

  /**
   * Reset current demo
   */
  resetCurrentDemo() {
    if (!this.currentDemo) return;

    console.log(`🔄 Resetting demo: ${this.currentDemo}`);

    const component = this.activeComponents.get(this.currentDemo);
    if (component && typeof component.reset === 'function') {
      component.reset();
    }

    // Reset performance metrics
    if (this.profiler) {
      this.profiler.reset();
    }

    this.trackProgress('demo_reset', { demo: this.currentDemo });
  }

  /**
   * Deactivate current demo
   * @private
   */
  deactivateCurrentDemo() {
    if (!this.currentDemo) return;

    const component = this.activeComponents.get(this.currentDemo);
    if (component && typeof component.deactivate === 'function') {
      component.deactivate();
    }

    this.activeComponents.delete(this.currentDemo);
    this.currentDemo = null;
  }

  /**
   * Deactivate all active components
   * @private
   */
  deactivateAllComponents() {
    this.activeComponents.forEach((component, name) => {
      if (typeof component.deactivate === 'function') {
        component.deactivate();
      }
    });
    this.activeComponents.clear();
  }

  /**
   * Toggle performance overlay visibility
   */
  togglePerformanceOverlay() {
    const overlay = this.container.querySelector('#performance-overlay');
    overlay.classList.toggle('hidden');
  }

  /**
   * Update performance display with current metrics
   * @param {Object} metrics - Performance metrics
   * @private
   */
  updatePerformanceDisplay(metrics) {
    const listenerCount = this.container.querySelector('#listener-count');
    const eventsFired = this.container.querySelector('#events-fired');
    const avgHandlerTime = this.container.querySelector('#avg-handler-time');

    if (listenerCount) listenerCount.textContent = metrics.listenerCount || 0;
    if (eventsFired) eventsFired.textContent = metrics.eventsFired || 0;
    if (avgHandlerTime)
      avgHandlerTime.textContent = `${metrics.avgHandlerTime || 0}ms`;
  }

  /**
   * Simulate memory stress for demonstration
   * @private
   */
  simulateMemoryStress() {
    console.log('🧠 Simulating memory stress...');

    // Create many closures that might cause memory leaks
    const leaks = [];
    for (let i = 0; i < 1000; i++) {
      const data = new Array(1000).fill(`data-${i}`);
      const handler = () => {
        console.log(data.length); // Closure captures data
      };

      document.body.addEventListener('test-leak', handler);
      leaks.push({ handler, data });
    }

    // Clean up after demonstration
    setTimeout(() => {
      leaks.forEach(({ handler }) => {
        document.body.removeEventListener('test-leak', handler);
      });
      console.log('🧹 Memory stress test cleaned up');
    }, 5000);
  }

  /**
   * Handle window resize
   * @private
   */
  handleWindowResize() {
    if (!this.isActive) return;

    // Notify active components of resize
    this.activeComponents.forEach(component => {
      if (typeof component.handleResize === 'function') {
        component.handleResize();
      }
    });
  }

  /**
   * Handle theme changes
   * @param {CustomEvent} event - Theme change event
   * @private
   */
  handleThemeChange(event) {
    const newTheme = event.detail.theme;
    this.options.theme = newTheme;

    // Update all active components
    this.activeComponents.forEach(component => {
      if (typeof component.setTheme === 'function') {
        component.setTheme(newTheme);
      }
    });
  }

  /**
   * Navigate back to module selection
   * @private
   */
  navigateBack() {
    this.emit('navigation:back');
    this.deactivate();

    // Navigate to home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '';
    }
  }

  /**
   * Track learning progress for analytics
   * @param {string} action - Action type
   * @param {Object} data - Additional data
   * @private
   */
  trackProgress(action, data = {}) {
    const progressData = {
      module: 'events',
      action,
      timestamp: Date.now(),
      ...data
    };

    // Store in localStorage for persistence
    const progressKey = 'events-module-progress';
    const existingProgress = JSON.parse(
      localStorage.getItem(progressKey) || '[]'
    );
    existingProgress.push(progressData);
    localStorage.setItem(progressKey, JSON.stringify(existingProgress));

    // Emit progress event
    this.emit('learning:progress', progressData);

    if (this.options.debugMode) {
      console.log('📊 Progress tracked:', progressData);
    }
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
   * Get module information
   * @returns {Object} Module information
   */
  getInfo() {
    return {
      name: 'Events',
      title: 'Event Flow & Interactions',
      description:
        'Master JavaScript event handling, delegation, and custom events',
      difficulty: 'Intermediate',
      estimatedTime: '20-25 minutes',
      topics: [
        'Event Bubbling & Capturing',
        'Event Delegation',
        'Custom Events',
        'Performance Monitoring',
        'Memory Management'
      ],
      learningObjectives: [
        'Understand event flow mechanisms',
        'Master event delegation patterns',
        'Create and use custom events',
        'Monitor event performance',
        'Prevent memory leaks'
      ]
    };
  }

  /**
   * Get current module progress
   * @returns {Object} Progress information
   */
  getProgress() {
    const progressKey = 'events-module-progress';
    const progress = JSON.parse(localStorage.getItem(progressKey) || '[]');

    return {
      completed: progress.some(p => p.action === 'module_completed'),
      demosCompleted: [
        ...new Set(
          progress
            .filter(p => p.action === 'demo_activated')
            .map(p => p.demoName)
        )
      ],
      conceptsLearned: progress.filter(p => p.action === 'concept_learned')
        .length,
      interactionCount: progress.filter(p => p.action === 'interaction').length,
      timeSpent: this.calculateTimeSpent(progress),
      lastActivity:
        progress.length > 0
          ? new Date(progress[progress.length - 1].timestamp)
          : null
    };
  }

  /**
   * Calculate time spent in module
   * @param {Array} progress - Progress array
   * @returns {number} Time in milliseconds
   * @private
   */
  calculateTimeSpent(progress) {
    if (progress.length === 0) return 0;

    const firstActivity = progress[0].timestamp;
    const lastActivity = progress[progress.length - 1].timestamp;

    return lastActivity - firstActivity;
  }

  /**
   * Export module data for external use
   * @param {string} format - Export format ('json', 'csv')
   * @returns {string} Exported data
   */
  exportData(format = 'json') {
    const progress = this.getProgress();
    const moduleInfo = this.getInfo();

    const exportData = {
      module: moduleInfo,
      progress,
      exportedAt: new Date().toISOString(),
      version: moduleMetadata.version
    };

    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);

      case 'csv':
        // Convert to CSV format for analytics
        const progressKey = 'events-module-progress';
        const progressArray = JSON.parse(
          localStorage.getItem(progressKey) || '[]'
        );

        const csvHeader = 'timestamp,action,demo,concept,details\n';
        const csvRows = progressArray
          .map(
            p =>
              `${new Date(p.timestamp).toISOString()},${p.action},${p.demoName || ''},${p.concept || ''},${JSON.stringify(p)}`
          )
          .join('\n');

        return csvHeader + csvRows;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Reset all module progress
   */
  resetProgress() {
    localStorage.removeItem('events-module-progress');

    // Reset all active components
    this.activeComponents.forEach(component => {
      if (typeof component.reset === 'function') {
        component.reset();
      }
    });

    console.log('🔄 Events Module progress reset');
  }

  /**
   * Get module status for debugging
   * @returns {Object} Current module status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      currentDemo: this.currentDemo,
      activeComponents: Array.from(this.activeComponents.keys()),
      hasProfiler: !!this.profiler,
      options: this.options,
      progress: this.getProgress()
    };
  }

  /**
   * Destroy the Events Module and clean up resources
   */
  destroy() {
    console.log('🗑️ Destroying Events Module...');

    // Deactivate if active
    if (this.isActive) {
      this.deactivate();
    }

    // Stop profiler
    if (this.profiler) {
      this.profiler.stopMonitoring();
      this.profiler = null;
    }

    // Remove global event listeners
    window.removeEventListener('resize', this.handleWindowResize);
    document.removeEventListener('theme:changed', this.handleThemeChange);

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove(
        'module-container',
        'events-module-container',
        'active'
      );
    }

    // Reset state
    this.isInitialized = false;
    this.isActive = false;
    this.currentDemo = null;
    this.activeComponents.clear();

    console.log('✅ Events Module destroyed');
  }
}

// Export for module system
export default EventsModule;

// Module metadata for registration
export const moduleMetadata = {
  name: 'events',
  title: 'Events Module',
  description:
    'Master JavaScript event handling, delegation, and custom events',
  category: 'fundamentals',
  difficulty: 'intermediate',
  icon: '⚡',
  estimatedTime: 25,
  prerequisites: ['foundation'],
  learningObjectives: [
    'Understand event bubbling and capturing',
    'Master event delegation patterns',
    'Create and dispatch custom events',
    'Monitor event performance',
    'Prevent memory leaks in event handlers'
  ],
  version: '1.0.0'
};
