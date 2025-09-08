/** src/modules/events/EventFlowVisualizer.js */
/**
 * EventFlowVisualizer - Interactive visualization of event bubbling and capturing
 *
 * This component creates an educational demonstration of how events flow through
 * the DOM tree, showing both bubbling and capturing phases with animated paths.
 *
 * Educational Goals:
 * - Understand event flow phases (capturing, target, bubbling)
 * - Visualize event propagation paths
 * - Learn event.stopPropagation() effects
 * - Practice with event.preventDefault()
 *
 * @author DOM Visualizer OOP Team
 * @version 1.0.0
 */

/**
 * EventFlowVisualizer Class
 * Creates interactive DOM elements with visual event flow demonstration
 */
export class EventFlowVisualizer {
  /**
   * Initialize the Event Flow Visualizer
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('Valid container element is required');
    }

    this.container = container;
    this.options = {
      showBubblingPath: true,
      showCapturingPath: true,
      enableInteraction: true,
      animationSpeed: 'normal', // slow, normal, fast
      showEventDetails: true,
      enableStopPropagation: true,
      theme: 'light',
      debugMode: false,
      ...options
    };

    // Component state
    this.isInitialized = false;
    this.isActive = false;
    this.currentEventPath = [];
    this.eventCounter = 0;
    this.stopPropagationEnabled = false;
    this.preventDefaultEnabled = false;

    // DOM elements
    this.domTree = null;
    this.visualizationCanvas = null;
    this.controlPanel = null;
    this.eventLog = null;

    // Animation state
    this.activeAnimations = new Set();
    this.animationSpeed = this.getAnimationSpeed();

    // Event listeners for cleanup
    this.boundEventListeners = new Map();

    console.log(
      '🫧 EventFlowVisualizer initialized with options:',
      this.options
    );
  }

  /**
   * Initialize the visualizer
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ EventFlowVisualizer already initialized');
      return;
    }

    console.log('🚀 Initializing Event Flow Visualizer...');

    try {
      // Setup component structure
      this.setupStructure();

      // Create DOM tree visualization
      this.createDOMTreeVisualization();

      // Setup control panel
      this.setupControlPanel();

      // Setup event log
      this.setupEventLog();

      // Create visualization canvas
      this.createVisualizationCanvas();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('✅ Event Flow Visualizer initialized');

      // Emit initialization event
      this.emit('visualizer:initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Event Flow Visualizer:', error);
      throw error;
    }
  }

  /**
   * Setup the basic component structure
   * @private
   */
  setupStructure() {
    this.container.className = 'event-flow-visualizer';

    this.container.innerHTML = `
      <div class="visualizer-header">
        <h3>Event Flow Demonstration</h3>
        <p class="description">
          Click on any element to see how events bubble up and capture down through the DOM tree
        </p>
      </div>

      <div class="visualizer-content">
        <div class="dom-tree-section">
          <h4>DOM Tree Structure</h4>
          <div class="dom-tree-container">
            <!-- DOM tree will be created here -->
          </div>
        </div>

        <div class="controls-section">
          <div class="control-panel">
            <!-- Controls will be added here -->
          </div>

          <div class="event-log">
            <h4>Event Log</h4>
            <div class="log-container">
              <!-- Event log entries will appear here -->
            </div>
          </div>
        </div>
      </div>

      <div class="visualization-overlay">
        <canvas class="event-path-canvas" width="800" height="600"></canvas>
      </div>
    `;
  }

  /**
   * Create the DOM tree visualization
   * @private
   */
  createDOMTreeVisualization() {
    const treeContainer = this.container.querySelector('.dom-tree-container');

    // Create a sample DOM structure for demonstration
    treeContainer.innerHTML = `
      <div class="demo-tree">
        <div class="tree-node document-node" data-level="0" data-node="document">
          <span class="node-label">document</span>

          <div class="tree-node html-node" data-level="1" data-node="html">
            <span class="node-label">html</span>

            <div class="tree-node body-node" data-level="2" data-node="body">
              <span class="node-label">body</span>

              <div class="tree-node container-node" data-level="3" data-node="container">
                <span class="node-label">div.container</span>

                <div class="tree-node button-node" data-level="4" data-node="button">
                  <span class="node-label">button</span>
                  <button class="demo-button" id="demo-button">Click Me!</button>
                </div>

                <div class="tree-node input-node" data-level="4" data-node="input">
                  <span class="node-label">input</span>
                  <input type="text" class="demo-input" placeholder="Type here..." />
                </div>

                <div class="tree-node list-node" data-level="4" data-node="list">
                  <span class="node-label">ul.list</span>

                  <ul class="demo-list">
                    <li class="list-item" data-level="5" data-node="item1">
                      <span class="node-label">li (Item 1)</span>
                      <span class="demo-text">List Item 1</span>
                    </li>
                    <li class="list-item" data-level="5" data-node="item2">
                      <span class="node-label">li (Item 2)</span>
                      <span class="demo-text">List Item 2</span>
                    </li>
                    <li class="list-item" data-level="5" data-node="item3">
                      <span class="node-label">li (Item 3)</span>
                      <span class="demo-text">List Item 3</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.domTree = treeContainer.querySelector('.demo-tree');
  }

  /**
   * Setup control panel for interaction options
   * @private
   */
  setupControlPanel() {
    const controlPanel = this.container.querySelector('.control-panel');

    controlPanel.innerHTML = `
      <div class="control-group">
        <h4>Event Flow Options</h4>

        <label class="control-item">
          <input type="checkbox" id="show-capturing" ${this.options.showCapturingPath ? 'checked' : ''} />
          <span class="checkmark"></span>
          Show Capturing Phase
        </label>

        <label class="control-item">
          <input type="checkbox" id="show-bubbling" ${this.options.showBubblingPath ? 'checked' : ''} />
          <span class="checkmark"></span>
          Show Bubbling Phase
        </label>

        <label class="control-item">
          <input type="checkbox" id="stop-propagation" />
          <span class="checkmark"></span>
          Stop Propagation at Target
        </label>

        <label class="control-item">
          <input type="checkbox" id="prevent-default" />
          <span class="checkmark"></span>
          Prevent Default Action
        </label>
      </div>

      <div class="control-group">
        <h4>Animation Speed</h4>
        <div class="speed-controls">
          <button class="speed-btn" data-speed="slow">Slow</button>
          <button class="speed-btn active" data-speed="normal">Normal</button>
          <button class="speed-btn" data-speed="fast">Fast</button>
        </div>
      </div>

      <div class="control-group">
        <h4>Actions</h4>
        <button class="btn btn-primary" id="clear-log">Clear Log</button>
        <button class="btn btn-secondary" id="demo-events">Demo All Events</button>
        <button class="btn btn-info" id="explain-flow">Explain Flow</button>
      </div>

      <div class="legend">
        <h4>Legend</h4>
        <div class="legend-item">
          <span class="legend-color capturing"></span>
          <span>Capturing Phase</span>
        </div>
        <div class="legend-item">
          <span class="legend-color target"></span>
          <span>Target Phase</span>
        </div>
        <div class="legend-item">
          <span class="legend-color bubbling"></span>
          <span>Bubbling Phase</span>
        </div>
      </div>
    `;

    this.controlPanel = controlPanel;
  }

  /**
   * Setup event log display
   * @private
   */
  setupEventLog() {
    const logContainer = this.container.querySelector('.log-container');

    logContainer.innerHTML = `
      <div class="log-header">
        <span class="log-counter">Events: <span id="event-counter">0</span></span>
        <button class="clear-log-btn" title="Clear log">🗑️</button>
      </div>
      <div class="log-entries" id="log-entries">
        <div class="log-entry info">
          <span class="log-time">Ready</span>
          <span class="log-message">Click any element to see event flow</span>
        </div>
      </div>
    `;

    this.eventLog = logContainer;
  }

  /**
   * Create visualization canvas for animated paths
   * @private
   */
  createVisualizationCanvas() {
    const canvas = this.container.querySelector('.event-path-canvas');
    this.visualizationCanvas = canvas;

    // Setup canvas context
    this.ctx = canvas.getContext('2d');

    // Setup responsive canvas
    this.resizeCanvas();
  }

  /**
   * Setup all event listeners for the component
   * @private
   */
  setupEventListeners() {
    // Setup event listeners on all interactive elements
    this.setupDOMTreeEventListeners();

    // Setup control panel listeners
    this.setupControlPanelListeners();

    // Setup canvas resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Setup event listeners on DOM tree elements
   * @private
   */
  setupDOMTreeEventListeners() {
    const allNodes = this.domTree.querySelectorAll('.tree-node');

    allNodes.forEach(node => {
      const nodeId = node.dataset.node;

      // Add both capturing and bubbling listeners
      const capturingHandler = e => this.handleEvent(e, 'capturing', nodeId);
      const bubblingHandler = e => this.handleEvent(e, 'bubbling', nodeId);

      // Add capturing listener
      node.addEventListener('click', capturingHandler, true);

      // Add bubbling listener
      node.addEventListener('click', bubblingHandler, false);

      // Store for cleanup
      this.boundEventListeners.set(`${nodeId}-capturing`, {
        element: node,
        event: 'click',
        handler: capturingHandler,
        useCapture: true
      });

      this.boundEventListeners.set(`${nodeId}-bubbling`, {
        element: node,
        event: 'click',
        handler: bubblingHandler,
        useCapture: false
      });
    });

    // Special handling for form elements
    const demoInput = this.domTree.querySelector('.demo-input');
    if (demoInput) {
      const inputHandler = e => this.handleEvent(e, 'input', 'input');
      demoInput.addEventListener('input', inputHandler);

      this.boundEventListeners.set('input-input', {
        element: demoInput,
        event: 'input',
        handler: inputHandler,
        useCapture: false
      });
    }
  }

  /**
   * Setup control panel event listeners
   * @private
   */
  setupControlPanelListeners() {
    // Checkbox controls
    const showCapturing = this.controlPanel.querySelector('#show-capturing');
    const showBubbling = this.controlPanel.querySelector('#show-bubbling');
    const stopPropagation =
      this.controlPanel.querySelector('#stop-propagation');
    const preventDefault = this.controlPanel.querySelector('#prevent-default');

    showCapturing.addEventListener('change', e => {
      this.options.showCapturingPath = e.target.checked;
      this.emit('options:changed', { showCapturingPath: e.target.checked });
    });

    showBubbling.addEventListener('change', e => {
      this.options.showBubblingPath = e.target.checked;
      this.emit('options:changed', { showBubblingPath: e.target.checked });
    });

    stopPropagation.addEventListener('change', e => {
      this.stopPropagationEnabled = e.target.checked;
    });

    preventDefault.addEventListener('change', e => {
      this.preventDefaultEnabled = e.target.checked;
    });

    // Speed controls
    const speedButtons = this.controlPanel.querySelectorAll('.speed-btn');
    speedButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        speedButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const speed = e.target.dataset.speed;
        this.setAnimationSpeed(speed);
      });
    });

    // Action buttons
    const clearLogBtn = this.controlPanel.querySelector('#clear-log');
    const demoEventsBtn = this.controlPanel.querySelector('#demo-events');
    const explainFlowBtn = this.controlPanel.querySelector('#explain-flow');

    clearLogBtn.addEventListener('click', () => this.clearEventLog());
    demoEventsBtn.addEventListener('click', () => this.demoAllEvents());
    explainFlowBtn.addEventListener('click', () => this.explainEventFlow());

    // Log clear button
    const logClearBtn = this.eventLog.querySelector('.clear-log-btn');
    logClearBtn.addEventListener('click', () => this.clearEventLog());
  }

  /**
   * Handle events during flow demonstration
   * @param {Event} event - DOM event
   * @param {string} phase - Event phase (capturing, bubbling, input)
   * @param {string} nodeId - Node identifier
   * @private
   */
  handleEvent(event, phase, nodeId) {
    // Apply stop propagation if enabled
    if (this.stopPropagationEnabled && phase === 'bubbling') {
      event.stopPropagation();
      this.logEvent(`🛑 Stopped propagation at ${nodeId}`, 'warning');
    }

    // Apply prevent default if enabled
    if (this.preventDefaultEnabled) {
      event.preventDefault();
      this.logEvent(`🚫 Prevented default action`, 'info');
    }

    // Only show phases that are enabled
    if (phase === 'capturing' && !this.options.showCapturingPath) return;
    if (phase === 'bubbling' && !this.options.showBubblingPath) return;

    // Build event path for visualization
    const eventPath = this.buildEventPath(event.target, phase);

    // Log the event
    this.logEvent(
      `${this.getPhaseIcon(phase)} ${phase.toUpperCase()} phase - ${nodeId}`,
      phase
    );

    // Visualize the event flow
    this.visualizeEventFlow(eventPath, phase, nodeId);

    // Highlight current node
    this.highlightNode(nodeId, phase);

    // Emit educational events
    this.emitEducationalEvent(phase, nodeId, eventPath);
  }

  /**
   * Build event propagation path
   * @param {HTMLElement} target - Event target
   * @param {string} phase - Event phase
   * @returns {Array} Array of DOM nodes in propagation path
   * @private
   */
  buildEventPath(target, phase) {
    const path = [];
    let current = target;

    // Build path from target to document
    while (current && current !== document) {
      const nodeId = current.dataset?.node || current.tagName?.toLowerCase();
      if (nodeId) {
        path.push({
          element: current,
          nodeId,
          level: parseInt(current.dataset?.level) || 0
        });
      }
      current = current.parentElement;
    }

    // Add document
    path.push({
      element: document,
      nodeId: 'document',
      level: 0
    });

    // Reverse for capturing phase (document to target)
    if (phase === 'capturing') {
      return path.reverse();
    }

    // For bubbling phase, keep original order (target to document)
    return path;
  }

  /**
   * Visualize event flow with animated path
   * @param {Array} eventPath - Event propagation path
   * @param {string} phase - Event phase
   * @param {string} nodeId - Current node ID
   * @private
   */
  visualizeEventFlow(eventPath, phase, nodeId) {
    if (!this.visualizationCanvas) return;

    // Get node positions for drawing paths
    const positions = this.getNodePositions(eventPath);

    // Create animation for event flow
    this.animateEventPath(positions, phase, nodeId);
  }

  /**
   * Get screen positions of nodes for visualization
   * @param {Array} eventPath - Event path
   * @returns {Array} Array of position objects
   * @private
   */
  getNodePositions(eventPath) {
    const containerRect = this.container.getBoundingClientRect();

    return eventPath
      .map(pathNode => {
        const element = this.domTree.querySelector(
          `[data-node="${pathNode.nodeId}"]`
        );
        if (!element) return null;

        const rect = element.getBoundingClientRect();

        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
          nodeId: pathNode.nodeId,
          level: pathNode.level
        };
      })
      .filter(pos => pos !== null);
  }

  /**
   * Animate event path on canvas
   * @param {Array} positions - Node positions
   * @param {string} phase - Event phase
   * @param {string} currentNode - Current node ID
   * @private
   */
  animateEventPath(positions, phase, currentNode) {
    if (positions.length < 2) return;

    const animationId = `${phase}-${Date.now()}`;
    this.activeAnimations.add(animationId);

    const color = this.getPhaseColor(phase);
    let progress = 0;
    const duration = this.animationSpeed;
    const startTime = performance.now();

    const animate = currentTime => {
      if (!this.activeAnimations.has(animationId)) return;

      progress = Math.min((currentTime - startTime) / duration, 1);

      // Clear canvas
      this.ctx.clearRect(
        0,
        0,
        this.visualizationCanvas.width,
        this.visualizationCanvas.height
      );

      // Draw path
      this.drawEventPath(positions, progress, color, phase);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.activeAnimations.delete(animationId);

        // Clear path after delay
        setTimeout(() => {
          if (this.activeAnimations.size === 0) {
            this.ctx.clearRect(
              0,
              0,
              this.visualizationCanvas.width,
              this.visualizationCanvas.height
            );
          }
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Draw animated event path on canvas
   * @param {Array} positions - Node positions
   * @param {number} progress - Animation progress (0-1)
   * @param {string} color - Path color
   * @param {string} phase - Event phase
   * @private
   */
  drawEventPath(positions, progress, color, phase) {
    const ctx = this.ctx;

    // Set line style
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Calculate current drawing position
    const totalSegments = positions.length - 1;
    const currentSegment = Math.floor(progress * totalSegments);
    const segmentProgress = (progress * totalSegments) % 1;

    ctx.beginPath();

    // Draw completed segments
    for (let i = 0; i < currentSegment; i++) {
      if (i === 0) {
        ctx.moveTo(positions[i].x, positions[i].y);
      }
      ctx.lineTo(positions[i + 1].x, positions[i + 1].y);
    }

    // Draw current segment
    if (currentSegment < totalSegments) {
      const start = positions[currentSegment];
      const end = positions[currentSegment + 1];

      if (currentSegment === 0) {
        ctx.moveTo(start.x, start.y);
      }

      const currentX = start.x + (end.x - start.x) * segmentProgress;
      const currentY = start.y + (end.y - start.y) * segmentProgress;

      ctx.lineTo(currentX, currentY);
    }

    ctx.stroke();

    // Draw direction arrows
    this.drawDirectionArrows(positions, progress, color, phase);
  }

  /**
   * Draw direction arrows on the path
   * @param {Array} positions - Node positions
   * @param {number} progress - Animation progress
   * @param {string} color - Arrow color
   * @param {string} phase - Event phase
   * @private
   */
  drawDirectionArrows(positions, progress, color, phase) {
    const ctx = this.ctx;
    const arrowSize = 8;

    ctx.fillStyle = color;

    // Draw arrow at current position
    const totalSegments = positions.length - 1;
    const currentSegment = Math.floor(progress * totalSegments);
    const segmentProgress = (progress * totalSegments) % 1;

    if (currentSegment < totalSegments) {
      const start = positions[currentSegment];
      const end = positions[currentSegment + 1];

      const currentX = start.x + (end.x - start.x) * segmentProgress;
      const currentY = start.y + (end.y - start.y) * segmentProgress;

      // Calculate arrow direction
      const angle = Math.atan2(end.y - start.y, end.x - start.x);

      // Draw arrow
      ctx.save();
      ctx.translate(currentX, currentY);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-arrowSize, -arrowSize / 2);
      ctx.lineTo(-arrowSize, arrowSize / 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Highlight node during event processing
   * @param {string} nodeId - Node to highlight
   * @param {string} phase - Event phase
   * @private
   */
  highlightNode(nodeId, phase) {
    // Remove previous highlights
    this.domTree.querySelectorAll('.highlighted').forEach(el => {
      el.classList.remove('highlighted', 'capturing', 'bubbling', 'target');
    });

    // Add new highlight
    const node = this.domTree.querySelector(`[data-node="${nodeId}"]`);
    if (node) {
      node.classList.add('highlighted', phase);

      // Remove highlight after delay
      setTimeout(() => {
        node.classList.remove('highlighted', phase);
      }, this.animationSpeed);
    }
  }

  /**
   * Log event in the event log
   * @param {string} message - Log message
   * @param {string} type - Log type (info, warning, error, success)
   * @private
   */
  logEvent(message, type = 'info') {
    const logEntries = this.eventLog.querySelector('#log-entries');
    const timestamp = new Date().toLocaleTimeString();

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `
      <span class="log-time">${timestamp}</span>
      <span class="log-message">${message}</span>
    `;

    logEntries.appendChild(logEntry);

    // Scroll to bottom
    logEntries.scrollTop = logEntries.scrollHeight;

    // Update event counter
    this.eventCounter++;
    const counter = this.eventLog.querySelector('#event-counter');
    if (counter) {
      counter.textContent = this.eventCounter;
    }

    // Limit log entries to prevent memory issues
    const maxEntries = 100;
    while (logEntries.children.length > maxEntries) {
      logEntries.removeChild(logEntries.firstChild);
    }
  }

  /**
   * Clear event log
   */
  clearEventLog() {
    const logEntries = this.eventLog.querySelector('#log-entries');
    logEntries.innerHTML = `
      <div class="log-entry info">
        <span class="log-time">Ready</span>
        <span class="log-message">Click any element to see event flow</span>
      </div>
    `;

    this.eventCounter = 0;
    const counter = this.eventLog.querySelector('#event-counter');
    if (counter) {
      counter.textContent = '0';
    }

    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(
        0,
        0,
        this.visualizationCanvas.width,
        this.visualizationCanvas.height
      );
    }

    this.emit('log:cleared');
  }

  /**
   * Demonstrate all event types automatically
   */
  async demoAllEvents() {
    this.logEvent('🎬 Starting automatic event demonstration', 'info');

    const demoButton = this.domTree.querySelector('.demo-button');
    const demoInput = this.domTree.querySelector('.demo-input');
    const listItems = this.domTree.querySelectorAll('.list-item');

    const elements = [demoButton, listItems[0], listItems[1], demoInput];

    for (let i = 0; i < elements.length; i++) {
      if (!elements[i]) continue;

      await this.delay(1000);

      this.logEvent(
        `🎯 Auto-clicking: ${elements[i].dataset.node || elements[i].tagName}`,
        'info'
      );

      // Simulate click
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      elements[i].dispatchEvent(clickEvent);

      await this.delay(1500);
    }

    this.logEvent('✅ Demo completed', 'success');
  }

  /**
   * Explain event flow with guided tutorial
   */
  explainEventFlow() {
    this.logEvent('📚 Event Flow Explanation', 'info');
    this.logEvent(
      '1️⃣ CAPTURING: Event travels FROM document TO target',
      'info'
    );
    this.logEvent('2️⃣ TARGET: Event reaches the target element', 'info');
    this.logEvent('3️⃣ BUBBLING: Event travels FROM target TO document', 'info');
    this.logEvent(
      '💡 Use addEventListener(event, handler, true) for capturing',
      'info'
    );
    this.logEvent(
      '💡 Use addEventListener(event, handler, false) for bubbling',
      'info'
    );

    this.emit('concept:explained', { concept: 'event-flow' });
  }

  /**
   * Get animation speed in milliseconds
   * @returns {number} Animation duration
   * @private
   */
  getAnimationSpeed() {
    const speedMap = {
      slow: 2000,
      normal: 1000,
      fast: 500
    };
    return speedMap[this.options.animationSpeed] || 1000;
  }

  /**
   * Set animation speed
   * @param {string} speed - Speed setting (slow, normal, fast)
   */
  setAnimationSpeed(speed) {
    this.options.animationSpeed = speed;
    this.animationSpeed = this.getAnimationSpeed();

    this.logEvent(`⚡ Animation speed set to: ${speed}`, 'info');
    this.emit('speed:changed', { speed });
  }

  /**
   * Get color for event phase
   * @param {string} phase - Event phase
   * @returns {string} Color code
   * @private
   */
  getPhaseColor(phase) {
    const colorMap = {
      capturing: '#ff6b6b', // Red for capturing
      bubbling: '#4ecdc4', // Teal for bubbling
      target: '#45b7d1', // Blue for target
      input: '#96ceb4' // Green for input events
    };
    return colorMap[phase] || '#6c757d';
  }

  /**
   * Get icon for event phase
   * @param {string} phase - Event phase
   * @returns {string} Phase icon
   * @private
   */
  getPhaseIcon(phase) {
    const iconMap = {
      capturing: '⬇️',
      bubbling: '⬆️',
      target: '🎯',
      input: '⌨️'
    };
    return iconMap[phase] || '📍';
  }

  /**
   * Emit educational event for learning tracking
   * @param {string} phase - Event phase
   * @param {string} nodeId - Node identifier
   * @param {Array} eventPath - Event propagation path
   * @private
   */
  emitEducationalEvent(phase, nodeId, eventPath) {
    const detail = {
      phase,
      nodeId,
      pathLength: eventPath.length,
      timestamp: Date.now()
    };

    if (phase === 'capturing') {
      this.emit('event:captured', detail);
    } else if (phase === 'bubbling') {
      this.emit('event:bubbled', detail);
    }

    this.emit('interaction:performed', {
      action: 'event-flow-demo',
      phase,
      nodeId
    });
  }

  /**
   * Handle window resize
   */
  handleResize() {
    this.resizeCanvas();
  }

  /**
   * Resize canvas to fit container
   * @private
   */
  resizeCanvas() {
    if (!this.visualizationCanvas) return;

    const rect = this.container.getBoundingClientRect();
    this.visualizationCanvas.width = rect.width;
    this.visualizationCanvas.height = rect.height;
  }

  /**
   * Set theme
   * @param {string} theme - Theme name (light, dark)
   */
  setTheme(theme) {
    this.options.theme = theme;
    this.container.setAttribute('data-theme', theme);
  }

  /**
   * Reset visualizer to initial state
   */
  reset() {
    console.log('🔄 Resetting Event Flow Visualizer...');

    // Stop all animations
    this.activeAnimations.clear();

    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(
        0,
        0,
        this.visualizationCanvas.width,
        this.visualizationCanvas.height
      );
    }

    // Clear event log
    this.clearEventLog();

    // Reset controls
    const stopPropagationCheck =
      this.controlPanel.querySelector('#stop-propagation');
    const preventDefaultCheck =
      this.controlPanel.querySelector('#prevent-default');

    if (stopPropagationCheck) stopPropagationCheck.checked = false;
    if (preventDefaultCheck) preventDefaultCheck.checked = false;

    this.stopPropagationEnabled = false;
    this.preventDefaultEnabled = false;

    // Remove all highlights
    this.domTree.querySelectorAll('.highlighted').forEach(el => {
      el.classList.remove('highlighted', 'capturing', 'bubbling', 'target');
    });

    this.emit('visualizer:reset');
  }

  /**
   * Deactivate visualizer
   */
  deactivate() {
    console.log('⏸️ Deactivating Event Flow Visualizer...');

    // Stop all animations
    this.activeAnimations.clear();

    // Remove event listeners
    this.removeEventListeners();

    this.isActive = false;
    this.emit('visualizer:deactivated');
  }

  /**
   * Remove all event listeners
   * @private
   */
  removeEventListeners() {
    this.boundEventListeners.forEach((listener, key) => {
      listener.element.removeEventListener(
        listener.event,
        listener.handler,
        listener.useCapture
      );
    });

    this.boundEventListeners.clear();

    // Remove window resize listener
    window.removeEventListener('resize', this.handleResize.bind(this));
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

    // Store for cleanup
    const key = `custom-${eventName}-${Date.now()}`;
    this.boundEventListeners.set(key, {
      element: this.container,
      event: eventName,
      handler: handler,
      useCapture: false
    });
  }

  /**
   * Export visualization data
   * @param {string} format - Export format
   * @returns {string|Blob} Exported data
   */
  exportData(format = 'json') {
    const data = {
      eventCount: this.eventCounter,
      options: this.options,
      timestamp: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);

      case 'canvas':
        return this.visualizationCanvas.toDataURL('image/png');

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get current status
   * @returns {Object} Component status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      eventCounter: this.eventCounter,
      activeAnimations: this.activeAnimations.size,
      options: this.options,
      stopPropagationEnabled: this.stopPropagationEnabled,
      preventDefaultEnabled: this.preventDefaultEnabled
    };
  }

  /**
   * Destroy the component and clean up resources
   */
  destroy() {
    console.log('🗑️ Destroying Event Flow Visualizer...');

    // Deactivate first
    if (this.isActive) {
      this.deactivate();
    }

    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(
        0,
        0,
        this.visualizationCanvas.width,
        this.visualizationCanvas.height
      );
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove('event-flow-visualizer');
    }

    // Reset state
    this.isInitialized = false;
    this.isActive = false;
    this.currentEventPath = [];
    this.eventCounter = 0;
    this.activeAnimations.clear();
    this.boundEventListeners.clear();

    console.log('✅ Event Flow Visualizer destroyed');
  }
}
