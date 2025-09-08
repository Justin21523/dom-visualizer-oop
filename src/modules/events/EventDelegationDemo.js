/**
 * EventDelegationDemo - Interactive demonstration of event delegation patterns
 *
 * This component teaches the powerful event delegation pattern through practical
 * examples, showing how to handle events efficiently for dynamic content.
 *
 * Educational Goals:
 * - Understand event delegation benefits
 * - Learn to handle dynamic element events
 * - Compare delegation vs individual listeners
 * - Practice with event.target and event.currentTarget
 *
 * @author DOM Visualizer OOP Team
 * @version 1.0.0
 */

/**
 * EventDelegationDemo Class
 * Creates interactive examples of event delegation in action
 */
export class EventDelegationDemo {
  /**
   * Initialize the Event Delegation Demo
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('Valid container element is required');
    }

    this.container = container;
    this.options = {
      allowDynamicElements: true,
      showDelegationBenefits: true,
      enablePerformanceComparison: true,
      maxElements: 100,
      theme: 'light',
      debugMode: false,
      ...options
    };

    // Component state
    this.isInitialized = false;
    this.isActive = false;
    this.elementCounter = 0;
    this.delegatedElements = new Set();
    this.individualListeners = new Map();

    // Performance tracking
    this.performanceMetrics = {
      delegationTime: 0,
      individualTime: 0,
      memoryUsage: {
        delegation: 0,
        individual: 0
      },
      eventCount: 0
    };

    // DOM references
    this.delegationContainer = null;
    this.individualContainer = null;
    this.metricsDisplay = null;

    console.log(
      '🎯 EventDelegationDemo initialized with options:',
      this.options
    );
  }

  /**
   * Initialize the demonstration
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ EventDelegationDemo already initialized');
      return;
    }

    console.log('🚀 Initializing Event Delegation Demo...');

    try {
      // Setup component structure
      this.setupStructure();

      // Create delegation examples
      this.createDelegationExample();

      // Create individual listener examples
      this.createIndividualExample();

      // Setup controls
      this.setupControls();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('✅ Event Delegation Demo initialized');

      this.emit('demo:initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Event Delegation Demo:', error);
      throw error;
    }
  }

  /**
   * Setup the basic component structure
   * @private
   */
  setupStructure() {
    this.container.className = 'event-delegation-demo';

    this.container.innerHTML = `
      <div class="demo-header">
        <h3>Event Delegation vs Individual Listeners</h3>
        <p class="description">
          Compare event delegation patterns with individual event listeners.
          See the performance benefits of delegation with dynamic content.
        </p>
      </div>

      <div class="demo-content">
        <div class="comparison-section">

          <!-- Event Delegation Example -->
          <div class="demo-panel delegation-panel">
            <div class="panel-header">
              <h4>🎯 Event Delegation</h4>
              <p>One listener on parent handles all child events</p>
            </div>

            <div class="demo-container delegation-container">
              <div class="parent-element" id="delegation-parent">
                <div class="parent-label">Parent Container (with delegation)</div>
                <div class="children-container" id="delegation-children">
                  <!-- Dynamic children will be added here -->
                </div>
              </div>
            </div>

            <div class="stats delegation-stats">
              <div class="stat-item">
                <span class="stat-label">Event Listeners:</span>
                <span class="stat-value" id="delegation-listeners">1</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Elements:</span>
                <span class="stat-value" id="delegation-elements">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg Response:</span>
                <span class="stat-value" id="delegation-time">0ms</span>
              </div>
            </div>
          </div>

          <!-- Individual Listeners Example -->
          <div class="demo-panel individual-panel">
            <div class="panel-header">
              <h4>👥 Individual Listeners</h4>
              <p>Each element has its own event listener</p>
            </div>

            <div class="demo-container individual-container">
              <div class="parent-element" id="individual-parent">
                <div class="parent-label">Parent Container (individual listeners)</div>
                <div class="children-container" id="individual-children">
                  <!-- Dynamic children will be added here -->
                </div>
              </div>
            </div>

            <div class="stats individual-stats">
              <div class="stat-item">
                <span class="stat-label">Event Listeners:</span>
                <span class="stat-value" id="individual-listeners">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Elements:</span>
                <span class="stat-value" id="individual-elements">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg Response:</span>
                <span class="stat-value" id="individual-time">0ms</span>
              </div>
            </div>
          </div>
        </div>

        <div class="controls-section">
          <div class="control-group">
            <h4>Demo Controls</h4>

            <div class="button-group">
              <button class="btn btn-primary" id="add-element">
                ➕ Add Element
              </button>
              <button class="btn btn-secondary" id="add-multiple">
                ➕ Add 10 Elements
              </button>
              <button class="btn btn-warning" id="remove-element">
                ➖ Remove Element
              </button>
              <button class="btn btn-danger" id="clear-all">
                🗑️ Clear All
              </button>
            </div>

            <div class="button-group">
              <button class="btn btn-info" id="stress-test">
                ⚡ Stress Test (100 elements)
              </button>
              <button class="btn btn-success" id="demo-interactions">
                🎬 Demo Interactions
              </button>
            </div>
          </div>

          <div class="explanation-panel">
            <h4>💡 Key Concepts</h4>
            <div class="concept-list">
              <div class="concept-item">
                <strong>Event Delegation:</strong>
                Uses event bubbling to handle events at a parent level
              </div>
              <div class="concept-item">
                <strong>Performance:</strong>
                Fewer listeners = less memory usage and faster setup
              </div>
              <div class="concept-item">
                <strong>Dynamic Content:</strong>
                Works automatically with newly added elements
              </div>
              <div class="concept-item">
                <strong>event.target:</strong>
                The actual element that triggered the event
              </div>
              <div class="concept-item">
                <strong>event.currentTarget:</strong>
                The element with the event listener attached
              </div>
            </div>
          </div>
        </div>

        <div class="performance-section">
          <h4>📊 Performance Comparison</h4>
          <div class="metrics-display" id="metrics-display">
            <div class="metric-chart">
              <canvas id="performance-chart" width="400" height="200"></canvas>
            </div>
            <div class="metric-summary">
              <div class="summary-item">
                <span class="metric-label">Memory Efficiency:</span>
                <span class="metric-value" id="memory-efficiency">-</span>
              </div>
              <div class="summary-item">
                <span class="metric-label">Setup Time Ratio:</span>
                <span class="metric-value" id="setup-ratio">-</span>
              </div>
              <div class="summary-item">
                <span class="metric-label">Total Events Handled:</span>
                <span class="metric-value" id="total-events">0</span>
              </div>
            </div>
          </div>
        </div>

        <div class="code-example-section">
          <h4>💻 Code Examples</h4>
          <div class="code-examples">
            <div class="code-example delegation-code">
              <h5>Event Delegation Pattern</h5>
              <pre><code class="language-javascript">// Event delegation - one listener handles all
parent.addEventListener('click', function(event) {
  if (event.target.matches('.child-button')) {
    console.log('Clicked:', event.target.textContent);
    // Handle click on any child button
  }
});

// Adding new elements works automatically
const newButton = document.createElement('button');
newButton.className = 'child-button';
newButton.textContent = 'New Button';
parent.appendChild(newButton); // No need to add listener!</code></pre>
            </div>

            <div class="code-example individual-code">
              <h5>Individual Listeners Pattern</h5>
              <pre><code class="language-javascript">// Individual listeners - one per element
buttons.forEach(button => {
  button.addEventListener('click', function(event) {
    console.log('Clicked:', event.target.textContent);
  });
});

// Adding new elements requires manual listener setup
const newButton = document.createElement('button');
newButton.textContent = 'New Button';
newButton.addEventListener('click', handleClick); // Manual setup required
parent.appendChild(newButton);</code></pre>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create event delegation example
   * @private
   */
  createDelegationExample() {
    this.delegationContainer = this.container.querySelector(
      '#delegation-children'
    );
    const parent = this.container.querySelector('#delegation-parent');

    // Setup delegation listener on parent
    parent.addEventListener('click', event => {
      const startTime = performance.now();

      if (event.target.matches('.demo-button')) {
        this.handleDelegatedClick(event);
      }

      const endTime = performance.now();
      this.recordPerformance('delegation', endTime - startTime);
    });

    // Also handle other event types for demonstration
    parent.addEventListener('mouseover', event => {
      if (event.target.matches('.demo-button')) {
        this.highlightElement(event.target, 'delegation');
      }
    });

    parent.addEventListener('mouseout', event => {
      if (event.target.matches('.demo-button')) {
        this.unhighlightElement(event.target);
      }
    });

    console.log('🎯 Event delegation setup complete');
  }

  /**
   * Create individual listeners example
   * @private
   */
  createIndividualExample() {
    this.individualContainer = this.container.querySelector(
      '#individual-children'
    );
    console.log('👥 Individual listeners container ready');
  }

  /**
   * Setup control event listeners
   * @private
   */
  setupControls() {
    const addElementBtn = this.container.querySelector('#add-element');
    const addMultipleBtn = this.container.querySelector('#add-multiple');
    const removeElementBtn = this.container.querySelector('#remove-element');
    const clearAllBtn = this.container.querySelector('#clear-all');
    const stressTestBtn = this.container.querySelector('#stress-test');
    const demoInteractionsBtn =
      this.container.querySelector('#demo-interactions');

    addElementBtn.addEventListener('click', () => this.addElement());
    addMultipleBtn.addEventListener('click', () =>
      this.addMultipleElements(10)
    );
    removeElementBtn.addEventListener('click', () => this.removeElement());
    clearAllBtn.addEventListener('click', () => this.clearAllElements());
    stressTestBtn.addEventListener('click', () => this.runStressTest());
    demoInteractionsBtn.addEventListener('click', () =>
      this.demoInteractions()
    );
  }

  /**
   * Setup performance monitoring
   * @private
   */
  setupPerformanceMonitoring() {
    this.metricsDisplay = this.container.querySelector('#metrics-display');

    // Initialize performance chart
    const canvas = this.container.querySelector('#performance-chart');
    this.chartCtx = canvas.getContext('2d');

    this.updatePerformanceDisplay();
  }

  /**
   * Setup general event listeners
   * @private
   */
  setupEventListeners() {
    // Window resize for chart updates
    window.addEventListener('resize', () => this.updatePerformanceChart());
  }

  /**
   * Add a single element to both containers
   */
  addElement() {
    this.elementCounter++;
    const elementId = `element-${this.elementCounter}`;

    // Add to delegation container
    this.addElementToDelegation(elementId);

    // Add to individual container
    this.addElementToIndividual(elementId);

    this.updateStats();
    this.updatePerformanceDisplay();

    this.emit('element:added', { elementId, count: this.elementCounter });
  }

  /**
   * Add element to delegation container
   * @param {string} elementId - Element identifier
   * @private
   */
  addElementToDelegation(elementId) {
    const element = document.createElement('button');
    element.className = 'demo-button delegation-item';
    element.dataset.id = elementId;
    element.innerHTML = `
      <span class="button-text">Button ${this.elementCounter}</span>
      <span class="button-type">Delegated</span>
    `;

    this.delegationContainer.appendChild(element);
    this.delegatedElements.add(elementId);
  }

  /**
   * Add element to individual container with its own listener
   * @param {string} elementId - Element identifier
   * @private
   */
  addElementToIndividual(elementId) {
    const startTime = performance.now();

    const element = document.createElement('button');
    element.className = 'demo-button individual-item';
    element.dataset.id = elementId;
    element.innerHTML = `
      <span class="button-text">Button ${this.elementCounter}</span>
      <span class="button-type">Individual</span>
    `;

    // Add individual click listener
    const clickHandler = event => {
      const handlerStartTime = performance.now();
      this.handleIndividualClick(event);
      const handlerEndTime = performance.now();
      this.recordPerformance('individual', handlerEndTime - handlerStartTime);
    };

    const mouseoverHandler = event => {
      this.highlightElement(event.target, 'individual');
    };

    const mouseoutHandler = event => {
      this.unhighlightElement(event.target);
    };

    element.addEventListener('click', clickHandler);
    element.addEventListener('mouseover', mouseoverHandler);
    element.addEventListener('mouseout', mouseoutHandler);

    // Store listeners for cleanup
    this.individualListeners.set(elementId, {
      element,
      listeners: [
        { event: 'click', handler: clickHandler },
        { event: 'mouseover', handler: mouseoverHandler },
        { event: 'mouseout', handler: mouseoutHandler }
      ]
    });

    this.individualContainer.appendChild(element);

    const endTime = performance.now();
    this.recordSetupTime('individual', endTime - startTime);
  }

  /**
   * Add multiple elements at once
   * @param {number} count - Number of elements to add
   */
  async addMultipleElements(count) {
    const startTime = performance.now();

    for (let i = 0; i < count; i++) {
      this.addElement();

      // Small delay for visual effect
      if (i % 5 === 0) {
        await this.delay(50);
      }
    }

    const endTime = performance.now();
    console.log(
      `⚡ Added ${count} elements in ${(endTime - startTime).toFixed(2)}ms`
    );

    this.emit('elements:batch-added', { count, duration: endTime - startTime });
  }

  /**
   * Remove the last element from both containers
   */
  removeElement() {
    if (this.elementCounter === 0) return;

    const elementId = `element-${this.elementCounter}`;

    // Remove from delegation container
    const delegatedElement = this.delegationContainer.querySelector(
      `[data-id="${elementId}"]`
    );
    if (delegatedElement) {
      delegatedElement.remove();
      this.delegatedElements.delete(elementId);
    }

    // Remove from individual container with cleanup
    const individualData = this.individualListeners.get(elementId);
    if (individualData) {
      // Remove all event listeners
      individualData.listeners.forEach(({ event, handler }) => {
        individualData.element.removeEventListener(event, handler);
      });

      // Remove element
      individualData.element.remove();

      // Clean up references
      this.individualListeners.delete(elementId);
    }

    this.elementCounter--;
    this.updateStats();
    this.updatePerformanceDisplay();

    this.emit('element:removed', { elementId });
  }

  /**
   * Clear all elements
   */
  clearAllElements() {
    // Clear delegation container
    this.delegationContainer.innerHTML = '';
    this.delegatedElements.clear();

    // Clear individual container with proper cleanup
    this.individualListeners.forEach((data, elementId) => {
      data.listeners.forEach(({ event, handler }) => {
        data.element.removeEventListener(event, handler);
      });
    });

    this.individualContainer.innerHTML = '';
    this.individualListeners.clear();

    this.elementCounter = 0;
    this.resetPerformanceMetrics();
    this.updateStats();
    this.updatePerformanceDisplay();

    this.emit('elements:cleared');
  }

  /**
   * Run stress test with many elements
   */
  async runStressTest() {
    console.log('⚡ Starting stress test...');

    const stressCount = 100;
    const startTime = performance.now();

    // Clear existing elements first
    this.clearAllElements();

    // Add elements rapidly
    await this.addMultipleElements(stressCount);

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(
      `🏁 Stress test completed: ${stressCount} elements in ${duration.toFixed(2)}ms`
    );

    // Demonstrate the difference in memory usage
    this.showMemoryComparison();

    this.emit('stress-test:completed', {
      elementCount: stressCount,
      duration,
      delegationListeners: 1,
      individualListeners: this.individualListeners.size
    });
  }

  /**
   * Demonstrate automatic interactions
   */
  async demoInteractions() {
    console.log('🎬 Starting interaction demonstration...');

    if (this.elementCounter === 0) {
      await this.addMultipleElements(5);
    }

    const buttons = this.container.querySelectorAll('.demo-button');

    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      await this.delay(300);

      // Simulate click on random button
      const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
      if (randomButton) {
        this.simulateClick(randomButton);
      }
    }

    console.log('✅ Interaction demonstration completed');
  }

  /**
   * Handle delegated click events
   * @param {Event} event - Click event
   * @private
   */
  handleDelegatedClick(event) {
    const button = event.target.closest('.demo-button');
    const elementId = button.dataset.id;

    this.showClickFeedback(button, 'delegation');
    this.logEvent(
      '🎯 Delegated click',
      elementId,
      event.target,
      event.currentTarget
    );

    this.performanceMetrics.eventCount++;

    this.emit('delegation:demonstrated', {
      delegator: event.currentTarget,
      target: event.target,
      elementId
    });
  }

  /**
   * Handle individual click events
   * @param {Event} event - Click event
   * @private
   */
  handleIndividualClick(event) {
    const button = event.target.closest('.demo-button');
    const elementId = button.dataset.id;

    this.showClickFeedback(button, 'individual');
    this.logEvent(
      '👤 Individual click',
      elementId,
      event.target,
      event.currentTarget
    );

    this.performanceMetrics.eventCount++;
  }

  /**
   * Show visual feedback for clicks
   * @param {HTMLElement} element - Clicked element
   * @param {string} type - Type of handler (delegation/individual)
   * @private
   */
  showClickFeedback(element, type) {
    // Add visual feedback class
    element.classList.add('clicked', type);

    // Create ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    element.appendChild(ripple);

    // Remove feedback after animation
    setTimeout(() => {
      element.classList.remove('clicked', type);
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 500);
  }

  /**
   * Highlight element on hover
   * @param {HTMLElement} element - Element to highlight
   * @param {string} type - Type of handler
   * @private
   */
  highlightElement(element, type) {
    element.classList.add('highlighted', type);
  }

  /**
   * Remove highlight from element
   * @param {HTMLElement} element - Element to unhighlight
   * @private
   */
  unhighlightElement(element) {
    element.classList.remove('highlighted', 'delegation', 'individual');
  }

  /**
   * Simulate click on element
   * @param {HTMLElement} element - Element to click
   * @private
   */
  simulateClick(element) {
    // Visual indication
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.1s ease';

    setTimeout(() => {
      element.style.transform = '';

      // Trigger actual click
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      element.dispatchEvent(clickEvent);
    }, 100);
  }

  /**
   * Log event details for educational purposes
   * @param {string} type - Event type description
   * @param {string} elementId - Element identifier
   * @param {HTMLElement} target - Event target
   * @param {HTMLElement} currentTarget - Event current target
   * @private
   */
  logEvent(type, elementId, target, currentTarget) {
    if (this.options.debugMode) {
      console.log(`${type}:`, {
        elementId,
        target: target.tagName,
        currentTarget: currentTarget.tagName,
        targetIsCurrentTarget: target === currentTarget
      });
    }
  }

  /**
   * Record performance metrics
   * @param {string} type - Performance type (delegation/individual)
   * @param {number} time - Execution time in milliseconds
   * @private
   */
  recordPerformance(type, time) {
    if (type === 'delegation') {
      this.performanceMetrics.delegationTime =
        (this.performanceMetrics.delegationTime + time) / 2;
    } else {
      this.performanceMetrics.individualTime =
        (this.performanceMetrics.individualTime + time) / 2;
    }

    this.updatePerformanceDisplay();
  }

  /**
   * Record setup time for performance comparison
   * @param {string} type - Setup type
   * @param {number} time - Setup time in milliseconds
   * @private
   */
  recordSetupTime(type, time) {
    // This could be expanded to track setup performance differences
    if (this.options.debugMode) {
      console.log(`Setup time (${type}):`, time.toFixed(3), 'ms');
    }
  }

  /**
   * Update statistics display
   * @private
   */
  updateStats() {
    // Update delegation stats
    const delegationListeners = this.container.querySelector(
      '#delegation-listeners'
    );
    const delegationElements = this.container.querySelector(
      '#delegation-elements'
    );
    const delegationTime = this.container.querySelector('#delegation-time');

    if (delegationListeners) delegationListeners.textContent = '1';
    if (delegationElements)
      delegationElements.textContent = this.delegatedElements.size;
    if (delegationTime) {
      delegationTime.textContent = `${this.performanceMetrics.delegationTime.toFixed(2)}ms`;
    }

    // Update individual stats
    const individualListeners = this.container.querySelector(
      '#individual-listeners'
    );
    const individualElements = this.container.querySelector(
      '#individual-elements'
    );
    const individualTime = this.container.querySelector('#individual-time');

    if (individualListeners)
      individualListeners.textContent = this.individualListeners.size;
    if (individualElements)
      individualElements.textContent = this.individualListeners.size;
    if (individualTime) {
      individualTime.textContent = `${this.performanceMetrics.individualTime.toFixed(2)}ms`;
    }
  }

  /**
   * Update performance display
   * @private
   */
  updatePerformanceDisplay() {
    this.updateStats();
    this.updatePerformanceChart();
    this.updateMetricsSummary();
  }

  /**
   * Update performance chart
   * @private
   */
  updatePerformanceChart() {
    if (!this.chartCtx) return;

    const canvas = this.chartCtx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    this.chartCtx.clearRect(0, 0, width, height);

    // Draw background
    this.chartCtx.fillStyle = '#f8f9fa';
    this.chartCtx.fillRect(0, 0, width, height);

    // Draw chart data
    this.drawPerformanceChart(width, height);
  }

  /**
   * Draw performance comparison chart
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @private
   */
  drawPerformanceChart(width, height) {
    const ctx = this.chartCtx;
    const margin = 40;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();

    // Draw bars comparing delegation vs individual
    const barWidth = chartWidth / 4;
    const maxValue = Math.max(1, this.individualListeners.size);

    // Delegation bar (always 1 listener)
    const delegationHeight = (1 / maxValue) * chartHeight * 0.8;
    ctx.fillStyle = '#28a745';
    ctx.fillRect(
      margin + barWidth * 0.5,
      height - margin - delegationHeight,
      barWidth * 0.8,
      delegationHeight
    );

    // Individual listeners bar
    const individualHeight =
      (this.individualListeners.size / maxValue) * chartHeight * 0.8;
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(
      margin + barWidth * 2.5,
      height - margin - individualHeight,
      barWidth * 0.8,
      individualHeight
    );

    // Draw labels
    ctx.fillStyle = '#495057';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';

    ctx.fillText('Delegation', margin + barWidth * 0.9, height - margin + 20);
    ctx.fillText('Individual', margin + barWidth * 2.9, height - margin + 20);

    // Draw values
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui';

    if (delegationHeight > 20) {
      ctx.fillText(
        '1',
        margin + barWidth * 0.9,
        height - margin - delegationHeight / 2 + 5
      );
    }

    if (individualHeight > 20) {
      ctx.fillText(
        this.individualListeners.size.toString(),
        margin + barWidth * 2.9,
        height - margin - individualHeight / 2 + 5
      );
    }

    // Chart title
    ctx.fillStyle = '#495057';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Event Listeners Count', width / 2, 20);
  }

  /**
   * Update metrics summary
   * @private
   */
  updateMetricsSummary() {
    const memoryEfficiency = this.container.querySelector('#memory-efficiency');
    const setupRatio = this.container.querySelector('#setup-ratio');
    const totalEvents = this.container.querySelector('#total-events');

    if (memoryEfficiency) {
      const efficiency =
        this.individualListeners.size > 0
          ? (
              ((this.individualListeners.size - 1) /
                this.individualListeners.size) *
              100
            ).toFixed(1)
          : 0;
      memoryEfficiency.textContent = `${efficiency}% less memory`;
    }

    if (setupRatio) {
      const ratio =
        this.individualListeners.size > 0
          ? `1:${this.individualListeners.size}`
          : '1:0';
      setupRatio.textContent = ratio;
    }

    if (totalEvents) {
      totalEvents.textContent = this.performanceMetrics.eventCount;
    }
  }

  /**
   * Show memory comparison visualization
   * @private
   */
  showMemoryComparison() {
    const memoryDiff = this.individualListeners.size - 1; // Delegation uses only 1 listener

    console.log(`💾 Memory Comparison:
    📊 Delegation: 1 event listener
    📊 Individual: ${this.individualListeners.size} event listeners
    📊 Memory savings: ${memoryDiff} fewer listeners (${((memoryDiff / this.individualListeners.size) * 100).toFixed(1)}% reduction)`);
  }

  /**
   * Reset performance metrics
   * @private
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      delegationTime: 0,
      individualTime: 0,
      memoryUsage: {
        delegation: 0,
        individual: 0
      },
      eventCount: 0
    };
  }

  /**
   * Set theme
   * @param {string} theme - Theme name
   */
  setTheme(theme) {
    this.options.theme = theme;
    this.container.setAttribute('data-theme', theme);
  }

  /**
   * Handle resize events
   */
  handleResize() {
    // Update chart dimensions
    const canvas = this.container.querySelector('#performance-chart');
    if (canvas) {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.min(400, rect.width - 20);
      this.updatePerformanceChart();
    }
  }

  /**
   * Reset demonstration to initial state
   */
  reset() {
    console.log('🔄 Resetting Event Delegation Demo...');

    this.clearAllElements();
    this.resetPerformanceMetrics();
    this.updatePerformanceDisplay();

    this.emit('demo:reset');
  }

  /**
   * Deactivate the demonstration
   */
  deactivate() {
    console.log('⏸️ Deactivating Event Delegation Demo...');

    // Clean up all individual listeners
    this.individualListeners.forEach((data, elementId) => {
      data.listeners.forEach(({ event, handler }) => {
        data.element.removeEventListener(event, handler);
      });
    });

    this.isActive = false;
    this.emit('demo:deactivated');
  }

  /**
   * Utility delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
   * Add event listener with automatic cleanup tracking
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   */
  on(eventName, handler) {
    this.container.addEventListener(eventName, handler);
  }

  /**
   * Get current status
   * @returns {Object} Component status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      elementCount: this.elementCounter,
      delegatedElements: this.delegatedElements.size,
      individualListeners: this.individualListeners.size,
      performanceMetrics: { ...this.performanceMetrics },
      options: this.options
    };
  }

  /**
   * Export demonstration data
   * @param {string} format - Export format
   * @returns {string|Object} Exported data
   */
  exportData(format = 'json') {
    const data = {
      elementCount: this.elementCounter,
      performanceMetrics: this.performanceMetrics,
      comparison: {
        delegationListeners: 1,
        individualListeners: this.individualListeners.size,
        memoryEfficiency:
          this.individualListeners.size > 0
            ? (1 - 1 / this.individualListeners.size) * 100
            : 0
      },
      timestamp: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);

      case 'chart':
        return this.chartCtx.canvas.toDataURL('image/png');

      default:
        return data;
    }
  }

  /**
   * Destroy the component and clean up resources
   */
  destroy() {
    console.log('🗑️ Destroying Event Delegation Demo...');

    // Deactivate first
    if (this.isActive) {
      this.deactivate();
    }

    // Clear all elements and listeners
    this.clearAllElements();

    // Remove window listeners
    window.removeEventListener('resize', this.handleResize);

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove('event-delegation-demo');
    }

    // Reset state
    this.isInitialized = false;
    this.isActive = false;
    this.elementCounter = 0;
    this.delegatedElements.clear();
    this.individualListeners.clear();

    console.log('✅ Event Delegation Demo destroyed');
  }
}
