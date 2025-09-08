/**
 * Events Module - Entry point and exports
 *
 * This module provides comprehensive event handling education through:
 * - Event flow visualization (bubbling/capturing)
 * - Event delegation demonstrations
 * - Custom event creation and handling
 * - Performance monitoring and optimization
 *
 * @author DOM Visualizer OOP Team
 * @version 1.0.0
 */

// Main module controller
export { EventsModule } from './EventsModule.js';

// Individual components
export { EventFlowVisualizer } from './EventFlowVisualizer.js';
export { EventDelegationDemo } from './EventDelegationDemo.js';
export { CustomEventFactory } from './CustomEventFactory.js';
export { ListenerProfiler } from './ListenerProfiler.js';

// Default export for module system
export default EventsModule;

// Module metadata for registration system
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
    'Understand event bubbling and capturing phases',
    'Master event delegation patterns for better performance',
    'Create and dispatch custom events effectively',
    'Monitor and optimize event listener performance',
    'Prevent memory leaks in event handlers',
    'Apply best practices for event-driven architecture'
  ],
  topics: [
    'Event Flow (Bubbling/Capturing)',
    'Event Delegation',
    'Custom Events',
    'Performance Monitoring',
    'Memory Management',
    'Event-Driven Architecture'
  ],
  features: [
    'Interactive event flow visualization',
    'Real-time performance comparison',
    'Custom event factory with templates',
    'Live event monitoring and analysis',
    'Performance optimization recommendations',
    'Memory leak detection and prevention'
  ],
  version: '1.0.0',
  lastUpdated: '2024-01-15'
};

/**
 * Quick start function for the Events Module
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Configuration options
 * @returns {Promise<EventsModule>} Initialized module instance
 */
export async function createEventsModule(container, options = {}) {
  const module = new EventsModule(container, options);
  await module.initialize();
  return module;
}

/**
 * Module configuration presets
 */
export const modulePresets = {
  // Basic preset for beginners
  beginner: {
    enableAnimation: true,
    animationSpeed: 'slow',
    showPerformanceMetrics: false,
    autoPlayDemos: true,
    debugMode: false
  },

  // Advanced preset for experienced developers
  advanced: {
    enableAnimation: true,
    animationSpeed: 'normal',
    showPerformanceMetrics: true,
    autoPlayDemos: false,
    debugMode: true
  },

  // Performance-focused preset
  performance: {
    enableAnimation: false,
    animationSpeed: 'fast',
    showPerformanceMetrics: true,
    autoPlayDemos: false,
    debugMode: true
  },

  // Presentation preset for teaching
  presentation: {
    enableAnimation: true,
    animationSpeed: 'slow',
    showPerformanceMetrics: true,
    autoPlayDemos: true,
    debugMode: false
  }
};

/**
 * Get recommended next modules after completing Events Module
 * @returns {Array} Array of recommended module names
 */
export function getRecommendedNextModules() {
  return [
    'dom', // DOM manipulation builds on event handling
    'performance', // Performance optimization extends event performance
    'boxmodel', // Layout understanding complements event positioning
    'learning' // Advanced challenges using event concepts
  ];
}

/**
 * Validate module dependencies
 * @param {Array} completedModules - List of completed module names
 * @returns {Object} Validation result
 */
export function validateDependencies(completedModules = []) {
  const requirements = moduleMetadata.prerequisites;
  const missing = requirements.filter(req => !completedModules.includes(req));

  return {
    isValid: missing.length === 0,
    missing,
    recommendations:
      missing.length > 0
        ? [
            `Complete the ${missing.join(', ')} module(s) first for the best learning experience`
          ]
        : ["You're ready to start the Events Module!"]
  };
}

/**
 * Get module learning path information
 * @returns {Object} Learning path details
 */
export function getLearningPath() {
  return {
    currentModule: 'events',
    position: 2, // Second in the recommended sequence
    totalModules: 6,
    estimatedProgress: '33%',
    skillLevel: 'Intermediate',
    nextRecommended: 'dom',
    previousRecommended: 'foundation'
  };
}

/**
 * Export sample code snippets for documentation
 */
export const codeExamples = {
  eventDelegation: `
// Event delegation pattern
const container = document.querySelector('.container');

container.addEventListener('click', function(event) {
  // Check if clicked element matches our selector
  if (event.target.matches('.button')) {
    console.log('Button clicked:', event.target.textContent);

    // Handle the click
    handleButtonClick(event.target);
  }
});

// Add new buttons dynamically - delegation still works!
function addNewButton(text) {
  const button = document.createElement('button');
  button.className = 'button';
  button.textContent = text;
  container.appendChild(button);
  // No need to add individual event listeners!
}
  `,

  customEvents: `
// Creating custom events
const customEvent = new CustomEvent('userAction', {
  detail: {
    action: 'purchase',
    item: 'premium-plan',
    value: 99.99,
    timestamp: Date.now()
  },
  bubbles: true,
  cancelable: true
});

// Listen for custom events
document.addEventListener('userAction', function(event) {
  const { action, item, value } = event.detail;

  // Track analytics
  analytics.track(action, { item, value });

  // Update UI
  updateUserInterface(event.detail);
});

// Dispatch the event
document.dispatchEvent(customEvent);
  `,

  eventFlow: `
// Understanding event flow
const element = document.querySelector('.target');

// Capturing phase listener
element.addEventListener('click', function(event) {
  console.log('Capturing phase');
}, true); // useCapture = true

// Bubbling phase listener (default)
element.addEventListener('click', function(event) {
  console.log('Bubbling phase');

  // Stop propagation if needed
  // event.stopPropagation();

  // Prevent default behavior
  // event.preventDefault();
}, false); // useCapture = false (default)
  `,

  performanceOptimization: `
// Performance optimization techniques

// 1. Use event delegation instead of individual listeners
// Bad: Many individual listeners
buttons.forEach(button => {
  button.addEventListener('click', handleClick);
});

// Good: One delegated listener
container.addEventListener('click', function(event) {
  if (event.target.matches('.button')) {
    handleClick(event);
  }
});

// 2. Remove unused listeners
function cleanup() {
  element.removeEventListener('click', handler);
}

// 3. Throttle high-frequency events
function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;

  return function(...args) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    }
  };
}

// Use with scroll, resize, etc.
window.addEventListener('scroll', throttle(handleScroll, 100));
  `
};

/**
 * Module usage statistics and analytics
 */
export const analytics = {
  /**
   * Track module usage
   * @param {string} action - Action type
   * @param {Object} data - Additional data
   */
  track(action, data = {}) {
    const event = new CustomEvent('module:analytics', {
      detail: {
        module: 'events',
        action,
        data,
        timestamp: Date.now()
      }
    });

    document.dispatchEvent(event);
  },

  /**
   * Get usage recommendations
   * @param {Object} userProgress - User progress data
   * @returns {Array} Recommendations
   */
  getRecommendations(userProgress = {}) {
    const recommendations = [];

    if (!userProgress.completedEventFlow) {
      recommendations.push({
        type: 'learning',
        priority: 'high',
        message: 'Start with Event Flow Visualization to understand the basics',
        action: 'loadDemo',
        target: 'event-flow'
      });
    }

    if (userProgress.completedEventFlow && !userProgress.completedDelegation) {
      recommendations.push({
        type: 'learning',
        priority: 'high',
        message: 'Learn Event Delegation for better performance',
        action: 'loadDemo',
        target: 'delegation'
      });
    }

    if (userProgress.eventListenerCount > 50) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Consider using event delegation to reduce listener count',
        action: 'optimizeListeners'
      });
    }

    return recommendations;
  }
};

/**
 * Debugging and development utilities
 */
export const devUtils = {
  /**
   * Enable debug mode for all components
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled = true) {
    window.EVENTS_MODULE_DEBUG = enabled;
    console.log(
      `Events Module debug mode: ${enabled ? 'enabled' : 'disabled'}`
    );
  },

  /**
   * Get module performance metrics
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    return {
      moduleLoadTime: window.performance.mark
        ? performance.getEntriesByName('events-module-load')[0]?.duration
        : null,
      memoryUsage: performance.memory
        ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
          }
        : null,
      activeListeners: document.querySelectorAll('[data-events-module]').length
    };
  },

  /**
   * Reset all module data for testing
   */
  resetModuleData() {
    localStorage.removeItem('events-module-progress');
    localStorage.removeItem('events-module-settings');
    console.log('Events Module data reset');
  }
};

// Development mode setup
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.EventsModule = {
    ...moduleMetadata,
    createModule: createEventsModule,
    presets: modulePresets,
    examples: codeExamples,
    analytics,
    dev: devUtils
  };

  console.log(
    '🎭 Events Module development utilities available at window.EventsModule'
  );
}
