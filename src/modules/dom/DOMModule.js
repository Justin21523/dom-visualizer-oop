/**
 * DOM Module - Interactive DOM Manipulation and Analysis Learning Tool
 *
 * This module provides comprehensive tools for learning DOM manipulation,
 * including tree visualization, attribute inspection, selector testing,
 * and real-time DOM analysis.
 *
 * @fileoverview Main controller for the DOM learning module
 * @version 1.0.0
 * @author DOM Visualizer OOP Team
 */

import { NodeTreeEditor } from './NodeTreeEditor.js';
import { AttributeInspector } from './AttributeInspector.js';
import { SelectorTester } from './SelectorTester.js';
import { StyleComputer } from './StyleComputer.js';
import { DOMDiffer } from './DOMDiffer.js';
import { ElementManipulator } from './ElementManipulator.js';
import { TreeTraverser } from './TreeTraverser.js';
import { MutationObserverDemo } from './MutationObserverDemo.js';

/**
 * DOM Module main controller class
 * Manages all DOM manipulation and analysis tools
 */
export class DOMModule {
  /**
   * Run selector testing example
   */
  runSelectorTestingExample() {
    const results = [];

    // Test various selectors
    const selectors = [
      '#demo-header',
      '.nav-link',
      '.nav-link.active',
      'article[data-article-id]',
      '.demo-main > *',
      '.widget-item:nth-child(2n)'
    ];

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        results.push({
          selector,
          count: elements.length,
          elements: Array.from(elements).map(el => el.tagName.toLowerCase())
        });

        // Highlight found elements
        elements.forEach(el => this.highlightElement(el, 'selector-match'));

        this.updatePerformanceMetrics('selectorQueries');
      } catch (error) {
        results.push({
          selector,
          error: error.message
        });
      }
    });

    console.log('🎯 Selector testing results:', results);
    return results;
  }

  /**
   * Run style manipulation example
   */
  runStyleManipulationExample() {
    const elements = this.container.querySelectorAll('.demo-element, .nav-link');

    elements.forEach((element, index) => {
      // Apply different styles
      const colors = ['#ffebee', '#e8f5e8', '#fff3e0', '#f3e5f5'];
      const color = colors[index % colors.length];

      element.style.backgroundColor = color;
      element.style.transition = 'all 0.3s ease';
      element.style.transform = `translateY(${Math.sin(index) * 5}px)`;

      // Add hover effects
      element.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) translateY(0)';
      });

      element.addEventListener('mouseleave', function() {
        this.style.transform = `translateY(${Math.sin(index) * 5}px)`;
      });

      this.updatePerformanceMetrics('styleComputations');
    });

    console.log('🎨 Style manipulation example executed');
  }

  /**
   * Run DOM traversal example
   */
  runDOMTraversalExample() {
    const startElement = this.container.querySelector('.demo-article');

    if (!startElement) {
      console.warn('Start element not found for traversal example');
      return;
    }

    const traversalData = {
      current: startElement.tagName.toLowerCase(),
      parent: startElement.parentElement?.tagName.toLowerCase(),
      children: Array.from(startElement.children).map(child => ({
        tag: child.tagName.toLowerCase(),
        class: child.className,
        id: child.id
      })),
      siblings: [],
      nextSibling: startElement.nextElementSibling?.tagName.toLowerCase(),
      previousSibling: startElement.previousElementSibling?.tagName.toLowerCase()
    };

    // Get all siblings
    let sibling = startElement.parentElement?.firstElementChild;
    while (sibling) {
      if (sibling !== startElement) {
        traversalData.siblings.push({
          tag: sibling.tagName.toLowerCase(),
          class: sibling.className,
          id: sibling.id
        });
      }
      sibling = sibling.nextElementSibling;
    }

    // Highlight traversal path
    this.highlightElement(startElement, 'traversal-current');
    if (startElement.parentElement) {
      this.highlightElement(startElement.parentElement, 'traversal-parent');
    }

    console.log('🌐 DOM traversal example results:', traversalData);
    return traversalData;
  }

  /**
   * Highlight an element with visual feedback
   * @param {HTMLElement} element - Element to highlight
   * @param {string} type - Type of highlight
   */
  highlightElement(element, type = 'default') {
    const existingHighlight = element.querySelector('.element-highlight');
    if (existingHighlight) {
      existingHighlight.remove();
    }

    const highlight = document.createElement('div');
    highlight.className = `element-highlight highlight-${type}`;
    highlight.innerHTML = `
      <div class="highlight-label">${type.replace('-', ' ')}</div>
      <div class="highlight-border"></div>
    `;

    element.style.position = 'relative';
    element.appendChild(highlight);

    // Remove highlight after animation
    setTimeout(() => {
      if (highlight.parentElement) {
        highlight.remove();
      }
    }, 2000);
  }

  /**
   * Switch documentation tabs
   * @param {string} tabName - Name of the tab to show
   */
  switchDocsTab(tabName) {
    // Update tab states
    const docsTabs = this.container.querySelectorAll('.docs-tab');
    docsTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update panel visibility
    const docsPanels = this.container.querySelectorAll('.docs-panel');
    docsPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-content`);
    });

    // Load content if needed
    this.loadDocsContent(tabName);
  }

  /**
   * Load documentation content
   * @param {string} tabName - Name of the tab content to load
   */
  loadDocsContent(tabName) {
    const contentMap = {
      reference: this.loadAPIReference.bind(this),
      'best-practices': this.loadBestPractices.bind(this)
    };

    const loader = contentMap[tabName];
    if (loader) {
      loader();
    }
  }

  /**
   * Load DOM API reference content
   */
  loadAPIReference() {
    const referenceContainer = this.container.querySelector('#reference-content');

    referenceContainer.innerHTML = `
      <div class="api-reference">
        <section class="api-section">
          <h4>Element Selection</h4>
          <div class="api-methods">
            <div class="api-method">
              <code>document.getElementById(id)</code>
              <p>Returns element with specified ID</p>
            </div>
            <div class="api-method">
              <code>document.querySelector(selector)</code>
              <p>Returns first element matching CSS selector</p>
            </div>
            <div class="api-method">
              <code>document.querySelectorAll(selector)</code>
              <p>Returns all elements matching CSS selector</p>
            </div>
          </div>
        </section>

        <section class="api-section">
          <h4>Element Creation & Manipulation</h4>
          <div class="api-methods">
            <div class="api-method">
              <code>document.createElement(tagName)</code>
              <p>Creates new element with specified tag name</p>
            </div>
            <div class="api-method">
              <code>element.appendChild(child)</code>
              <p>Adds child element to end of children list</p>
            </div>
            <div class="api-method">
              <code>element.insertBefore(newNode, referenceNode)</code>
              <p>Inserts new node before reference node</p>
            </div>
            <div class="api-method">
              <code>element.removeChild(child)</code>
              <p>Removes child element from parent</p>
            </div>
          </div>
        </section>

        <section class="api-section">
          <h4>Attributes & Properties</h4>
          <div class="api-methods">
            <div class="api-method">
              <code>element.getAttribute(name)</code>
              <p>Gets value of specified attribute</p>
            </div>
            <div class="api-method">
              <code>element.setAttribute(name, value)</code>
              <p>Sets value of specified attribute</p>
            </div>
            <div class="api-method">
              <code>element.hasAttribute(name)</code>
              <p>Checks if element has specified attribute</p>
            </div>
            <div class="api-method">
              <code>element.removeAttribute(name)</code>
              <p>Removes specified attribute from element</p>
            </div>
          </div>
        </section>

        <section class="api-section">
          <h4>CSS Classes & Styles</h4>
          <div class="api-methods">
            <div class="api-method">
              <code>element.classList.add(className)</code>
              <p>Adds CSS class to element</p>
            </div>
            <div class="api-method">
              <code>element.classList.remove(className)</code>
              <p>Removes CSS class from element</p>
            </div>
            <div class="api-method">
              <code>element.classList.toggle(className)</code>
              <p>Toggles CSS class on element</p>
            </div>
            <div class="api-method">
              <code>window.getComputedStyle(element)</code>
              <p>Returns computed CSS styles for element</p>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  /**
   * Load best practices content
   */
  loadBestPractices() {
    const practicesContainer = this.container.querySelector('#best-practices-content');

    practicesContainer.innerHTML = `
      <div class="best-practices">
        <section class="practice-section">
          <h4>🚀 Performance Best Practices</h4>
          <ul class="practice-list">
            <li>
              <strong>Minimize DOM queries:</strong> Cache element references instead of repeatedly querying
              <code>const element = document.querySelector('.my-element');</code>
            </li>
            <li>
              <strong>Use document fragments:</strong> For multiple insertions, use DocumentFragment to reduce reflows
              <code>const fragment = document.createDocumentFragment();</code>
            </li>
            <li>
              <strong>Batch DOM updates:</strong> Group style changes together to minimize layout thrashing
            </li>
            <li>
              <strong>Use event delegation:</strong> Attach event listeners to parent elements instead of individual children
            </li>
          </ul>
        </section>

        <section class="practice-section">
          <h4>🔒 Security Best Practices</h4>
          <ul class="practice-list">
            <li>
              <strong>Sanitize user input:</strong> Always validate and sanitize data before inserting into DOM
            </li>
            <li>
              <strong>Use textContent over innerHTML:</strong> Prevents XSS attacks when setting text content
              <code>element.textContent = userInput; // Safe</code>
            </li>
            <li>
              <strong>Validate selectors:</strong> Check selector validity before using in queries
            </li>
          </ul>
        </section>

        <section class="practice-section">
          <h4>♿ Accessibility Best Practices</h4>
          <ul class="practice-list">
            <li>
              <strong>Use semantic HTML:</strong> Choose appropriate HTML elements for their meaning
            </li>
            <li>
              <strong>Maintain focus management:</strong> Ensure keyboard navigation works properly
            </li>
            <li>
              <strong>Provide ARIA attributes:</strong> Use ARIA labels and roles for screen readers
              <code>element.setAttribute('aria-label', 'Description');</code>
            </li>
            <li>
              <strong>Test with screen readers:</strong> Verify your DOM manipulations work with assistive technology
            </li>
          </ul>
        </section>

        <section class="practice-section">
          <h4>🧹 Code Quality Best Practices</h4>
          <ul class="practice-list">
            <li>
              <strong>Use meaningful variable names:</strong> Make your code self-documenting
              <code>const navigationElement = document.querySelector('.nav');</code>
            </li>
            <li>
              <strong>Handle errors gracefully:</strong> Check if elements exist before manipulating them
              <code>if (element) { element.style.display = 'block'; }</code>
            </li>
            <li>
              <strong>Use modern APIs:</strong> Prefer newer DOM APIs like classList over className manipulation
            </li>
            <li>
              <strong>Comment complex operations:</strong> Explain why you're doing something, not just what
            </li>
          </ul>
        </section>
      </div>
    `;
  }

  /**
   * Update all performance metric displays
   */
  updateAllPerformanceDisplays() {
    Object.keys(this.performanceMetrics).forEach(metric => {
      this.updatePerformanceMetrics(metric);
    });
  }

  /**
   * Handle DOM changes from components
   * @param {Object} changeDetails - Details about the DOM change
   */
  handleDOMChange(changeDetails) {
    // Record change in history
    this.state.changeHistory.push({
      timestamp: Date.now(),
      type: changeDetails.type,
      target: changeDetails.target,
      details: changeDetails
    });

    // Update tree view if it's active
    const treeEditor = this.components.get('treeEditor');
    if (treeEditor && typeof treeEditor.refreshTree === 'function') {
      treeEditor.refreshTree();
    }

    // Notify mutation observer
    const mutationObserver = this.components.get('mutationObserver');
    if (mutationObserver && typeof mutationObserver.recordChange === 'function') {
      mutationObserver.recordChange(changeDetails);
    }
  }

  /**
   * Add event listener with automatic cleanup
   * @param {string} eventType - Type of event
   * @param {Function} handler - Event handler function
   */
  addEventListener(eventType, handler) {
    this.container.addEventListener(eventType, handler);

    // Store for cleanup
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  /**
   * Dispatch custom event
   * @param {string} eventType - Type of event to dispatch
   * @param {Object} detail - Event detail data
   */
  dispatchEvent(eventType, detail = {}) {
    const event = new CustomEvent(eventType, { detail });
    this.container.dispatchEvent(event);
  }

  /**
   * Inspect selected element (placeholder for integration with inspector tool)
   */
  inspectElement() {
    if (this.state.selectedElement) {
      this.switchTool('attribute-inspector');
      const inspector = this.components.get('attributeInspector');
      if (inspector && typeof inspector.inspect === 'function') {
        inspector.inspect(this.state.selectedElement);
      }
    }
  }

  /**
   * Edit selected element (placeholder for integration with editor tool)
   */
  editElement() {
    if (this.state.selectedElement) {
      this.switchTool('tree-editor');
      const editor = this.components.get('treeEditor');
      if (editor && typeof editor.editElement === 'function') {
        editor.editElement(this.state.selectedElement);
      }
    }
  }

  /**
   * Delete selected element with confirmation
   */
  deleteElement() {
    if (!this.state.selectedElement) return;

    const element = this.state.selectedElement;
    const elementDescription = `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className.split(' ').join('.') : ''}`;

    if (confirm(`Delete element ${elementDescription}?`)) {
      const parent = element.parentElement;
      if (parent) {
        parent.removeChild(element);
        this.state.selectedElement = null;
        this.updateElementInfo(null);
        this.updatePerformanceMetrics('domOperations');

        // Emit deletion event
        this.dispatchEvent('dom:changed', {
          type: 'delete',
          target: elementDescription,
          parent: parent.tagName.toLowerCase()
        });

        console.log(`🗑️ Deleted element: ${elementDescription}`);
      }
    }
  }

  /**
   * Activate the module
   */
  activate() {
    this.isActive = true;
    this.container.style.display = 'block';

    // Activate current tool
    this.activateComponent(this.state.currentTool);

    // Reset metrics
    this.updateAllPerformanceDisplays();

    console.log('🌳 DOM Module activated');
  }

  /**
   * Deactivate the module
   */
  deactivate() {
    this.isActive = false;
    this.container.style.display = 'none';

    // Deactivate all components
    this.components.forEach((component) => {
      if (typeof component.deactivate === 'function') {
        component.deactivate();
      }
    });

    console.log('🌳 DOM Module deactivated');
  }

  /**
   * Clean up module resources
   */
  destroy() {
    // Remove event listeners
    this.eventHandlers.forEach((handlers, eventType) => {
      handlers.forEach(handler => {
        this.container.removeEventListener(eventType, handler);
      });
    });
    this.eventHandlers.clear();

    // Destroy all components
    this.components.forEach((component) => {
      if (typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components.clear();

    // Clear demo elements
    this.demoElements.clear();

    // Clear container
    this.container.innerHTML = '';

    console.log('🌳 DOM Module destroyed');
  }
}

// Make DOM Module available globally for demo purposes
if (typeof window !== 'undefined') {
  window.DOMModule = DOMModule;
} /* Create a new DOM Module instance
   * @param {HTMLElement} container - The container element for the module
   * @param {Object} config - Configuration options
   */
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      enableLiveDemo: true,
      showCodeExamples: true,
      enableMutationTracking: true,
      maxTreeDepth: 10,
      highlightChanges: true,
      animationSpeed: 'medium',
      ...config
    };

    // Module state
    this.isActive = false;
    this.components = new Map();
    this.demoElements = new Map();
    this.state = {
      selectedElement: null,
      currentTool: 'tree-editor',
      treeData: null,
      changeHistory: [],
      filters: {
        elementType: 'all',
        hasAttributes: false,
        hasChildren: false
      }
    };

    // Event handlers
    this.eventHandlers = new Map();

    // Performance tracking
    this.performanceMetrics = {
      domOperations: 0,
      selectorQueries: 0,
      styleComputations: 0,
      mutationEvents: 0
    };

    this.initialize();
  }

  /**
   * Initialize the DOM module
   * @private
   */
  initialize() {
    try {
      this.createModuleStructure();
      this.initializeComponents();
      this.setupEventListeners();
      this.loadDemoContent();

      console.log('🌳 DOM Module initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DOM Module:', error);
      this.showError('Initialization failed. Please refresh the page.');
    }
  }

  /**
   * Create the main module structure
   * @private
   */
  createModuleStructure() {
    this.container.innerHTML = `
      <div class="dom-module">
        <header class="dom-module__header">
          <div class="dom-module__title">
            <h2>🌳 DOM Manipulation & Analysis</h2>
            <p>Learn to manipulate and analyze the Document Object Model</p>
          </div>

          <div class="dom-module__controls">
            <div class="tool-selector">
              <button class="tool-button active" data-tool="tree-editor">
                <span class="icon">🌲</span>
                Tree Editor
              </button>
              <button class="tool-button" data-tool="attribute-inspector">
                <span class="icon">🔍</span>
                Attributes
              </button>
              <button class="tool-button" data-tool="selector-tester">
                <span class="icon">🎯</span>
                Selectors
              </button>
              <button class="tool-button" data-tool="style-computer">
                <span class="icon">🎨</span>
                Styles
              </button>
              <button class="tool-button" data-tool="mutation-observer">
                <span class="icon">👁️</span>
                Observer
              </button>
            </div>

            <div class="module-actions">
              <button class="action-button" id="reset-demo">
                <span class="icon">🔄</span>
                Reset
              </button>
              <button class="action-button" id="export-code">
                <span class="icon">📋</span>
                Export
              </button>
            </div>
          </div>
        </header>

        <main class="dom-module__content">
          <div class="dom-workspace">
            <aside class="dom-sidebar">
              <div class="sidebar-section">
                <h3>DOM Tree Structure</h3>
                <div id="tree-container" class="tree-container">
                  <!-- Tree visualization will be rendered here -->
                </div>
              </div>

              <div class="sidebar-section">
                <h3>Element Information</h3>
                <div id="element-info" class="element-info">
                  <p class="info-placeholder">Select an element to view details</p>
                </div>
              </div>
            </aside>

            <section class="dom-main-panel">
              <!-- Tool-specific content panels -->
              <div id="tree-editor-panel" class="tool-panel active">
                <div class="panel-header">
                  <h3>DOM Tree Editor</h3>
                  <p>Interactive DOM tree manipulation and visualization</p>
                </div>
                <div id="tree-editor-content" class="panel-content">
                  <!-- NodeTreeEditor component will be mounted here -->
                </div>
              </div>

              <div id="attribute-inspector-panel" class="tool-panel">
                <div class="panel-header">
                  <h3>Attribute Inspector</h3>
                  <p>Examine and modify element attributes in real-time</p>
                </div>
                <div id="attribute-inspector-content" class="panel-content">
                  <!-- AttributeInspector component will be mounted here -->
                </div>
              </div>

              <div id="selector-tester-panel" class="tool-panel">
                <div class="panel-header">
                  <h3>CSS Selector Tester</h3>
                  <p>Test and learn CSS selectors with live feedback</p>
                </div>
                <div id="selector-tester-content" class="panel-content">
                  <!-- SelectorTester component will be mounted here -->
                </div>
              </div>

              <div id="style-computer-panel" class="tool-panel">
                <div class="panel-header">
                  <h3>Computed Styles Analyzer</h3>
                  <p>Explore how CSS properties are computed by the browser</p>
                </div>
                <div id="style-computer-content" class="panel-content">
                  <!-- StyleComputer component will be mounted here -->
                </div>
              </div>

              <div id="mutation-observer-panel" class="tool-panel">
                <div class="panel-header">
                  <h3>Mutation Observer Demo</h3>
                  <p>Watch DOM changes in real-time using Mutation Observer API</p>
                </div>
                <div id="mutation-observer-content" class="panel-content">
                  <!-- MutationObserverDemo component will be mounted here -->
                </div>
              </div>
            </section>

            <aside class="dom-demo-area">
              <div class="demo-section">
                <h3>Live Demo Area</h3>
                <div id="demo-container" class="demo-container">
                  <!-- Dynamic demo content will be created here -->
                </div>
              </div>

              <div class="demo-section">
                <h3>Performance Metrics</h3>
                <div id="performance-display" class="performance-display">
                  <div class="metric">
                    <label>DOM Operations:</label>
                    <span id="dom-ops-count">0</span>
                  </div>
                  <div class="metric">
                    <label>Selector Queries:</label>
                    <span id="selector-count">0</span>
                  </div>
                  <div class="metric">
                    <label>Style Computations:</label>
                    <span id="style-count">0</span>
                  </div>
                  <div class="metric">
                    <label>Mutations Detected:</label>
                    <span id="mutation-count">0</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <!-- Code examples and documentation -->
          <div class="dom-documentation">
            <div class="docs-tabs">
              <button class="docs-tab active" data-tab="examples">Code Examples</button>
              <button class="docs-tab" data-tab="reference">DOM API Reference</button>
              <button class="docs-tab" data-tab="best-practices">Best Practices</button>
            </div>

            <div class="docs-content">
              <div id="examples-content" class="docs-panel active">
                <div class="code-example">
                  <h4>Basic Element Manipulation</h4>
                  <pre><code id="basic-manipulation-code">
// Create new element
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello, DOM!';
newDiv.className = 'demo-element';

// Insert into document
const parent = document.querySelector('#demo-container');
parent.appendChild(newDiv);

// Modify attributes
newDiv.setAttribute('data-created', Date.now());
newDiv.style.backgroundColor = '#e3f2fd';
                  </code></pre>
                  <button class="run-example-btn" data-example="basic-manipulation">Run Example</button>
                </div>
              </div>

              <div id="reference-content" class="docs-panel">
                <!-- DOM API reference will be loaded here -->
              </div>

              <div id="best-practices-content" class="docs-panel">
                <!-- Best practices content will be loaded here -->
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  /**
   * Initialize all module components
   * @private
   */
  initializeComponents() {
    // Initialize tree editor
    const treeEditorContainer = this.container.querySelector('#tree-editor-content');
    this.components.set('treeEditor', new NodeTreeEditor(treeEditorContainer, {
      maxDepth: this.config.maxTreeDepth,
      enableDragDrop: true,
      showNodeDetails: true
    }));

    // Initialize attribute inspector
    const attributeInspectorContainer = this.container.querySelector('#attribute-inspector-content');
    this.components.set('attributeInspector', new AttributeInspector(attributeInspectorContainer, {
      enableLiveEdit: true,
      showComputedValues: true
    }));

    // Initialize selector tester
    const selectorTesterContainer = this.container.querySelector('#selector-tester-content');
    this.components.set('selectorTester', new SelectorTester(selectorTesterContainer, {
      enableHighlighting: true,
      showQueryStats: true
    }));

    // Initialize style computer
    const styleComputerContainer = this.container.querySelector('#style-computer-content');
    this.components.set('styleComputer', new StyleComputer(styleComputerContainer, {
      showInheritance: true,
      groupByCategory: true
    }));

    // Initialize mutation observer demo
    const mutationObserverContainer = this.container.querySelector('#mutation-observer-content');
    this.components.set('mutationObserver', new MutationObserverDemo(mutationObserverContainer, {
      trackAllChanges: true,
      showChangeDetails: true
    }));

    // Initialize helper components
    this.components.set('domDiffer', new DOMDiffer());
    this.components.set('elementManipulator', new ElementManipulator());
    this.components.set('treeTraverser', new TreeTraverser());
  }

  /**
   * Set up event listeners for module interactions
   * @private
   */
  setupEventListeners() {
    // Tool selection
    const toolButtons = this.container.querySelectorAll('.tool-button');
    toolButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        this.switchTool(event.target.closest('.tool-button').dataset.tool);
      });
    });

    // Module actions
    const resetButton = this.container.querySelector('#reset-demo');
    resetButton?.addEventListener('click', () => this.resetDemo());

    const exportButton = this.container.querySelector('#export-code');
    exportButton?.addEventListener('click', () => this.exportGeneratedCode());

    // Documentation tabs
    const docsTabs = this.container.querySelectorAll('.docs-tab');
    docsTabs.forEach(tab => {
      tab.addEventListener('click', (event) => {
        this.switchDocsTab(event.target.dataset.tab);
      });
    });

    // Example runners
    const exampleButtons = this.container.querySelectorAll('.run-example-btn');
    exampleButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        this.runCodeExample(event.target.dataset.example);
      });
    });

    // Component events
    this.setupComponentEventListeners();
  }

  /**
   * Set up event listeners for component interactions
   * @private
   */
  setupComponentEventListeners() {
    // Listen for element selection changes
    this.addEventListener('element:selected', (event) => {
      this.handleElementSelection(event.detail.element);
    });

    // Listen for DOM changes
    this.addEventListener('dom:changed', (event) => {
      this.handleDOMChange(event.detail);
      this.updatePerformanceMetrics('domOperations');
    });

    // Listen for selector queries
    this.addEventListener('selector:query', (event) => {
      this.updatePerformanceMetrics('selectorQueries');
    });

    // Listen for style computations
    this.addEventListener('style:computed', (event) => {
      this.updatePerformanceMetrics('styleComputations');
    });
  }

  /**
   * Switch between different tools
   * @param {string} toolName - Name of the tool to activate
   */
  switchTool(toolName) {
    // Update button states
    const toolButtons = this.container.querySelectorAll('.tool-button');
    toolButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tool === toolName);
    });

    // Update panel visibility
    const toolPanels = this.container.querySelectorAll('.tool-panel');
    toolPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${toolName}-panel`);
    });

    // Update state and activate component
    this.state.currentTool = toolName;
    this.activateComponent(toolName);

    // Emit tool change event
    this.dispatchEvent('tool:changed', { tool: toolName });
  }

  /**
   * Activate a specific component
   * @param {string} toolName - Name of the tool/component to activate
   */
  activateComponent(toolName) {
    const componentMap = {
      'tree-editor': 'treeEditor',
      'attribute-inspector': 'attributeInspector',
      'selector-tester': 'selectorTester',
      'style-computer': 'styleComputer',
      'mutation-observer': 'mutationObserver'
    };

    const componentKey = componentMap[toolName];
    const component = this.components.get(componentKey);

    if (component && typeof component.activate === 'function') {
      component.activate();
    }
  }

  /**
   * Handle element selection
   * @param {HTMLElement} element - The selected element
   */
  handleElementSelection(element) {
    this.state.selectedElement = element;
    this.updateElementInfo(element);

    // Notify all components about the selection
    this.components.forEach((component) => {
      if (typeof component.setSelectedElement === 'function') {
        component.setSelectedElement(element);
      }
    });
  }

  /**
   * Update element information display
   * @param {HTMLElement} element - The element to display info for
   */
  updateElementInfo(element) {
    const infoContainer = this.container.querySelector('#element-info');

    if (!element) {
      infoContainer.innerHTML = '<p class="info-placeholder">Select an element to view details</p>';
      return;
    }

    const elementInfo = this.generateElementInfo(element);
    infoContainer.innerHTML = elementInfo;
  }

  /**
   * Generate element information HTML
   * @param {HTMLElement} element - The element to analyze
   * @returns {string} HTML string with element information
   */
  generateElementInfo(element) {
    return `
      <div class="element-details">
        <div class="element-header">
          <h4>${element.tagName.toLowerCase()}</h4>
          ${element.id ? `<span class="element-id">#${element.id}</span>` : ''}
          ${element.className ? `<span class="element-class">.${element.className.split(' ').join('.')}</span>` : ''}
        </div>

        <div class="element-properties">
          <div class="property">
            <label>Type:</label>
            <span>${element.nodeType === 1 ? 'Element' : 'Node'}</span>
          </div>
          <div class="property">
            <label>Children:</label>
            <span>${element.children.length}</span>
          </div>
          <div class="property">
            <label>Attributes:</label>
            <span>${element.attributes.length}</span>
          </div>
          <div class="property">
            <label>Text Content:</label>
            <span>${element.textContent?.substring(0, 30) || 'None'}${element.textContent?.length > 30 ? '...' : ''}</span>
          </div>
        </div>

        <div class="element-actions">
          <button class="action-btn" onclick="this.closest('.dom-module').domModule.inspectElement()">
            🔍 Inspect
          </button>
          <button class="action-btn" onclick="this.closest('.dom-module').domModule.editElement()">
            ✏️ Edit
          </button>
          <button class="action-btn" onclick="this.closest('.dom-module').domModule.deleteElement()">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Load demo content for testing
   * @private
   */
  loadDemoContent() {
    const demoContainer = this.container.querySelector('#demo-container');

    // Create sample DOM structure for demonstration
    demoContainer.innerHTML = `
      <div class="demo-content">
        <header class="demo-header" id="demo-header">
          <h3>Sample Content</h3>
          <nav class="demo-nav">
            <a href="#" class="nav-link">Home</a>
            <a href="#" class="nav-link active">About</a>
            <a href="#" class="nav-link">Contact</a>
          </nav>
        </header>

        <main class="demo-main">
          <article class="demo-article" data-article-id="1">
            <h4>Article Title</h4>
            <p class="article-content">This is sample content for DOM manipulation practice.</p>
            <div class="article-meta">
              <span class="author">Author: Demo User</span>
              <span class="date">Date: ${new Date().toLocaleDateString()}</span>
            </div>
          </article>

          <aside class="demo-sidebar">
            <div class="widget">
              <h5>Widget Title</h5>
              <ul class="widget-list">
                <li class="widget-item">Item 1</li>
                <li class="widget-item">Item 2</li>
                <li class="widget-item">Item 3</li>
              </ul>
            </div>
          </aside>
        </main>

        <footer class="demo-footer">
          <p>&copy; 2024 DOM Demo</p>
        </footer>
      </div>
    `;

    // Store reference to demo content
    this.demoElements.set('demoContainer', demoContainer);

    // Initialize tree view with demo content
    const treeEditor = this.components.get('treeEditor');
    if (treeEditor) {
      treeEditor.loadDOM(demoContainer);
    }
  }

  /**
   * Update performance metrics display
   * @param {string} metric - The metric to increment
   */
  updatePerformanceMetrics(metric) {
    if (this.performanceMetrics.hasOwnProperty(metric)) {
      this.performanceMetrics[metric]++;

      const metricMap = {
        domOperations: 'dom-ops-count',
        selectorQueries: 'selector-count',
        styleComputations: 'style-count',
        mutationEvents: 'mutation-count'
      };

      const elementId = metricMap[metric];
      const element = this.container.querySelector(`#${elementId}`);
      if (element) {
        element.textContent = this.performanceMetrics[metric];
      }
    }
  }

  /**
   * Reset the demo to initial state
   */
  resetDemo() {
    // Clear performance metrics
    Object.keys(this.performanceMetrics).forEach(key => {
      this.performanceMetrics[key] = 0;
    });
    this.updateAllPerformanceDisplays();

    // Reload demo content
    this.loadDemoContent();

    // Reset all components
    this.components.forEach((component) => {
      if (typeof component.reset === 'function') {
        component.reset();
      }
    });

    // Clear selected element
    this.state.selectedElement = null;
    this.updateElementInfo(null);

    console.log('🔄 DOM Module demo reset');
  }

  /**
   * Export generated code examples
   */
  exportGeneratedCode() {
    const code = this.generateComprehensiveCodeExample();

    // Create download link
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dom-manipulation-examples.js';
    link.click();

    URL.revokeObjectURL(url);

    console.log('📋 Code examples exported');
  }

  /**
   * Generate comprehensive code example
   * @returns {string} Generated JavaScript code
   */
  generateComprehensiveCodeExample() {
    return `/**
 * DOM Manipulation Examples - Generated by DOM Visualizer OOP
 * ${new Date().toISOString()}
 */

// Element Creation and Insertion
function createAndInsertElement() {
  const newElement = document.createElement('div');
  newElement.className = 'dynamic-element';
  newElement.textContent = 'Dynamically created!';

  const parent = document.querySelector('#demo-container');
  parent.appendChild(newElement);

  return newElement;
}

// Attribute Manipulation
function manipulateAttributes(element) {
  // Set attributes
  element.setAttribute('data-created', Date.now());
  element.setAttribute('role', 'presentation');

  // Get attributes
  const created = element.getAttribute('data-created');
  const hasRole = element.hasAttribute('role');

  // Remove attributes
  element.removeAttribute('role');

  return { created, hasRole };
}

// CSS Selector Examples
function testSelectors() {
  // Basic selectors
  const byId = document.getElementById('demo-header');
  const byClass = document.getElementsByClassName('nav-link');
  const byTag = document.getElementsByTagName('p');

  // Advanced selectors
  const querySelector = document.querySelector('.demo-nav > .nav-link.active');
  const querySelectorAll = document.querySelectorAll('.widget-item:nth-child(odd)');

  return {
    byId: byId?.tagName,
    byClass: byClass.length,
    byTag: byTag.length,
    querySelector: querySelector?.textContent,
    querySelectorAll: querySelectorAll.length
  };
}

// Style Manipulation
function manipulateStyles(element) {
  // Direct style manipulation
  element.style.backgroundColor = '#e3f2fd';
  element.style.padding = '10px';
  element.style.borderRadius = '4px';

  // CSS class manipulation
  element.classList.add('highlighted');
  element.classList.toggle('active');
  element.classList.remove('old-class');

  // Computed styles
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;

  return { backgroundColor };
}

// DOM Traversal
function traverseDOM(startElement) {
  const traversal = {
    parent: startElement.parentElement?.tagName,
    children: Array.from(startElement.children).map(child => child.tagName),
    siblings: [],
    nextSibling: startElement.nextElementSibling?.tagName,
    previousSibling: startElement.previousElementSibling?.tagName
  };

  // Get all siblings
  let sibling = startElement.parentElement?.firstElementChild;
  while (sibling) {
    if (sibling !== startElement) {
      traversal.siblings.push(sibling.tagName);
    }
    sibling = sibling.nextElementSibling;
  }

  return traversal;
}

// Event Handling
function setupEventHandlers(element) {
  // Click handler
  element.addEventListener('click', function(event) {
    console.log('Element clicked:', event.target);
    event.target.classList.toggle('clicked');
  });

  // Mouse events
  element.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05)';
  });

  element.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });

  // Custom event
  element.addEventListener('customEvent', function(event) {
    console.log('Custom event fired:', event.detail);
  });

  // Trigger custom event
  element.dispatchEvent(new CustomEvent('customEvent', {
    detail: { message: 'Hello from custom event!' }
  }));
}

// Mutation Observer
function setupMutationObserver(targetElement) {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      console.log('Mutation detected:', {
        type: mutation.type,
        target: mutation.target.tagName,
        addedNodes: mutation.addedNodes.length,
        removedNodes: mutation.removedNodes.length
      });
    });
  });

  observer.observe(targetElement, {
    childList: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    subtree: true
  });

  return observer;
}

// Example usage
const demoContainer = document.querySelector('#demo-container');
if (demoContainer) {
  const newElement = createAndInsertElement();
  const attributes = manipulateAttributes(newElement);
  const selectors = testSelectors();
  const styles = manipulateStyles(newElement);
  const traversal = traverseDOM(newElement);

  setupEventHandlers(newElement);
  const observer = setupMutationObserver(demoContainer);

  console.log('DOM Examples executed:', {
    attributes,
    selectors,
    styles,
    traversal
  });
}`;
  }

  /**
   * Run a specific code example
   * @param {string} exampleName - Name of the example to run
   */
  runCodeExample(exampleName) {
    const examples = {
      'basic-manipulation': this.runBasicManipulationExample.bind(this),
      'selector-testing': this.runSelectorTestingExample.bind(this),
      'style-manipulation': this.runStyleManipulationExample.bind(this),
      'dom-traversal': this.runDOMTraversalExample.bind(this)
    };

    const example = examples[exampleName];
    if (example) {
      example();
    } else {
      console.warn(`Example "${exampleName}" not found`);
    }
  }

  /**
   * Run basic manipulation example
   */
  runBasicManipulationExample() {
    const demoContainer = this.container.querySelector('#demo-container');

    // Create new element
    const newDiv = document.createElement('div');
    newDiv.textContent = 'Hello, DOM!';
    newDiv.className = 'demo-element example-element';
    newDiv.setAttribute('data-created', Date.now());
    newDiv.style.backgroundColor = '#e3f2fd';
    newDiv.style.padding = '10px';
    newDiv.style.margin = '5px';
    newDiv.style.borderRadius = '4px';
    newDiv.style.border = '1px solid #2196f3';

    // Insert into document
    demoContainer.appendChild(newDiv);

    // Update metrics
    this.updatePerformanceMetrics('domOperations');

    // Highlight the new element
    this.highlightElement(newDiv);

    console.log('✅ Basic manipulation example executed');
  }
