/**
 * DOM Module - Entry Point and Module Definition
 *
 * This file serves as the main entry point for the DOM manipulation and analysis
 * learning module, providing exports for all components and module metadata.
 *
 * @fileoverview DOM Module main entry point with StyleComputer integration
 * @version 1.1.0
 * @author DOM Visualizer OOP Team
 */

// Import main module controller
import { DOMModule } from './DOMModule.js';

// Import individual components
import { NodeTreeEditor } from './NodeTreeEditor.js';
import { AttributeInspector } from './AttributeInspector.js';
import { SelectorTester } from './SelectorTester.js';
import { StyleComputer } from './StyleComputer.js';
import { DOMDiffer } from './DOMDiffer.js';
import { ElementManipulator } from './ElementManipulator.js';
import { TreeTraverser } from './TreeTraverser.js';
import { MutationObserverDemo } from './MutationObserverDemo.js';

/**
 * Module metadata for integration with the main application
 */
export const moduleMetadata = {
  // Basic module information
  name: 'dom',
  title: 'DOM Manipulation & Analysis',
  description:
    'Interactive tools for learning DOM tree manipulation, attribute inspection, and CSS selector testing',
  version: '1.1.0',

  // Module categorization
  category: 'core',
  difficulty: 'intermediate',
  estimatedTime: '45-60 minutes',

  // Learning objectives
  objectives: [
    'Understand DOM tree structure and navigation',
    'Master element attribute manipulation',
    'Learn CSS selector optimization techniques',
    'Analyze computed styles and inheritance',
    'Practice real-time DOM inspection and modification',
    'Develop skills in performance-conscious DOM operations'
  ],

  // Prerequisites and dependencies
  prerequisites: ['foundation'],
  dependencies: [],
  optionalDependencies: ['events'],

  // Module features and capabilities
  features: {
    // Core functionalities
    treeVisualization: {
      name: 'DOM Tree Visualization',
      description:
        'Interactive tree view of DOM structure with real-time updates',
      icon: '🌲',
      enabled: true
    },

    attributeInspection: {
      name: 'Attribute Inspector',
      description: 'Comprehensive attribute analysis and manipulation tools',
      icon: '🔍',
      enabled: true
    },

    selectorTesting: {
      name: 'CSS Selector Tester',
      description: 'Test and optimize CSS selectors with performance metrics',
      icon: '🎯',
      enabled: true
    },

    styleComputation: {
      name: 'Style Computer',
      description: 'Analyze computed styles and CSS cascading',
      icon: '🎨',
      enabled: true
    },

    mutationObserving: {
      name: 'Mutation Observer',
      description: 'Real-time DOM change detection and analysis',
      icon: '👁️',
      enabled: true
    },
    // Utility features
    domDiffer: {
      name: 'DOM Differ',
      description: 'Compare DOM states and visualize changes',
      icon: '📊',
      enabled: true,
      component: 'DOMDiffer'
    },

    elementManipulator: {
      name: 'Element Manipulator',
      description: 'Safe DOM element creation and modification tools',
      icon: '🔧',
      enabled: true,
      component: 'ElementManipulator'
    },

    treeTraverser: {
      name: 'Tree Traverser',
      description: 'Advanced DOM tree navigation and search utilities',
      icon: '🗺️',
      enabled: true,
      component: 'TreeTraverser'
    }
  },

  // Learning paths and progression
  learningPaths: {
    beginner: {
      name: 'DOM Basics',
      description: 'Start with fundamental DOM concepts',
      steps: [
        'treeVisualization',
        'attributeInspection',
        'elementManipulator',
        'selectorTesting'
      ],
      estimatedTime: '30 minutes'
    },

    intermediate: {
      name: 'Advanced DOM Operations',
      description: 'Learn advanced manipulation and analysis',
      steps: [
        'selectorTesting',
        'styleComputation',
        'mutationObserver',
        'domDiffer'
      ],
      estimatedTime: '45 minutes'
    },

    advanced: {
      name: 'Performance & Optimization',
      description: 'Master performance-conscious DOM operations',
      steps: [
        'styleComputation',
        'domDiffer',
        'treeTraverser',
        'mutationObserver'
      ],
      estimatedTime: '60 minutes'
    }
  },

  // Configuration presets
  presets: {
    default: {
      name: 'Default Configuration',
      description: 'Balanced settings for general learning',
      config: {
        enableAllFeatures: true,
        performanceMonitoring: true,
        liveUpdates: true,
        validationEnabled: true
      }
    },

    performance: {
      name: 'Performance Focus',
      description: 'Optimized for performance analysis and monitoring',
      config: {
        enableAllFeatures: true,
        performanceMonitoring: true,
        detailedMetrics: true,
        trackChanges: true,
        liveUpdates: false
      }
    },

    educational: {
      name: 'Educational Mode',
      description: 'Enhanced explanations and guided learning',
      config: {
        enableAllFeatures: true,
        showExplanations: true,
        guidedMode: true,
        stepByStep: true,
        liveUpdates: true
      }
    },

    developer: {
      name: 'Developer Tools',
      description: 'Advanced features for experienced developers',
      config: {
        enableAllFeatures: true,
        advancedFeatures: true,
        debugMode: true,
        exportCapabilities: true,
        customization: true
      }
    },

    // Advanced features
    performanceMonitoring: {
      name: 'Performance Monitoring',
      description:
        'Track DOM operation performance and optimization suggestions',
      icon: '⚡',
      enabled: true
    },

    codeGeneration: {
      name: 'Code Generation',
      description: 'Generate JavaScript code examples from interactions',
      icon: '📝',
      enabled: true
    },

    accessibility: {
      name: 'Accessibility Analysis',
      description: 'Check DOM structure for accessibility compliance',
      icon: '♿',
      enabled: true
    }
  },

  // Code examples and templates
  examples: {
    basicManipulation: {
      title: 'Basic DOM Manipulation',
      description: 'Simple element creation and modification',
      code: `
// Create a new element
const div = document.createElement('div');
div.id = 'my-element';
div.className = 'demo-element';
div.textContent = 'Hello, DOM!';

// Add to document
document.body.appendChild(div);

// Modify attributes
div.setAttribute('data-created', Date.now());
div.style.backgroundColor = '#e3f2fd';
div.style.padding = '10px';
div.style.borderRadius = '4px';
      `,
      category: 'beginner'
    },

    selectorOptimization: {
      title: 'CSS Selector Optimization',
      description: 'Efficient selector patterns and performance',
      code: `
// Efficient selectors
const elements = document.querySelectorAll('.container > .item:nth-child(odd)');

// Avoid inefficient patterns
// BAD: document.querySelectorAll('* .item');
// GOOD: document.querySelectorAll('.container .item');

// Use specific context
const container = document.getElementById('main-container');
const items = container.querySelectorAll('.item');
      `,
      category: 'intermediate'
    },

    styleAnalysis: {
      title: 'Computed Style Analysis',
      description: 'Understanding CSS cascade and inheritance',
      code: `
const element = document.querySelector('#target');
const styles = window.getComputedStyle(element);

// Analyze specific properties
console.log('Color:', styles.color);
console.log('Font Size:', styles.fontSize);
console.log('Margin:', styles.margin);

// Check inheritance
const parent = element.parentElement;
const parentStyles = window.getComputedStyle(parent);
console.log('Inherited from parent:', {
  color: parentStyles.color,
  fontFamily: parentStyles.fontFamily
});
      `,
      category: 'intermediate'
    },

    mutationObserving: {
      title: 'Mutation Observer Usage',
      description: 'Monitoring DOM changes efficiently',
      code: `
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    console.log('Mutation type:', mutation.type);
    console.log('Target:', mutation.target);

    if (mutation.type === 'childList') {
      console.log('Added nodes:', mutation.addedNodes);
      console.log('Removed nodes:', mutation.removedNodes);
    }
  });
});

observer.observe(document.body, {
  childList: true,
  attributes: true,
  subtree: true
});
      `,
      category: 'advanced'
    },

    performanceOptimization: {
      title: 'Performance-Conscious DOM Operations',
      description: 'Optimizing DOM operations for better performance',
      code: `
// Batch DOM operations
const fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = \`Item \${i}\`;
  fragment.appendChild(div);
}

// Single DOM update
document.getElementById('container').appendChild(fragment);

// Use requestAnimationFrame for animations
function updateElement() {
  const element = document.getElementById('animated');
  element.style.transform = \`translateX(\${Date.now() % 200}px)\`;
  requestAnimationFrame(updateElement);
}
requestAnimationFrame(updateElement);
      `,
      category: 'advanced'
    }
  },

  // Integration utilities
  utils: {
    /**
     * Create DOM module instance with specific configuration
     * @param {HTMLElement} container - Container element
     * @param {Object} config - Configuration options
     * @returns {DOMModule} Module instance
     */
    createInstance(container, config = {}) {
      const presetConfig = this.presets[config.preset] || this.presets.default;
      const finalConfig = { ...presetConfig.config, ...config };

      return new DOMModule(container, finalConfig);
    },

    /**
     * Get recommended learning path based on user level
     * @param {string} level - User experience level
     * @returns {Object} Learning path configuration
     */
    getLearningPath(level = 'beginner') {
      return this.learningPaths[level] || this.learningPaths.beginner;
    },

    /**
     * Validate module configuration
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result
     */
    validateConfig(config) {
      const errors = [];
      const warnings = [];

      // Check required properties
      if (!config.container) {
        errors.push('Container element is required');
      }

      // Check feature compatibility
      if (config.liveUpdates && !config.performanceMonitoring) {
        warnings.push(
          'Live updates without performance monitoring may impact performance'
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    },

    /**
     * Get component by name
     * @param {string} componentName - Name of component
     * @returns {Class} Component class
     */
    getComponent(componentName) {
      const components = {
        DOMModule,
        NodeTreeEditor,
        AttributeInspector,
        SelectorTester,
        StyleComputer,
        DOMDiffer,
        ElementManipulator,
        TreeTraverser,
        MutationObserverDemo
      };

      return components[componentName] || null;
    }
  },

  // Educational resources
  resources: {
    documentation: {
      quickStart: '/docs/dom/quick-start',
      apiReference: '/docs/dom/api',
      examples: '/docs/dom/examples',
      bestPractices: '/docs/dom/best-practices'
    },

    tutorials: [
      {
        title: 'DOM Fundamentals',
        url: '/tutorials/dom-fundamentals',
        difficulty: 'beginner',
        duration: '15 minutes'
      },
      {
        title: 'CSS Selector Mastery',
        url: '/tutorials/css-selectors',
        difficulty: 'intermediate',
        duration: '20 minutes'
      },
      {
        title: 'Style Computation Deep Dive',
        url: '/tutorials/computed-styles',
        difficulty: 'intermediate',
        duration: '25 minutes'
      },
      {
        title: 'Performance Optimization',
        url: '/tutorials/dom-performance',
        difficulty: 'advanced',
        duration: '30 minutes'
      }
    ],

    references: [
      {
        title: 'MDN DOM API Reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model',
        type: 'external'
      },
      {
        title: 'CSS Selector Specification',
        url: 'https://www.w3.org/TR/selectors-4/',
        type: 'external'
      },
      {
        title: 'Web Performance Guidelines',
        url: 'https://web.dev/performance/',
        type: 'external'
      }
    ]
  },

  // Educational content structure
  curriculum: {
    sections: [
      {
        id: 'tree-basics',
        title: 'DOM Tree Fundamentals',
        description: 'Learn DOM structure and navigation',
        estimatedTime: '15 minutes',
        topics: [
          'DOM hierarchy and relationships',
          'Element types and node properties',
          'Tree traversal methods',
          'Parent-child relationships'
        ]
      },
      {
        id: 'element-manipulation',
        title: 'Element Manipulation',
        description: 'Master element creation and modification',
        estimatedTime: '20 minutes',
        topics: [
          'Creating and inserting elements',
          'Modifying element content',
          'Working with attributes',
          'Styling elements programmatically'
        ]
      },
      {
        id: 'selector-mastery',
        title: 'CSS Selector Mastery',
        description: 'Optimize CSS selectors for performance',
        estimatedTime: '15 minutes',
        topics: [
          'Selector specificity and performance',
          'Advanced selector patterns',
          'Query optimization techniques',
          'Debugging selector issues'
        ]
      },
      {
        id: 'advanced-topics',
        title: 'Advanced DOM Techniques',
        description: 'Explore modern DOM APIs and patterns',
        estimatedTime: '10 minutes',
        topics: [
          'Mutation Observer API',
          'Shadow DOM basics',
          'Performance best practices',
          'Accessibility considerations'
        ]
      }
    ],

    totalSections: 4,
    totalTopics: 16,
    practicalExercises: 12,
    codeExamples: 25
  },

  // Technical specifications
  technical: {
    // Supported browser APIs
    requiredAPIs: [
      'document.querySelector',
      'document.querySelectorAll',
      'Element.getAttribute',
      'Element.setAttribute',
      'MutationObserver',
      'getComputedStyle'
    ],

    // Browser compatibility
    browserSupport: {
      chrome: '60+',
      firefox: '55+',
      safari: '12+',
      edge: '79+'
    },

    // Performance considerations
    performance: {
      memoryUsage: 'moderate',
      cpuIntensive: false,
      renderingImpact: 'low',
      recommendations: [
        'Use event delegation for large DOM trees',
        'Batch DOM modifications for better performance',
        'Cache selector results when possible'
      ]
    }
  },

  // User interface configuration
  ui: {
    layout: 'three-panel',
    primaryColor: '#2c5282',
    accentColor: '#3182ce',

    panels: {
      sidebar: {
        title: 'DOM Tree & Info',
        width: '300px',
        resizable: true,
        collapsible: true
      },
      main: {
        title: 'Interactive Tools',
        minWidth: '500px',
        tabs: ['Tree Editor', 'Attributes', 'Selectors', 'Styles', 'Observer']
      },
      demo: {
        title: 'Live Demo Area',
        width: '300px',
        resizable: true,
        collapsible: true
      }
    },

    toolbar: {
      position: 'top',
      items: ['reset', 'export', 'settings', 'help']
    }
  },

  // Assessment and progress tracking
  assessment: {
    type: 'practical',

    challenges: [
      {
        id: 'tree-navigation',
        title: 'DOM Tree Navigation',
        description:
          'Navigate through a complex DOM structure using various methods',
        difficulty: 'beginner',
        points: 100,
        timeLimit: '10 minutes'
      },
      {
        id: 'attribute-manipulation',
        title: 'Attribute Master',
        description:
          'Manipulate element attributes to achieve specific styling goals',
        difficulty: 'intermediate',
        points: 150,
        timeLimit: '15 minutes'
      },
      {
        id: 'selector-optimization',
        title: 'Selector Performance',
        description: 'Optimize slow CSS selectors for better performance',
        difficulty: 'advanced',
        points: 200,
        timeLimit: '20 minutes'
      }
    ],

    totalPoints: 450,
    passingScore: 70,

    rubric: {
      Understanding: 'Demonstrates comprehension of DOM concepts',
      Application: 'Correctly applies DOM manipulation techniques',
      Optimization: 'Shows awareness of performance considerations',
      'Best Practices': 'Follows modern DOM manipulation patterns'
    }
  },

  // Integration points with other modules
  integration: {
    // Modules that enhance this module
    enhancedBy: ['events', 'performance'],

    // Modules this module enhances
    enhances: ['boxmodel', 'learning'],

    // Shared concepts and data
    sharedConcepts: [
      'element selection',
      'event targeting',
      'performance monitoring',
      'accessibility principles'
    ],

    // Cross-module communication
    eventTypes: [
      'dom:element-selected',
      'dom:tree-updated',
      'dom:selector-tested',
      'dom:attribute-changed'
    ]
  }
};

/**
 * Module configuration presets for different use cases
 */
export const modulePresets = {
  // Beginner-friendly preset
  beginner: {
    enableAnimation: true,
    showHints: true,
    autoComplete: true,
    performanceMode: false,
    complexityLevel: 'basic',
    features: {
      treeVisualization: true,
      attributeInspection: true,
      selectorTesting: true,
      styleComputation: false,
      mutationObserving: false
    }
  },

  // Standard learning preset
  standard: {
    enableAnimation: true,
    showHints: true,
    autoComplete: true,
    performanceMode: false,
    complexityLevel: 'intermediate',
    features: {
      treeVisualization: true,
      attributeInspection: true,
      selectorTesting: true,
      styleComputation: true,
      mutationObserving: true
    }
  },

  // Advanced/developer preset
  advanced: {
    enableAnimation: false,
    showHints: false,
    autoComplete: false,
    performanceMode: true,
    complexityLevel: 'advanced',
    features: {
      treeVisualization: true,
      attributeInspection: true,
      selectorTesting: true,
      styleComputation: true,
      mutationObserving: true,
      performanceMonitoring: true,
      accessibilityAnalysis: true
    }
  },

  // Performance-focused preset
  performance: {
    enableAnimation: false,
    showPerformanceMetrics: true,
    enableProfiling: true,
    optimizationSuggestions: true,
    features: {
      selectorTesting: true,
      performanceMonitoring: true,
      codeGeneration: true
    }
  }
};

/**
 * Get recommended learning path after completing DOM Module
 * @returns {Array} Array of recommended module names
 */
export function getRecommendedNextModules() {
  return [
    'boxmodel', // CSS layout builds on DOM understanding
    'performance', // Performance optimization extends DOM knowledge
    'learning', // Advanced challenges using DOM concepts
    'events' // Event handling complements DOM manipulation
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
        : ["You're ready to start the DOM Module!"]
  };
}

/**
 * Get module learning path information
 * @returns {Object} Learning path details
 */
export function getLearningPath() {
  return {
    currentModule: 'dom',
    position: 3, // Third in the recommended sequence
    totalModules: 6,
    estimatedProgress: '50%',
    skillLevel: 'Intermediate',
    nextRecommended: 'boxmodel',
    previousRecommended: 'events'
  };
}

/**
 * Generate module completion certificate data
 * @param {Object} userProgress - User's progress data
 * @returns {Object} Certificate data
 */
export function generateCompletionCertificate(userProgress) {
  const completionDate = new Date().toISOString();
  const totalScore =
    userProgress.challenges?.reduce(
      (sum, challenge) => sum + (challenge.score || 0),
      0
    ) || 0;
  const maxScore = moduleMetadata.assessment.totalPoints;
  const percentage = Math.round((totalScore / maxScore) * 100);

  return {
    module: moduleMetadata.name,
    title: moduleMetadata.title,
    completionDate,
    score: {
      earned: totalScore,
      possible: maxScore,
      percentage
    },
    achievements: userProgress.achievements || [],
    timeSpent: userProgress.timeSpent || 0,
    certificateId: `DOM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
}

/**
 * Export sample code snippets for documentation and examples
 */
export const codeExamples = {
  // Basic DOM manipulation
  basicManipulation: `
// Create and insert new element
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello, DOM!';
newDiv.className = 'dynamic-content';

// Set attributes
newDiv.setAttribute('data-created', Date.now());
newDiv.setAttribute('role', 'presentation');

// Insert into document
const container = document.querySelector('#content');
container.appendChild(newDiv);

// Modify existing elements
const existingElement = document.querySelector('.target');
existingElement.style.backgroundColor = '#e3f2fd';
existingElement.classList.add('highlighted');
`,

  // Advanced selector usage
  advancedSelectors: `
// Performance-optimized selectors
const optimizedQuery = document.querySelector('#specific-id .target-class');

// Attribute selectors
const inputElements = document.querySelectorAll('input[type="text"]:not([disabled])');

// Pseudo-class combinations
const oddListItems = document.querySelectorAll('li:nth-child(odd):not(.excluded)');

// Performance comparison
console.time('Specific selector');
document.querySelectorAll('#container > .item');
console.timeEnd('Specific selector');

console.time('General selector');
document.querySelectorAll('.item');
console.timeEnd('General selector');
`,

  // Attribute manipulation patterns
  attributeManipulation: `
// Safe attribute checking and setting
function safeSetAttribute(element, name, value) {
  if (element && element.setAttribute) {
    element.setAttribute(name, value);
    return true;
  }
  return false;
}

// Batch attribute updates
function updateAttributes(element, attributes) {
  Object.entries(attributes).forEach(([name, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  });
}

// Usage example
const targetElement = document.querySelector('.target');
updateAttributes(targetElement, {
  'data-status': 'active',
  'aria-label': 'Interactive element',
  'class': 'target active',
  'hidden': null // This will remove the attribute
});
`,

  // DOM tree traversal
  treeTraversal: `
// Recursive tree traversal
function traverseDOM(node, callback, depth = 0) {
  callback(node, depth);

  for (const child of node.children) {
    traverseDOM(child, callback, depth + 1);
  }
}

// Find elements by complex criteria
function findElementsByCriteria(root, criteria) {
  const results = [];

  traverseDOM(root, (element) => {
    if (criteria.tagName && element.tagName !== criteria.tagName.toUpperCase()) {
      return;
    }

    if (criteria.hasAttribute && !element.hasAttribute(criteria.hasAttribute)) {
      return;
    }

    if (criteria.textContent && !element.textContent.includes(criteria.textContent)) {
      return;
    }

    results.push(element);
  });

  return results;
}

// Usage
const matches = findElementsByCriteria(document.body, {
  tagName: 'div',
  hasAttribute: 'data-component',
  textContent: 'Important'
});
`,

  // Mutation Observer implementation
  mutationObserver: `
// Comprehensive DOM change monitoring
class DOMChangeMonitor {
  constructor(targetElement, options = {}) {
    this.target = targetElement;
    this.options = {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      subtree: true,
      ...options
    };

    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.changeLog = [];
  }

  start() {
    this.observer.observe(this.target, this.options);
    console.log('DOM monitoring started');
  }

  stop() {
    this.observer.disconnect();
    console.log('DOM monitoring stopped');
  }

  handleMutations(mutations) {
    mutations.forEach(mutation => {
      const change = {
        type: mutation.type,
        target: mutation.target.tagName.toLowerCase(),
        timestamp: Date.now()
      };

      switch (mutation.type) {
        case 'childList':
          change.addedNodes = mutation.addedNodes.length;
          change.removedNodes = mutation.removedNodes.length;
          break;

        case 'attributes':
          change.attributeName = mutation.attributeName;
          change.oldValue = mutation.oldValue;
          change.newValue = mutation.target.getAttribute(mutation.attributeName);
          break;

        case 'characterData':
          change.oldValue = mutation.oldValue;
          change.newValue = mutation.target.textContent;
          break;
      }

      this.changeLog.push(change);
      this.onMutation(change);
    });
  }

  onMutation(change) {
    console.log('DOM change detected:', change);
  }

  getChangeHistory() {
    return [...this.changeLog];
  }
}

// Usage
const monitor = new DOMChangeMonitor(document.querySelector('#app'));
monitor.start();
`
};

/**
 * Export utility functions for module integration
 */
export const moduleUtils = {
  /**
   * Initialize module with custom configuration
   * @param {HTMLElement} container - Container element
   * @param {Object} config - Configuration options
   * @returns {DOMModule} Module instance
   */
  create: (container, config = {}) => {
    const moduleConfig = {
      ...modulePresets.standard,
      ...config
    };

    return new DOMModule(container, moduleConfig);
  },

  /**
   * Get module statistics and analytics
   * @param {DOMModule} moduleInstance - Module instance
   * @returns {Object} Module statistics
   */
  getStatistics: moduleInstance => {
    return {
      performanceMetrics: moduleInstance.performanceMetrics,
      interactionCount: moduleInstance.state.changeHistory.length,
      activeComponent: moduleInstance.state.currentTool,
      sessionDuration: Date.now() - moduleInstance.sessionStartTime
    };
  },

  /**
   * Export module state for persistence
   * @param {DOMModule} moduleInstance - Module instance
   * @returns {Object} Serializable state
   */
  exportState: moduleInstance => {
    return {
      currentTool: moduleInstance.state.currentTool,
      selectedElement: null, // Cannot serialize DOM elements
      changeHistory: moduleInstance.state.changeHistory,
      performanceMetrics: moduleInstance.performanceMetrics,
      timestamp: Date.now()
    };
  },

  /**
   * Import module state from persistence
   * @param {DOMModule} moduleInstance - Module instance
   * @param {Object} state - Previously exported state
   */
  importState: (moduleInstance, state) => {
    if (state.currentTool) {
      moduleInstance.switchTool(state.currentTool);
    }

    if (state.changeHistory) {
      moduleInstance.state.changeHistory = [...state.changeHistory];
    }

    if (state.performanceMetrics) {
      Object.assign(
        moduleInstance.performanceMetrics,
        state.performanceMetrics
      );
    }
  }
};

// Export individual components
export {
  DOMModule,
  NodeTreeEditor,
  AttributeInspector,
  SelectorTester,
  StyleComputer,
  DOMDiffer,
  ElementManipulator,
  TreeTraverser,
  MutationObserverDemo
};

// Default export for module
export default {
  // Core module
  DOMModule,

  // Components
  NodeTreeEditor,
  AttributeInspector,
  SelectorTester,
  StyleComputer,
  DOMDiffer,
  ElementManipulator,
  TreeTraverser,
  MutationObserverDemo,

  // Metadata and utilities
  metadata: moduleMetadata,

  // Convenience methods
  create: moduleMetadata.utils.createInstance.bind(moduleMetadata),
  getLearningPath: moduleMetadata.utils.getLearningPath.bind(moduleMetadata),
  validateConfig: moduleMetadata.utils.validateConfig.bind(moduleMetadata),
  getComponent: moduleMetadata.utils.getComponent.bind(moduleMetadata)
};

// Export module registration function for main application
export function registerModule(moduleRegistry) {
  moduleRegistry.register({
    ...moduleMetadata,
    moduleClass: DOMModule,
    presets: modulePresets,
    utils: moduleUtils
  });

  console.log(
    `📋 DOM Module registered: ${moduleMetadata.title} v${moduleMetadata.version}`
  );
}
