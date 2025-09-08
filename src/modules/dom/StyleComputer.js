/**
 * StyleComputer Component
 *
 * Educational component for analyzing computed CSS styles and understanding
 * how the browser calculates final style values. Provides visual insights
 * into CSS inheritance, specificity, and the cascade.
 *
 * @fileoverview Computed styles analysis and visualization component
 * @version 1.0.0
 * @author DOM Visualizer OOP Team
 */

/**
 * StyleComputer class for interactive CSS styles analysis
 * @class StyleComputer
 */
export class StyleComputer {
  /**
   * Initialize the Style Computer component
   * @param {HTMLElement} container - Container element for the component
   * @param {Object} options - Configuration options
   * @param {boolean} [options.showInheritance=true] - Show inheritance chain
   * @param {boolean} [options.groupByCategory=true] - Group properties by category
   * @param {boolean} [options.showSource=true] - Show property source information
   * @param {boolean} [options.liveUpdate=true] - Enable live updates on changes
   * @param {string} [options.theme='light'] - Visual theme
   */
  constructor(container, options = {}) {
    // Validate container
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('StyleComputer requires a valid HTML container element');
    }

    // Initialize properties
    this.container = container;
    this.options = {
      showInheritance: true,
      groupByCategory: true,
      showSource: true,
      liveUpdate: true,
      theme: 'light',
      ...options
    };

    // Component state
    this.selectedElement = null;
    this.computedStyles = null;
    this.styleRules = new Map();
    this.inheritanceChain = [];
    this.isAnalyzing = false;
    this.updateQueue = [];

    // Event listeners for cleanup
    this.eventListeners = [];

    // Style categories for organization
    this.styleCategories = {
      layout: {
        name: 'Layout & Positioning',
        icon: '📐',
        properties: [
          'display',
          'position',
          'top',
          'right',
          'bottom',
          'left',
          'float',
          'clear',
          'z-index',
          'width',
          'height',
          'min-width',
          'max-width',
          'min-height',
          'max-height'
        ]
      },
      boxModel: {
        name: 'Box Model',
        icon: '📦',
        properties: [
          'margin',
          'margin-top',
          'margin-right',
          'margin-bottom',
          'margin-left',
          'padding',
          'padding-top',
          'padding-right',
          'padding-bottom',
          'padding-left',
          'border',
          'border-width',
          'border-style',
          'border-color',
          'box-sizing',
          'overflow',
          'overflow-x',
          'overflow-y'
        ]
      },
      typography: {
        name: 'Typography',
        icon: '🔤',
        properties: [
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'line-height',
          'letter-spacing',
          'word-spacing',
          'text-align',
          'text-decoration',
          'text-transform',
          'color',
          'text-shadow'
        ]
      },
      visual: {
        name: 'Visual Effects',
        icon: '🎨',
        properties: [
          'background',
          'background-color',
          'background-image',
          'background-position',
          'background-size',
          'background-repeat',
          'opacity',
          'visibility',
          'box-shadow',
          'border-radius',
          'filter',
          'backdrop-filter'
        ]
      },
      flexGrid: {
        name: 'Flex & Grid',
        icon: '🔲',
        properties: [
          'flex',
          'flex-direction',
          'flex-wrap',
          'justify-content',
          'align-items',
          'align-content',
          'grid',
          'grid-template',
          'grid-area',
          'gap',
          'align-self',
          'justify-self'
        ]
      },
      animation: {
        name: 'Animation & Transform',
        icon: '🎭',
        properties: [
          'transform',
          'transform-origin',
          'transition',
          'animation',
          'animation-name',
          'animation-duration',
          'animation-timing-function',
          'animation-delay',
          'animation-iteration-count',
          'animation-direction'
        ]
      }
    };

    // Performance tracking
    this.performanceMetrics = {
      analysisTime: 0,
      rulesProcessed: 0,
      propertiesAnalyzed: 0,
      lastUpdate: null
    };

    // Initialize component
    this.init();
  }

  /**
   * Initialize the Style Computer component
   * @private
   */
  async init() {
    try {
      this.render();
      this.setupEventListeners();
      this.setupMutationObserver();

      // Initialize with document.body if no element selected
      if (!this.selectedElement) {
        this.analyzeElement(document.body);
      }

      console.log('🎨 StyleComputer initialized successfully');
    } catch (error) {
      console.error('❌ StyleComputer initialization failed:', error);
      this.showError('Failed to initialize Style Computer component');
    }
  }

  /**
   * Render the component UI
   * @private
   */
  render() {
    this.container.innerHTML = `
      <div class="style-computer-wrapper">
        <!-- Header Section -->
        <div class="style-computer-header">
          <div class="header-content">
            <h3 class="component-title">
              <span class="title-icon">🎨</span>
              Computed Styles Analyzer
            </h3>
            <p class="component-description">
              Analyze how CSS properties are computed and inherited in the browser
            </p>
          </div>

          <div class="header-controls">
            <button class="control-btn" id="select-element-btn" title="Select Element">
              <span class="btn-icon">🎯</span>
              Select Element
            </button>

            <button class="control-btn" id="refresh-analysis-btn" title="Refresh Analysis">
              <span class="btn-icon">🔄</span>
              Refresh
            </button>

            <button class="control-btn" id="export-styles-btn" title="Export Styles">
              <span class="btn-icon">📤</span>
              Export
            </button>
          </div>
        </div>

        <!-- Element Selection Section -->
        <div class="element-selector-section">
          <div class="selector-row">
            <label for="element-selector">Target Element:</label>
            <input
              type="text"
              id="element-selector"
              class="element-input"
              placeholder="Enter CSS selector or click to select..."
              value=""
            >
            <button class="apply-btn" id="apply-selector-btn">Apply</button>
          </div>

          <div class="element-info" id="element-info">
            <div class="info-item">
              <span class="info-label">Selected:</span>
              <span class="info-value" id="selected-element-name">None</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tag:</span>
              <span class="info-value" id="selected-element-tag">-</span>
            </div>
            <div class="info-item">
              <span class="info-label">Classes:</span>
              <span class="info-value" id="selected-element-classes">-</span>
            </div>
          </div>
        </div>

        <!-- Analysis Options -->
        <div class="analysis-options">
          <div class="options-group">
            <label class="option-item">
              <input type="checkbox" id="show-inheritance" ${this.options.showInheritance ? 'checked' : ''}>
              <span class="option-label">Show Inheritance Chain</span>
            </label>

            <label class="option-item">
              <input type="checkbox" id="group-by-category" ${this.options.groupByCategory ? 'checked' : ''}>
              <span class="option-label">Group by Category</span>
            </label>

            <label class="option-item">
              <input type="checkbox" id="show-source" ${this.options.showSource ? 'checked' : ''}>
              <span class="option-label">Show Property Source</span>
            </label>

            <label class="option-item">
              <input type="checkbox" id="live-update" ${this.options.liveUpdate ? 'checked' : ''}>
              <span class="option-label">Live Updates</span>
            </label>
          </div>

          <div class="filter-section">
            <input
              type="text"
              id="property-filter"
              class="filter-input"
              placeholder="Filter properties..."
            >
            <button class="filter-clear-btn" id="clear-filter-btn">Clear</button>
          </div>
        </div>

        <!-- Main Analysis Content -->
        <div class="analysis-content">
          <!-- Loading State -->
          <div class="loading-state" id="loading-state">
            <div class="loading-spinner"></div>
            <span class="loading-text">Analyzing styles...</span>
          </div>

          <!-- Results Section -->
          <div class="results-section" id="results-section" style="display: none;">
            <!-- Inheritance Chain -->
            <div class="inheritance-section" id="inheritance-section">
              <h4 class="section-title">
                <span class="section-icon">🔗</span>
                Inheritance Chain
              </h4>
              <div class="inheritance-chain" id="inheritance-chain">
                <!-- Chain will be populated here -->
              </div>
            </div>

            <!-- Computed Styles -->
            <div class="styles-section" id="styles-section">
              <h4 class="section-title">
                <span class="section-icon">📋</span>
                Computed Styles
                <span class="property-count" id="property-count">(0)</span>
              </h4>
              <div class="styles-content" id="styles-content">
                <!-- Styles will be populated here -->
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="performance-section" id="performance-section">
              <h4 class="section-title">
                <span class="section-icon">⚡</span>
                Performance Metrics
              </h4>
              <div class="metrics-grid" id="metrics-grid">
                <!-- Metrics will be populated here -->
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div class="error-state" id="error-state" style="display: none;">
            <div class="error-icon">❌</div>
            <div class="error-message" id="error-message">
              An error occurred during analysis
            </div>
            <button class="retry-btn" id="retry-btn">Try Again</button>
          </div>
        </div>

        <!-- Educational Panel -->
        <div class="educational-panel">
          <details class="education-section">
            <summary class="education-title">
              📚 Understanding CSS Computed Styles
            </summary>
            <div class="education-content">
              <p>
                <strong>Computed styles</strong> are the final values that the browser
                calculates for each CSS property after processing the cascade,
                inheritance, and any animations.
              </p>

              <h5>Key Concepts:</h5>
              <ul>
                <li><strong>Cascade</strong>: How conflicting rules are resolved</li>
                <li><strong>Inheritance</strong>: Properties passed from parent elements</li>
                <li><strong>Specificity</strong>: How rule importance is calculated</li>
                <li><strong>Initial Values</strong>: Default property values</li>
              </ul>

              <h5>Performance Tips:</h5>
              <ul>
                <li>Avoid frequent style recalculation</li>
                <li>Use efficient selectors</li>
                <li>Minimize property changes in animations</li>
                <li>Understand which properties trigger reflow/repaint</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    `;

    // Apply theme
    this.container.classList.add(`theme-${this.options.theme}`);
  }

  /**
   * Setup event listeners for component interactions
   * @private
   */
  setupEventListeners() {
    // Element selection
    this.addEventListener('#select-element-btn', 'click', () => {
      this.startElementSelection();
    });

    this.addEventListener('#apply-selector-btn', 'click', () => {
      this.applySelectorInput();
    });

    this.addEventListener('#element-selector', 'keyup', e => {
      if (e.key === 'Enter') {
        this.applySelectorInput();
      }
    });

    // Control buttons
    this.addEventListener('#refresh-analysis-btn', 'click', () => {
      if (this.selectedElement) {
        this.analyzeElement(this.selectedElement);
      }
    });

    this.addEventListener('#export-styles-btn', 'click', () => {
      this.exportStyles();
    });

    // Options
    this.addEventListener('#show-inheritance', 'change', e => {
      this.options.showInheritance = e.target.checked;
      this.updateDisplay();
    });

    this.addEventListener('#group-by-category', 'change', e => {
      this.options.groupByCategory = e.target.checked;
      this.updateDisplay();
    });

    this.addEventListener('#show-source', 'change', e => {
      this.options.showSource = e.target.checked;
      this.updateDisplay();
    });

    this.addEventListener('#live-update', 'change', e => {
      this.options.liveUpdate = e.target.checked;
      if (e.target.checked && this.selectedElement) {
        this.setupMutationObserver();
      }
    });

    // Filter functionality
    this.addEventListener('#property-filter', 'input', e => {
      this.filterProperties(e.target.value);
    });

    this.addEventListener('#clear-filter-btn', 'click', () => {
      const filterInput = this.container.querySelector('#property-filter');
      filterInput.value = '';
      this.filterProperties('');
    });

    // Retry button
    this.addEventListener('#retry-btn', 'click', () => {
      if (this.selectedElement) {
        this.analyzeElement(this.selectedElement);
      }
    });
  }

  /**
   * Setup mutation observer for live updates
   * @private
   */
  setupMutationObserver() {
    // Disconnect existing observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    if (!this.options.liveUpdate || !this.selectedElement) {
      return;
    }

    this.mutationObserver = new MutationObserver(mutations => {
      let shouldUpdate = false;

      mutations.forEach(mutation => {
        // Check if the mutation affects our selected element or its ancestors
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'style' ||
            mutation.attributeName === 'class' ||
            mutation.attributeName === 'id')
        ) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        // Debounce updates
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          this.analyzeElement(this.selectedElement);
        }, 100);
      }
    });

    // Observe the selected element and document head for style changes
    this.mutationObserver.observe(this.selectedElement, {
      attributes: true,
      attributeFilter: ['style', 'class', 'id']
    });

    this.mutationObserver.observe(document.head, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Start interactive element selection
   * @private
   */
  startElementSelection() {
    this.showMessage(
      'Click on any element to analyze its computed styles',
      'info'
    );

    // Create overlay for element highlighting
    this.createSelectionOverlay();

    // Add mouse event listeners for element selection
    this.selectionHandler = e => {
      e.preventDefault();
      e.stopPropagation();

      // Remove selection overlay
      this.removeSelectionOverlay();

      // Analyze the clicked element
      this.analyzeElement(e.target);

      // Remove event listeners
      document.removeEventListener('click', this.selectionHandler, true);
      document.removeEventListener('mouseover', this.highlightHandler, true);
      document.removeEventListener('mouseout', this.unhighlightHandler, true);
    };

    this.highlightHandler = e => {
      this.highlightElement(e.target);
    };

    this.unhighlightHandler = e => {
      this.unhighlightElement(e.target);
    };

    // Add event listeners
    document.addEventListener('click', this.selectionHandler, true);
    document.addEventListener('mouseover', this.highlightHandler, true);
    document.addEventListener('mouseout', this.unhighlightHandler, true);
  }

  /**
   * Apply selector input to select element
   * @private
   */
  applySelectorInput() {
    const selectorInput = this.container.querySelector('#element-selector');
    const selector = selectorInput.value.trim();

    if (!selector) {
      this.showMessage('Please enter a valid CSS selector', 'warning');
      return;
    }

    try {
      const element = document.querySelector(selector);
      if (element) {
        this.analyzeElement(element);
      } else {
        this.showMessage(
          `No element found matching selector: ${selector}`,
          'warning'
        );
      }
    } catch (error) {
      this.showMessage(`Invalid CSS selector: ${selector}`, 'error');
    }
  }

  /**
   * Analyze computed styles for a given element
   * @param {HTMLElement} element - Element to analyze
   */
  async analyzeElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
      this.showError('Invalid element provided for analysis');
      return;
    }

    const startTime = performance.now();

    try {
      this.selectedElement = element;
      this.showLoading(true);

      // Update element info display
      this.updateElementInfo(element);

      // Get computed styles
      this.computedStyles = window.getComputedStyle(element);

      // Build inheritance chain
      this.inheritanceChain = this.buildInheritanceChain(element);

      // Analyze style rules
      this.styleRules = this.analyzeStyleRules(element);

      // Update performance metrics
      this.performanceMetrics.analysisTime = performance.now() - startTime;
      this.performanceMetrics.propertiesAnalyzed = this.computedStyles.length;
      this.performanceMetrics.rulesProcessed = this.styleRules.size;
      this.performanceMetrics.lastUpdate = new Date();

      // Update display
      this.updateDisplay();
      this.showLoading(false);

      console.log(`🎨 Style analysis completed for element:`, element);
    } catch (error) {
      console.error('❌ Style analysis failed:', error);
      this.showError('Failed to analyze element styles');
      this.showLoading(false);
    }
  }

  /**
   * Build inheritance chain for the element
   * @param {HTMLElement} element - Target element
   * @returns {Array} Inheritance chain
   * @private
   */
  buildInheritanceChain(element) {
    const chain = [];
    let current = element;

    while (current && current !== document.documentElement.parentNode) {
      chain.push({
        element: current,
        tagName: current.tagName?.toLowerCase() || 'text',
        className: current.className || '',
        id: current.id || '',
        styles: window.getComputedStyle(current)
      });
      current = current.parentElement;
    }

    return chain;
  }

  /**
   * Analyze CSS rules affecting the element
   * @param {HTMLElement} element - Target element
   * @returns {Map} Map of property to rule information
   * @private
   */
  analyzeStyleRules(element) {
    const rules = new Map();

    try {
      // Get all stylesheets
      const stylesheets = Array.from(document.styleSheets);

      stylesheets.forEach(stylesheet => {
        try {
          if (stylesheet.cssRules) {
            this.processStyleSheet(stylesheet, element, rules);
          }
        } catch (e) {
          // Cross-origin stylesheets may not be accessible
          console.warn('Cannot access stylesheet:', stylesheet.href);
        }
      });

      // Add inline styles
      if (element.style.length > 0) {
        for (let i = 0; i < element.style.length; i++) {
          const property = element.style[i];
          rules.set(property, {
            value: element.style.getPropertyValue(property),
            priority: element.style.getPropertyPriority(property),
            source: 'inline',
            specificity: [1, 0, 0, 0] // Inline styles have highest specificity
          });
        }
      }
    } catch (error) {
      console.warn('Error analyzing style rules:', error);
    }

    return rules;
  }

  /**
   * Process a stylesheet for matching rules
   * @param {CSSStyleSheet} stylesheet - Stylesheet to process
   * @param {HTMLElement} element - Target element
   * @param {Map} rules - Rules map to populate
   * @private
   */
  processStyleSheet(stylesheet, element, rules) {
    try {
      Array.from(stylesheet.cssRules).forEach(rule => {
        if (rule.type === CSSRule.STYLE_RULE) {
          try {
            if (element.matches(rule.selectorText)) {
              const specificity = this.calculateSpecificity(rule.selectorText);

              for (let i = 0; i < rule.style.length; i++) {
                const property = rule.style[i];
                const value = rule.style.getPropertyValue(property);
                const priority = rule.style.getPropertyPriority(property);

                const ruleInfo = {
                  value,
                  priority,
                  selector: rule.selectorText,
                  source: stylesheet.href || 'internal',
                  specificity
                };

                // Store the rule with highest specificity for each property
                if (
                  !rules.has(property) ||
                  this.compareSpecificity(
                    specificity,
                    rules.get(property).specificity
                  ) > 0
                ) {
                  rules.set(property, ruleInfo);
                }
              }
            }
          } catch (e) {
            // Invalid selector or other issues
            console.warn('Error processing rule:', rule.selectorText, e);
          }
        }
      });
    } catch (error) {
      console.warn('Error processing stylesheet:', error);
    }
  }

  /**
   * Calculate CSS selector specificity
   * @param {string} selector - CSS selector
   * @returns {Array} Specificity array [inline, ids, classes, elements]
   * @private
   */
  calculateSpecificity(selector) {
    let ids = 0;
    let classes = 0;
    let elements = 0;

    // Simple specificity calculation (could be more sophisticated)
    ids = (selector.match(/#[\w-]+/g) || []).length;
    classes = (selector.match(/\.[\w-]+/g) || []).length;
    classes += (selector.match(/\[[\w-]+/g) || []).length; // Attributes
    classes += (selector.match(/:[\w-]+/g) || []).length; // Pseudo-classes
    elements = (selector.match(/^[\w-]+|(?:\s|>|~|\+)[\w-]+/g) || []).length;

    return [0, ids, classes, elements]; // [inline, ids, classes, elements]
  }

  /**
   * Compare two specificity arrays
   * @param {Array} a - First specificity
   * @param {Array} b - Second specificity
   * @returns {number} Comparison result (-1, 0, 1)
   * @private
   */
  compareSpecificity(a, b) {
    for (let i = 0; i < 4; i++) {
      if (a[i] !== b[i]) {
        return a[i] - b[i];
      }
    }
    return 0;
  }

  /**
   * Update the main display with analysis results
   * @private
   */
  updateDisplay() {
    if (!this.computedStyles) {
      return;
    }

    // Update inheritance chain
    if (this.options.showInheritance) {
      this.renderInheritanceChain();
      this.container.querySelector('#inheritance-section').style.display =
        'block';
    } else {
      this.container.querySelector('#inheritance-section').style.display =
        'none';
    }

    // Update computed styles
    this.renderComputedStyles();

    // Update performance metrics
    this.renderPerformanceMetrics();

    // Show results section
    this.container.querySelector('#results-section').style.display = 'block';
  }

  /**
   * Render inheritance chain visualization
   * @private
   */
  renderInheritanceChain() {
    const chainContainer = this.container.querySelector('#inheritance-chain');

    if (this.inheritanceChain.length === 0) {
      chainContainer.innerHTML =
        '<p class="no-data">No inheritance chain available</p>';
      return;
    }

    const chainHTML = this.inheritanceChain
      .map((item, index) => {
        const isTarget = index === 0;
        const elementName = this.getElementDisplayName(item.element);

        return `
        <div class="chain-item ${isTarget ? 'target-element' : ''}">
          <div class="chain-element">
            <div class="element-tag">${item.tagName}</div>
            ${item.id ? `<div class="element-id">#${item.id}</div>` : ''}
            ${item.className ? `<div class="element-classes">.${item.className.split(' ').join('.')}</div>` : ''}
          </div>
          <div class="element-name">${elementName}</div>
          ${index < this.inheritanceChain.length - 1 ? '<div class="chain-arrow">↑</div>' : ''}
        </div>
      `;
      })
      .join('');

    chainContainer.innerHTML = chainHTML;
  }

  /**
   * Render computed styles display
   * @private
   */
  renderComputedStyles() {
    const stylesContainer = this.container.querySelector('#styles-content');
    const propertyCount = this.container.querySelector('#property-count');

    if (!this.computedStyles || this.computedStyles.length === 0) {
      stylesContainer.innerHTML =
        '<p class="no-data">No computed styles available</p>';
      propertyCount.textContent = '(0)';
      return;
    }

    let stylesHTML = '';
    const processedProperties = new Set();

    if (this.options.groupByCategory) {
      // Group by categories
      Object.entries(this.styleCategories).forEach(
        ([categoryKey, category]) => {
          const categoryProperties = [];

          category.properties.forEach(prop => {
            if (this.computedStyles.getPropertyValue(prop)) {
              categoryProperties.push(prop);
              processedProperties.add(prop);
            }
          });

          if (categoryProperties.length > 0) {
            stylesHTML += this.renderStyleCategory(
              category,
              categoryProperties
            );
          }
        }
      );

      // Add uncategorized properties
      const uncategorizedProps = [];
      for (let i = 0; i < this.computedStyles.length; i++) {
        const prop = this.computedStyles[i];
        if (
          !processedProperties.has(prop) &&
          this.computedStyles.getPropertyValue(prop)
        ) {
          uncategorizedProps.push(prop);
        }
      }

      if (uncategorizedProps.length > 0) {
        stylesHTML += this.renderStyleCategory(
          { name: 'Other Properties', icon: '📝' },
          uncategorizedProps
        );
      }
    } else {
      // List all properties
      const allProperties = [];
      for (let i = 0; i < this.computedStyles.length; i++) {
        const prop = this.computedStyles[i];
        if (this.computedStyles.getPropertyValue(prop)) {
          allProperties.push(prop);
        }
      }

      stylesHTML = this.renderStyleCategory(
        { name: 'All Properties', icon: '📋' },
        allProperties
      );
    }

    stylesContainer.innerHTML = stylesHTML;
    propertyCount.textContent = `(${processedProperties.size || this.computedStyles.length})`;
  }

  /**
   * Render a category of styles
   * @param {Object} category - Category information
   * @param {Array} properties - Properties in this category
   * @returns {string} HTML string
   * @private
   */
  renderStyleCategory(category, properties) {
    const propertiesHTML = properties
      .map(prop => {
        const value = this.computedStyles.getPropertyValue(prop);
        const ruleInfo = this.styleRules.get(prop);

        return `
        <div class="style-property" data-property="${prop}">
          <div class="property-header">
            <div class="property-name">${prop}</div>
            ${
              this.options.showSource && ruleInfo
                ? `
              <div class="property-source" title="${ruleInfo.source}">
                ${ruleInfo.selector || 'inherited'}
              </div>
            `
                : ''
            }
          </div>
          <div class="property-value">${this.formatPropertyValue(prop, value)}</div>
          ${
            ruleInfo && ruleInfo.priority
              ? `
            <div class="property-priority">!important</div>
          `
              : ''
          }
        </div>
      `;
      })
      .join('');

    return `
      <div class="style-category">
        <div class="category-header">
          <span class="category-icon">${category.icon}</span>
          <span class="category-name">${category.name}</span>
          <span class="category-count">(${properties.length})</span>
        </div>
        <div class="category-properties">
          ${propertiesHTML}
        </div>
      </div>
    `;
  }

  /**
   * Format property value for display
   * @param {string} property - CSS property name
   * @param {string} value - Property value
   * @returns {string} Formatted value
   * @private
   */
  formatPropertyValue(property, value) {
    // Color values
    if (property.includes('color') || property === 'background') {
      if (value.startsWith('rgb') || value.startsWith('#')) {
        return `
          <span class="color-value">
            <span class="color-swatch" style="background-color: ${value}"></span>
            ${value}
          </span>
        `;
      }
    }

    // URL values
    if (value.includes('url(')) {
      return value.replace(
        /url\((.*?)\)/g,
        '<span class="url-value">url($1)</span>'
      );
    }

    // Numeric values with units
    if (/^\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch)$/.test(value)) {
      return `<span class="numeric-value">${value}</span>`;
    }

    return `<span class="text-value">${value}</span>`;
  }

  /**
   * Render performance metrics
   * @private
   */
  renderPerformanceMetrics() {
    const metricsContainer = this.container.querySelector('#metrics-grid');

    const metrics = [
      {
        name: 'Analysis Time',
        value: `${this.performanceMetrics.analysisTime.toFixed(2)}ms`,
        icon: '⏱️'
      },
      {
        name: 'Properties Analyzed',
        value: this.performanceMetrics.propertiesAnalyzed,
        icon: '📊'
      },
      {
        name: 'Rules Processed',
        value: this.performanceMetrics.rulesProcessed,
        icon: '📝'
      },
      {
        name: 'Last Updated',
        value: this.performanceMetrics.lastUpdate
          ? this.performanceMetrics.lastUpdate.toLocaleTimeString()
          : 'Never',
        icon: '🕒'
      }
    ];

    const metricsHTML = metrics
      .map(
        metric => `
      <div class="metric-item">
        <div class="metric-icon">${metric.icon}</div>
        <div class="metric-content">
          <div class="metric-value">${metric.value}</div>
          <div class="metric-name">${metric.name}</div>
        </div>
      </div>
    `
      )
      .join('');

    metricsContainer.innerHTML = metricsHTML;
  }

  /**
   * Update element info display
   * @param {HTMLElement} element - Selected element
   * @private
   */
  updateElementInfo(element) {
    const elementName = this.getElementDisplayName(element);
    const selectorInput = this.container.querySelector('#element-selector');

    // Update selector input
    selectorInput.value = this.generateSelector(element);

    // Update info display
    this.container.querySelector('#selected-element-name').textContent =
      elementName;
    this.container.querySelector('#selected-element-tag').textContent =
      element.tagName?.toLowerCase() || 'unknown';
    this.container.querySelector('#selected-element-classes').textContent =
      element.className || 'none';
  }

  /**
   * Generate a unique CSS selector for an element
   * @param {HTMLElement} element - Target element
   * @returns {string} CSS selector
   * @private
   */
  generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim());
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }

    // Generate nth-child selector
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      return `${parent.tagName.toLowerCase()} > ${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Get display name for an element
   * @param {HTMLElement} element - Target element
   * @returns {string} Display name
   * @private
   */
  getElementDisplayName(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim());
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }

    return element.tagName?.toLowerCase() || 'element';
  }

  /**
   * Filter properties based on search term
   * @param {string} searchTerm - Search term
   * @private
   */
  filterProperties(searchTerm) {
    const properties = this.container.querySelectorAll('.style-property');
    const categories = this.container.querySelectorAll('.style-category');

    if (!searchTerm) {
      // Show all
      properties.forEach(prop => (prop.style.display = 'block'));
      categories.forEach(cat => (cat.style.display = 'block'));
      return;
    }

    const term = searchTerm.toLowerCase();

    properties.forEach(prop => {
      const propertyName = prop.dataset.property.toLowerCase();
      const propertyValue = prop
        .querySelector('.property-value')
        .textContent.toLowerCase();

      if (propertyName.includes(term) || propertyValue.includes(term)) {
        prop.style.display = 'block';
      } else {
        prop.style.display = 'none';
      }
    });

    // Hide empty categories
    categories.forEach(cat => {
      const visibleProps = cat.querySelectorAll(
        '.style-property[style*="block"], .style-property:not([style])'
      );
      if (visibleProps.length === 0) {
        cat.style.display = 'none';
      } else {
        cat.style.display = 'block';
      }
    });
  }

  /**
   * Export computed styles data
   * @private
   */
  exportStyles() {
    if (!this.selectedElement || !this.computedStyles) {
      this.showMessage('No element selected for export', 'warning');
      return;
    }

    const exportData = {
      element: {
        tagName: this.selectedElement.tagName,
        id: this.selectedElement.id,
        className: this.selectedElement.className,
        selector: this.generateSelector(this.selectedElement)
      },
      computedStyles: {},
      inheritanceChain: this.inheritanceChain.map(item => ({
        tagName: item.tagName,
        id: item.id,
        className: item.className
      })),
      styleRules: Object.fromEntries(this.styleRules),
      performanceMetrics: this.performanceMetrics,
      exportedAt: new Date().toISOString()
    };

    // Convert computed styles to object
    for (let i = 0; i < this.computedStyles.length; i++) {
      const prop = this.computedStyles[i];
      exportData.computedStyles[prop] =
        this.computedStyles.getPropertyValue(prop);
    }

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `computed-styles-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showMessage('Styles exported successfully', 'success');
  }

  /**
   * Create selection overlay for element picking
   * @private
   */
  createSelectionOverlay() {
    if (this.selectionOverlay) {
      this.removeSelectionOverlay();
    }

    this.selectionOverlay = document.createElement('div');
    this.selectionOverlay.className = 'style-computer-selection-overlay';
    this.selectionOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      pointer-events: none;
      background: rgba(0, 0, 0, 0.1);
    `;

    this.selectionHighlight = document.createElement('div');
    this.selectionHighlight.className = 'style-computer-selection-highlight';
    this.selectionHighlight.style.cssText = `
      position: absolute;
      border: 2px solid #007acc;
      background: rgba(0, 122, 204, 0.1);
      pointer-events: none;
      z-index: 1000000;
    `;

    document.body.appendChild(this.selectionOverlay);
    document.body.appendChild(this.selectionHighlight);
  }

  /**
   * Remove selection overlay
   * @private
   */
  removeSelectionOverlay() {
    if (this.selectionOverlay) {
      document.body.removeChild(this.selectionOverlay);
      this.selectionOverlay = null;
    }

    if (this.selectionHighlight) {
      document.body.removeChild(this.selectionHighlight);
      this.selectionHighlight = null;
    }
  }

  /**
   * Highlight element during selection
   * @param {HTMLElement} element - Element to highlight
   * @private
   */
  highlightElement(element) {
    if (!this.selectionHighlight || !element) return;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    this.selectionHighlight.style.cssText += `
      top: ${rect.top + scrollTop}px;
      left: ${rect.left + scrollLeft}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      display: block;
    `;
  }

  /**
   * Remove highlight from element
   * @param {HTMLElement} element - Element to unhighlight
   * @private
   */
  unhighlightElement(element) {
    if (this.selectionHighlight) {
      this.selectionHighlight.style.display = 'none';
    }
  }

  /**
   * Show loading state
   * @param {boolean} show - Whether to show loading
   * @private
   */
  showLoading(show) {
    const loadingState = this.container.querySelector('#loading-state');
    const resultsSection = this.container.querySelector('#results-section');
    const errorState = this.container.querySelector('#error-state');

    if (show) {
      loadingState.style.display = 'flex';
      resultsSection.style.display = 'none';
      errorState.style.display = 'none';
    } else {
      loadingState.style.display = 'none';
    }
  }

  /**
   * Show error state
   * @param {string} message - Error message
   * @private
   */
  showError(message) {
    const errorState = this.container.querySelector('#error-state');
    const errorMessage = this.container.querySelector('#error-message');
    const loadingState = this.container.querySelector('#loading-state');
    const resultsSection = this.container.querySelector('#results-section');

    errorMessage.textContent = message;
    errorState.style.display = 'flex';
    loadingState.style.display = 'none';
    resultsSection.style.display = 'none';
  }

  /**
   * Show temporary message
   * @param {string} message - Message text
   * @param {string} type - Message type (info, success, warning, error)
   * @private
   */
  showMessage(message, type = 'info') {
    // Create message element if it doesn't exist
    let messageEl = this.container.querySelector('.style-computer-message');
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.className = 'style-computer-message';
      this.container.insertBefore(messageEl, this.container.firstChild);
    }

    messageEl.className = `style-computer-message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (messageEl) {
        messageEl.style.display = 'none';
      }
    }, 3000);
  }

  /**
   * Add event listener with cleanup tracking
   * @param {string|HTMLElement} selector - Element or selector
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @private
   */
  addEventListener(selector, event, handler) {
    const element =
      typeof selector === 'string'
        ? this.container.querySelector(selector)
        : selector;

    if (element) {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    }
  }

  /**
   * Reset the component to initial state
   */
  reset() {
    this.selectedElement = null;
    this.computedStyles = null;
    this.styleRules.clear();
    this.inheritanceChain = [];

    // Reset UI
    this.container.querySelector('#element-selector').value = '';
    this.container.querySelector('#property-filter').value = '';
    this.container.querySelector('#selected-element-name').textContent = 'None';
    this.container.querySelector('#selected-element-tag').textContent = '-';
    this.container.querySelector('#selected-element-classes').textContent = '-';

    // Hide results
    this.container.querySelector('#results-section').style.display = 'none';
    this.container.querySelector('#loading-state').style.display = 'none';
    this.container.querySelector('#error-state').style.display = 'none';

    console.log('🔄 StyleComputer reset');
  }

  /**
   * Cleanup component resources
   */
  destroy() {
    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Disconnect mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    // Clear timeouts
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // Remove selection overlay
    this.removeSelectionOverlay();

    // Clear data
    this.selectedElement = null;
    this.computedStyles = null;
    this.styleRules.clear();
    this.inheritanceChain = [];

    console.log('🧹 StyleComputer destroyed');
  }

  /**
   * Get component status for debugging
   * @returns {Object} Component status
   */
  getStatus() {
    return {
      isInitialized: !!this.container,
      hasSelectedElement: !!this.selectedElement,
      selectedElementTag: this.selectedElement?.tagName,
      computedStylesCount: this.computedStyles?.length || 0,
      styleRulesCount: this.styleRules.size,
      inheritanceChainLength: this.inheritanceChain.length,
      options: { ...this.options },
      performanceMetrics: { ...this.performanceMetrics }
    };
  }
}
