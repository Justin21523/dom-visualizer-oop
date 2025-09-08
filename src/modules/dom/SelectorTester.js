/**
 * SelectorTester - Interactive CSS Selector Testing and Learning Tool
 *
 * Provides a comprehensive environment for testing CSS selectors with real-time
 * visual feedback, performance metrics, and educational guidance for selector optimization.
 *
 * @fileoverview CSS selector testing component for DOM manipulation learning
 * @version 1.0.0
 */

export class SelectorTester {
  /**
   * Create a new SelectorTester instance
   * @param {HTMLElement} container - Container element for the selector tester
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      enableHighlighting: true,
      showQueryStats: true,
      enableAutoComplete: true,
      maxResults: 100,
      highlightDuration: 3000,
      enablePerformanceMode: false,
      ...options
    };

    // State management
    this.state = {
      currentSelector: '',
      results: [],
      highlightedElements: new Set(),
      queryHistory: [],
      favorites: new Set(),
      validationErrors: [],
      performanceData: {
        queryCount: 0,
        averageTime: 0,
        totalTime: 0,
        slowQueries: []
      }
    };

    // Selector patterns for auto-completion and validation
    this.selectorPatterns = {
      basic: ['*', 'div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3'],
classes: ['.container', '.header', '.content', '.nav', '.btn', '.active', '.hidden'],
      ids: ['#header', '#main', '#footer', '#nav', '#content'],
      attributes: ['[type="text"]', '[class*="btn"]', '[data-*]', '[href^="http"]', '[src$=".jpg"]'],
      pseudoClasses: [':hover', ':focus', ':active', ':first-child', ':last-child', ':nth-child()', ':not()'],
      pseudoElements: ['::before', '::after', '::first-letter', '::first-line'],
      combinators: [' ', '>', '+', '~'],
      complex: ['div > .content', '.nav a:hover', 'input[type="text"]:focus', 'li:nth-child(odd)']
    };

    // Common selector mistakes for validation
    this.commonMistakes = [
      { pattern: /\s*>\s*>/, message: 'Duplicate child combinators (>) are invalid' },
      { pattern: /\s*\+\s*\+/, message: 'Duplicate adjacent sibling combinators (+) are invalid' },
      { pattern: /\s*~\s*~/, message: 'Duplicate general sibling combinators (~) are invalid' },
      { pattern: /::.*::/, message: 'Only one pseudo-element allowed per selector' },
      { pattern: /:nth-child\(\s*\)/, message: 'nth-child() requires a parameter' },
      { pattern: /\[.*\]\[.*\](?!\s|$|[>+~])/, message: 'Multiple attribute selectors should be properly spaced' }
    ];

    // Performance benchmarks
    this.performanceBenchmarks = {
      excellent: 1,    // < 1ms
      good: 5,         // 1-5ms
      acceptable: 15,  // 5-15ms
      slow: 50,        // 15-50ms
      veryPoor: Infinity // > 50ms
    };

    // Event handlers
    this.eventHandlers = new Map();

    // Auto-complete suggestions
    this.autoCompleteEngine = null;

    this.initialize();
  }

  /**
   * Initialize the selector tester
   * @private
   */
  initialize() {
    this.createTesterInterface();
    this.setupEventListeners();
    this.initializeAutoComplete();
    this.loadSelectorLibrary();

    console.log('🎯 SelectorTester initialized');
  }

  /**
   * Create the main tester interface
   * @private
   */
  createTesterInterface() {
    this.container.innerHTML = `
      <div class="selector-tester">
        <div class="tester-header">
          <div class="header-title">
            <h3>🎯 CSS Selector Tester</h3>
            <p>Test and learn CSS selectors with live feedback</p>
          </div>

          <div class="tester-controls">
            <div class="control-group">
              <label class="checkbox-label">
                <input type="checkbox" id="enable-highlighting" checked />
                <span>Visual Highlighting</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="show-performance" checked />
                <span>Performance Metrics</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="auto-complete" checked />
                <span>Auto-complete</span>
              </label>
            </div>
          </div>
        </div>

        <div class="tester-content">
          <div class="selector-input-panel">
            <div class="input-section">
              <div class="input-header">
                <h4>CSS Selector Input</h4>
                <div class="input-actions">
                  <button class="action-btn" id="clear-selector">
                    <span class="icon">🗑️</span>
                    Clear
                  </button>
                  <button class="action-btn" id="run-selector">
                    <span class="icon">▶️</span>
                    Test
                  </button>
                </div>
              </div>

              <div class="input-container">
                <div class="selector-input-wrapper">
                  <textarea
                    id="selector-input"
                    class="selector-input"
                    placeholder="Enter CSS selector (e.g., .nav > li:first-child)"
                    rows="3"
                    spellcheck="false"
                    autocomplete="off"
                  ></textarea>

                  <div id="auto-complete-suggestions" class="auto-complete-suggestions hidden">
                    <!-- Auto-complete suggestions will appear here -->
                  </div>
                </div>

                <div class="input-validation">
                  <div id="validation-status" class="validation-status">
                    <span class="status-icon">✅</span>
                    <span class="status-text">Enter a selector to validate</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="quick-selectors">
              <div class="quick-header">
                <h5>Quick Test Selectors</h5>
              </div>
              <div class="selector-chips">
                <button class="selector-chip" data-selector="*">*</button>
                <button class="selector-chip" data-selector="div">div</button>
                <button class="selector-chip" data-selector=".container">.container</button>
                <button class="selector-chip" data-selector="#header">#header</button>
                <button class="selector-chip" data-selector="p:first-child">p:first-child</button>
                <button class="selector-chip" data-selector="a[href^='http']">a[href^='http']</button>
                <button class="selector-chip" data-selector="div > p">div > p</button>
                <button class="selector-chip" data-selector=".nav li:nth-child(odd)">.nav li:nth-child(odd)</button>
              </div>
            </div>
          </div>

          <div class="results-panel">
            <div class="results-header">
              <h4>Results</h4>
              <div class="results-summary">
                <span class="result-count">0 elements found</span>
                <span class="query-time">0ms</span>
              </div>
            </div>

            <div class="results-content">
              <div id="results-list" class="results-list">
                <div class="results-placeholder">
                  <div class="placeholder-icon">🔍</div>
                  <p>Enter a selector to see matching elements</p>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-panel">
            <div class="panel-section">
              <h4>Performance Metrics</h4>
              <div id="performance-metrics" class="performance-metrics">
                <div class="metric-item">
                  <label>Query Time:</label>
                  <span id="current-query-time" class="metric-value">-</span>
                </div>
                <div class="metric-item">
                  <label>Elements Found:</label>
                  <span id="elements-found" class="metric-value">-</span>
                </div>
                <div class="metric-item">
                  <label>Performance:</label>
                  <span id="performance-rating" class="metric-value performance-rating">-</span>
                </div>
                <div class="metric-item">
                  <label>Total Queries:</label>
                  <span id="total-queries" class="metric-value">0</span>
                </div>
              </div>
            </div>

            <div class="panel-section">
              <h4>Selector Analysis</h4>
              <div id="selector-analysis" class="selector-analysis">
                <div class="analysis-placeholder">
                  Run a selector to see analysis
                </div>
              </div>
            </div>

            <div class="panel-section">
              <h4>Query History</h4>
              <div class="history-controls">
                <button class="history-btn" id="clear-history">
                  <span class="icon">🗑️</span>
                  Clear
                </button>
                <button class="history-btn" id="export-history">
                  <span class="icon">💾</span>
                  Export
                </button>
              </div>
              <div id="query-history" class="query-history">
                <div class="history-placeholder">No queries yet</div>
              </div>
            </div>
          </div>
        </div>

        <div class="tester-footer">
          <div class="selector-library">
            <div class="library-header">
              <h4>📚 Selector Library & Examples</h4>
              <div class="library-tabs">
                <button class="library-tab active" data-category="basic">Basic</button>
                <button class="library-tab" data-category="advanced">Advanced</button>
                <button class="library-tab" data-category="pseudo">Pseudo</button>
                <button class="library-tab" data-category="attributes">Attributes</button>
                <button class="library-tab" data-category="favorites">Favorites</button>
              </div>
            </div>

            <div id="library-content" class="library-content">
              <!-- Library content will be loaded here -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Set up event listeners for tester interactions
   * @private
   */
  setupEventListeners() {
    // Input handling
    this.addEventListener('input', '#selector-input', (event) => {
      this.handleSelectorInput(event.target.value);
    });

    this.addEventListener('keydown', '#selector-input', (event) => {
      this.handleKeyboardInput(event);
    });

    // Control buttons
    this.addEventListener('click', '#clear-selector', () => this.clearSelector());
    this.addEventListener('click', '#run-selector', () => this.runCurrentSelector());

    // Options
    this.addEventListener('change', '#enable-highlighting', (event) => {
      this.options.enableHighlighting = event.target.checked;
      if (!this.options.enableHighlighting) {
        this.clearHighlights();
      }
    });

    this.addEventListener('change', '#show-performance', (event) => {
      this.options.showQueryStats = event.target.checked;
      this.updatePerformanceDisplay();
    });

    this.addEventListener('change', '#auto-complete', (event) => {
      this.options.enableAutoComplete = event.target.checked;
      this.hideAutoComplete();
    });

    // Quick selectors
    this.addEventListener('click', '.selector-chip', (event) => {
      this.loadQuickSelector(event.target.dataset.selector);
    });

    // History controls
    this.addEventListener('click', '#clear-history', () => this.clearHistory());
    this.addEventListener('click', '#export-history', () => this.exportHistory());

    // Library tabs
    this.addEventListener('click', '.library-tab', (event) => {
      this.switchLibraryCategory(event.target.dataset.category);
    });

    // Results interactions
    this.addEventListener('click', '.results-list', (event) => {
      this.handleResultClick(event);
    });

    // Auto-complete
    this.addEventListener('click', '.auto-complete-suggestions', (event) => {
      this.handleAutoCompleteClick(event);
    });
  }

  /**
   * Initialize auto-complete functionality
   * @private
   */
  initializeAutoComplete() {
    this.autoCompleteEngine = {
      suggestions: [],
      currentIndex: -1,

      generateSuggestions: (input) => {
        const suggestions = [];
        const inputLower = input.toLowerCase();

        // Add pattern-based suggestions
        Object.values(this.selectorPatterns).flat().forEach(pattern => {
          if (pattern.toLowerCase().includes(inputLower)) {
            suggestions.push({
              text: pattern,
              type: 'pattern',
              description: this.getPatternDescription(pattern)
            });
          }
        });

        // Add completion suggestions for partial input
        if (input.endsWith('.')) {
          suggestions.push(
            { text: input + 'container', type: 'class', description: 'Common container class' },
            { text: input + 'active', type: 'class', description: 'Active state class' },
            { text: input + 'hidden', type: 'class', description: 'Hidden element class' }
          );
        }

        if (input.endsWith('#')) {
          suggestions.push(
            { text: input + 'header', type: 'id', description: 'Header element ID' },
            { text: input + 'main', type: 'id', description: 'Main content ID' },
            { text: input + 'footer', type: 'id', description: 'Footer element ID' }
          );
        }

        return suggestions.slice(0, 8); // Limit to 8 suggestions
      }
    };
  }

  /**
   * Handle selector input changes
   * @param {string} value - Current input value
   * @private
   */
  handleSelectorInput(value) {
    this.state.currentSelector = value;

    // Validate selector
    this.validateSelector(value);

    // Show auto-complete if enabled
    if (this.options.enableAutoComplete && value.trim()) {
      this.showAutoComplete(value);
    } else {
      this.hideAutoComplete();
    }

    // Auto-run selector if it's valid and not too complex
    if (this.isValidSelector(value) && value.length > 0 && !this.isComplexSelector(value)) {
      this.debounce(() => this.runSelector(value), 300);
    }
  }

  /**
   * Handle keyboard input for auto-complete navigation
   * @param {Event} event - Keyboard event
   * @private
   */
  handleKeyboardInput(event) {
    const autoComplete = this.container.querySelector('#auto-complete-suggestions');

    if (!autoComplete || autoComplete.classList.contains('hidden')) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.runCurrentSelector();
      }
      return;
    }

    const suggestions = autoComplete.querySelectorAll('.suggestion-item');

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.autoCompleteEngine.currentIndex = Math.min(
          this.autoCompleteEngine.currentIndex + 1,
          suggestions.length - 1
        );
        this.updateAutoCompleteSelection();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.autoCompleteEngine.currentIndex = Math.max(
          this.autoCompleteEngine.currentIndex - 1,
          -1
        );
        this.updateAutoCompleteSelection();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.autoCompleteEngine.currentIndex >= 0) {
          this.applySuggestion(suggestions[this.autoCompleteEngine.currentIndex]);
        } else {
          this.runCurrentSelector();
        }
        break;

      case 'Escape':
        this.hideAutoComplete();
        break;
    }
  }

  /**
   * Validate CSS selector syntax
   * @param {string} selector - Selector to validate
   * @private
   */
  validateSelector(selector) {
    const validationStatus = this.container.querySelector('#validation-status');

    if (!selector.trim()) {
      this.updateValidationStatus('neutral', '✏️', 'Enter a selector to validate');
      return;
    }

    // Check for common mistakes
    const mistakes = this.commonMistakes.filter(mistake =>
      mistake.pattern.test(selector)
    );

    if (mistakes.length > 0) {
      this.updateValidationStatus('error', '❌', mistakes[0].message);
      return;
    }

    // Try to use the selector
    try {
      document.querySelectorAll(selector);
      this.updateValidationStatus('success', '✅', 'Valid selector');
    } catch (error) {
      this.updateValidationStatus('error', '❌', `Invalid syntax: ${error.message}`);
    }
  }

  /**
   * Update validation status display
   * @param {string} type - Status type (success, error, neutral)
   * @param {string} icon - Status icon
   * @param {string} message - Status message
   * @private
   */
  updateValidationStatus(type, icon, message) {
    const statusElement = this.container.querySelector('#validation-status');
    const iconElement = statusElement.querySelector('.status-icon');
    const textElement = statusElement.querySelector('.status-text');

    statusElement.className = `validation-status ${type}`;
    iconElement.textContent = icon;
    textElement.textContent = message;
  }

  /**
   * Check if selector is valid
   * @param {string} selector - Selector to check
   * @returns {boolean} Whether selector is valid
   * @private
   */
  isValidSelector(selector) {
    try {
      document.querySelectorAll(selector);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if selector is complex (to avoid auto-running expensive queries)
   * @param {string} selector - Selector to check
   * @returns {boolean} Whether selector is complex
   * @private
   */
  isComplexSelector(selector) {
    // Consider selectors complex if they contain multiple descendant combinators
    // or complex pseudo-selectors
    return selector.includes('*') ||
           (selector.match(/\s/g) || []).length > 3 ||
           selector.includes(':nth-child') ||
           selector.includes(':nth-of-type');
  }

  /**
   * Run the current selector
   */
  runCurrentSelector() {
    const selector = this.state.currentSelector.trim();
    if (selector) {
      this.runSelector(selector);
    }
  }

  /**
   * Run a CSS selector and display results
   * @param {string} selector - CSS selector to run
   */
  runSelector(selector) {
    if (!this.isValidSelector(selector)) {
      console.warn('Invalid selector:', selector);
      return;
    }

    const startTime = performance.now();

    try {
      // Clear previous highlights
      this.clearHighlights();

      // Execute selector
      const elements = document.querySelectorAll(selector);
      const endTime = performance.now();
      const queryTime = endTime - startTime;

      // Update state
      this.state.results = Array.from(elements);

      // Record performance data
      this.recordPerformanceData(selector, queryTime, elements.length);

      // Add to history
      this.addToHistory(selector, elements.length, queryTime);

      // Display results
      this.displayResults(elements, queryTime);

      // Highlight elements if enabled
      if (this.options.enableHighlighting) {
        this.highlightElements(elements);
      }

      // Analyze selector
      this.analyzeSelector(selector, elements, queryTime);

      // Emit event
      this.dispatchEvent('selector:query', {
        selector,
        elementCount: elements.length,
        queryTime
      });

      console.log(`🎯 Selector "${selector}" found ${elements.length} elements in ${queryTime.toFixed(2)}ms`);

    } catch (error) {
      this.displayError(selector, error);
      console.error('Selector error:', error);
    }
  }

  /**
   * Display query results
   * @param {NodeList} elements - Found elements
   * @param {number} queryTime - Query execution time
   * @private
   */
  displayResults(elements, queryTime) {
    const resultsList = this.container.querySelector('#results-list');
    const resultCount = this.container.querySelector('.result-count');
    const queryTimeDisplay = this.container.querySelector('.query-time');

    // Update summary
    resultCount.textContent = `${elements.length} element${elements.length !== 1 ? 's' : ''} found`;
    queryTimeDisplay.textContent = `${queryTime.toFixed(2)}ms`;

    if (elements.length === 0) {
      resultsList.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🚫</div>
          <p>No elements match this selector</p>
          <div class="suggestions">
            <p>Try:</p>
            <ul>
              <li>Checking your selector syntax</li>
              <li>Using a more general selector</li>
              <li>Testing with simpler selectors first</li>
            </ul>
          </div>
        </div>
      `;
      return;
    }

    // Limit results for performance
    const displayElements = Array.from(elements).slice(0, this.options.maxResults);
    const hasMore = elements.length > this.options.maxResults;

    const resultsHTML = displayElements.map((element, index) => {
      const tagName = element.tagName.toLowerCase();
      const id = element.id ? `#${element.id}` : '';
      const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
      const path = this.generateElementPath(element);

      return `
        <div class="result-item" data-element-index="${index}">
          <div class="result-header">
            <div class="result-identity">
              <span class="result-tag">&lt;${tagName}&gt;</span>
              ${id ? `<span class="result-id">${id}</span>` : ''}
              ${classes ? `<span class="result-classes">${classes}</span>` : ''}
            </div>
            <div class="result-actions">
              <button class="result-action" data-action="highlight" title="Highlight">🎯</button>
              <button class="result-action" data-action="inspect" title="Inspect">🔍</button>
              <button class="result-action" data-action="scroll" title="Scroll to">📍</button>
            </div>
          </div>

          <div class="result-details">
            <div class="result-path">${path}</div>
            ${element.textContent.trim() ? `
              <div class="result-text">
                ${element.textContent.trim().substring(0, 100)}${element.textContent.trim().length > 100 ? '...' : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    resultsList.innerHTML = `
      <div class="results-grid">
        ${resultsHTML}
        ${hasMore ? `
          <div class="results-more">
            <p>Showing ${displayElements.length} of ${elements.length} results</p>
            <button class="show-all-btn" onclick="this.closest('.selector-tester').selectorTester.showAllResults()">
              Show All Results
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Display query error
   * @param {string} selector - Failed selector
   * @param {Error} error - Error object
   * @private
   */
  displayError(selector, error) {
    const resultsList = this.container.querySelector('#results-list');

    resultsList.innerHTML = `
      <div class="query-error">
        <div class="error-icon">⚠️</div>
        <h4>Query Error</h4>
        <p class="error-message">${error.message}</p>
        <div class="error-details">
          <p><strong>Selector:</strong> <code>${selector}</code></p>
          <p><strong>Suggestion:</strong> Check your selector syntax and try again</p>
        </div>
      </div>
    `;
  }

  /**
   * Highlight found elements
   * @param {NodeList} elements - Elements to highlight
   * @private
   */
  highlightElements(elements) {
    this.clearHighlights();

    Array.from(elements).forEach((element, index) => {
      const highlight = document.createElement('div');
      highlight.className = 'selector-highlight';
      highlight.innerHTML = `
        <div class="highlight-overlay"></div>
        <div class="highlight-label">${index + 1}</div>
      `;

      // Position highlight over element
      const rect = element.getBoundingClientRect();
      highlight.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        pointer-events: none;
        z-index: 10000;
        border: 2px solid #ff4081;
        background: rgba(255, 64, 129, 0.1);
        box-sizing: border-box;
      `;

      document.body.appendChild(highlight);
      this.state.highlightedElements.add(highlight);

      // Add pulse animation
      highlight.animate([
        { opacity: 0.3 },
        { opacity: 0.8 },
        { opacity: 0.3 }
      ], {
        duration: 1000,
        iterations: 2
      });
    });

    // Auto-remove highlights after duration
    if (this.options.highlightDuration > 0) {
      setTimeout(() => {
        this.clearHighlights();
      }, this.options.highlightDuration);
    }
  }

  /**
   * Clear all element highlights
   */
  clearHighlights() {
    this.state.highlightedElements.forEach(highlight => {
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
    });
    this.state.highlightedElements.clear();
  }

  /**
   * Analyze selector performance and complexity
   * @param {string} selector - CSS selector
   * @param {NodeList} elements - Found elements
   * @param {number} queryTime - Query time in milliseconds
   * @private
   */
  analyzeSelector(selector, elements, queryTime) {
    const analysis = {
      complexity: this.analyzeComplexity(selector),
      performance: this.analyzePerformance(queryTime),
      specificity: this.calculateSpecificity(selector),
      optimization: this.suggestOptimizations(selector, elements.length, queryTime)
    };

    this.displayAnalysis(analysis);
  }

  /**
   * Analyze selector complexity
   * @param {string} selector - CSS selector
   * @returns {Object} Complexity analysis
   * @private
   */
  analyzeComplexity(selector) {
    const metrics = {
      length: selector.length,
      combinator: (selector.match(/[>+~\s]/g) || []).length,
      pseudoClasses: (selector.match(/:[a-zA-Z-]+/g) || []).length,
      attributes: (selector.match(/\[[^\]]+\]/g) || []).length,
      universal: selector.includes('*'),
      descendant: (selector.match(/\s+/g) || []).length
    };

    let complexityScore = 0;
    complexityScore += metrics.length * 0.1;
    complexityScore += metrics.combinator * 2;
    complexityScore += metrics.pseudoClasses * 1.5;
    complexityScore += metrics.attributes * 1;
    complexityScore += metrics.universal ? 5 : 0;
    complexityScore += metrics.descendant * 1;

    let level = 'Simple';
    if (complexityScore > 15) level = 'Very Complex';
    else if (complexityScore > 10) level = 'Complex';
    else if (complexityScore > 5) level = 'Moderate';

    return {
      score: Math.round(complexityScore),
      level,
      metrics
    };
  }

  /**
   * Analyze query performance
   * @param {number} queryTime - Query time in milliseconds
   * @returns {Object} Performance analysis
   * @private
   */
  analyzePerformance(queryTime) {
    let rating = 'Very Poor';
    let color = '#f44336';

    if (queryTime < this.performanceBenchmarks.excellent) {
      rating = 'Excellent';
      color = '#4caf50';
    } else if (queryTime < this.performanceBenchmarks.good) {
      rating = 'Good';
      color = '#8bc34a';
    } else if (queryTime < this.performanceBenchmarks.acceptable) {
      rating = 'Acceptable';
      color = '#ff9800';
    } else if (queryTime < this.performanceBenchmarks.slow) {
      rating = 'Slow';
      color = '#ff5722';
    }

    return {
      rating,
      color,
      time: queryTime,
      benchmark: this.getBenchmarkText(queryTime)
    };
  }

  /**
   * Calculate CSS selector specificity
   * @param {string} selector - CSS selector
   * @returns {Object} Specificity calculation
   * @private
   */
  calculateSpecificity(selector) {
    // Simple specificity calculation
    const ids = (selector.match(/#[a-zA-Z][\w-]*/g) || []).length;
    const classes = (selector.match(/\.[a-zA-Z][\w-]*/g) || []).length;
    const attributes = (selector.match(/\[[^\]]+\]/g) || []).length;
    const pseudoClasses = (selector.match(/:[a-zA-Z-]+(?:\([^)]*\))?/g) || []).length;
    const elements = (selector.match(/\b[a-zA-Z]+\b/g) || []).filter(match =>
      !['not', 'is', 'where'].includes(match)
    ).length;

    const specificity = (ids * 100) + ((classes + attributes + pseudoClasses) * 10) + elements;

    return {
      value: specificity,
      breakdown: {
        ids,
        classes: classes + attributes + pseudoClasses,
        elements
      },
      notation: `${ids}.${classes + attributes + pseudoClasses}.${elements}`
    };
  }

  /**
   * Suggest optimizations for selector
   * @param {string} selector - CSS selector
   * @param {number} elementCount - Number of elements found
   * @param {number} queryTime - Query time
   * @returns {Array} Array of optimization suggestions
   * @private
   */
  suggestOptimizations(selector, elementCount, queryTime) {
    const suggestions = [];

    // Performance-based suggestions
    if (queryTime > this.performanceBenchmarks.slow) {
      suggestions.push({
        type: 'performance',
        message: 'Consider using more specific selectors to improve performance',
        priority: 'high'
      });
    }

    if (selector.includes('*')) {
      suggestions.push({
        type: 'performance',
        message: /**
      * SelectorTester - Interactive CSS Selector Testing and Learning Tool
      *
      * Provides a comprehensive environment for testing CSS selectors with real-time
      * visual feedback, performance metrics, and educational guidance for selector optimization.
      *
      * @fileoverview CSS selector testing component for DOM manipulation learning
      * @version 1.0.0
      */})
    }
  }
}
