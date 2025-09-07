/**
 * DOM Metrics Visualizer
 * Core visualization component for the Foundation Module
 *
 * Educational Purpose:
 * - Teaches the relationship between Screen, Window, Document, and Viewport
 * - Visualizes how DOM properties change in real-time
 * - Demonstrates the container hierarchy with interactive controls
 *
 * @fileoverview Foundation module's main visualization component
 * @version 1.0.0
 */

/**
 * Main DOM Metrics Visualizer class
 * Manages the visualization of DOM container relationships and properties
 */
export class DOMMetricsVisualizer {
  /**
   * Creates a DOM metrics visualizer instance
   * @param {HTMLElement} container - Container element for the visualization
   * @param {Object} options - Configuration options
   * @param {boolean} [options.enableAnimation=true] - Enable smooth animations
   * @param {number} [options.updateInterval=16] - Update interval in milliseconds
   * @param {string} [options.theme='light'] - Visual theme (light/dark)
   * @param {boolean} [options.showGrid=true] - Show background grid
   * @param {number} [options.scale=0.1] - Scale factor for visualization
   * @throws {Error} Throws error if container is not a valid DOM element
   */
  constructor(container, options = {}) {
    // Validate container
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('Container must be a valid DOM element');
    }

    this.container = container;
    this.options = {
      enableAnimation: true,
      updateInterval: 16,
      theme: 'light',
      showGrid: true,
      scale: 0.1,
      colors: {
        screen: 'rgba(255, 99, 71, 0.3)',
        window: 'rgba(135, 206, 235, 0.3)',
        document: 'rgba(144, 238, 144, 0.3)',
        viewport: 'rgba(255, 182, 193, 0.3)'
      },
      ...options
    };

    // State management
    this.currentMetrics = {};
    this.isInitialized = false;
    this.isAnimating = false;
    this.animationFrame = null;
    this.updateTimer = null;

    // Event listeners storage for cleanup
    this.listeners = new Map();

    // Canvas and rendering
    this.canvas = null;
    this.ctx = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;

    // Interactive controls
    this.controls = null;
    this.isInteracting = false;

    // Initialize the component
    this.init();
  }

  /**
   * Initialize the DOM metrics visualizer
   * Sets up canvas, controls, and starts monitoring
   * @private
   */
  init() {
    try {
      this.createStructure();
      this.setupCanvas();
      this.createControls();
      this.bindEvents();
      this.startMonitoring();
      this.isInitialized = true;

      console.log('✅ DOMMetricsVisualizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize DOMMetricsVisualizer:', error);
      throw error;
    }
  }

  /**
   * Create the basic HTML structure for the visualizer
   * @private
   */
  createStructure() {
    this.container.innerHTML = `
      <div class="foundation-module">
        <div class="foundation-header">
          <h2 class="foundation-title">DOM Container Relationships</h2>
          <p class="foundation-description">
            Explore how Screen, Window, Document, and Viewport relate to each other
          </p>
        </div>

        <div class="foundation-content">
          <div class="visualization-panel">
            <div class="canvas-container">
              <canvas class="dom-visualization-canvas" id="dom-canvas"></canvas>
              <div class="canvas-overlay">
                <div class="legend">
                  <div class="legend-item">
                    <div class="legend-color screen-color"></div>
                    <span>Screen</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color window-color"></div>
                    <span>Window</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color document-color"></div>
                    <span>Document</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color viewport-color"></div>
                    <span>Viewport</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="controls-panel">
            <div class="metrics-display">
              <h3>Live Metrics</h3>
              <div class="metrics-grid" id="metrics-grid">
                <!-- Metrics will be populated dynamically -->
              </div>
            </div>

            <div class="interactive-controls">
              <h3>Interactive Controls</h3>
              <div class="controls-grid" id="controls-grid">
                <!-- Controls will be populated dynamically -->
              </div>
            </div>
          </div>
        </div>

        <div class="foundation-explanation">
          <h3>Understanding DOM Containers</h3>
          <div class="explanation-grid">
            <div class="explanation-item">
              <strong>Screen:</strong> Physical display dimensions
            </div>
            <div class="explanation-item">
              <strong>Window:</strong> Browser viewport + UI elements
            </div>
            <div class="explanation-item">
              <strong>Document:</strong> Complete web page content
            </div>
            <div class="explanation-item">
              <strong>Viewport:</strong> Visible content area
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup the canvas for visualization
   * @private
   */
  setupCanvas() {
    this.canvas = this.container.querySelector('#dom-canvas');
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    // Set up canvas styling
    this.canvas.style.border = '1px solid var(--border-primary)';
    this.canvas.style.borderRadius = 'var(--radius-md)';
    this.canvas.style.backgroundColor = 'var(--canvas-bg)';
  }

  /**
   * Resize canvas to fit container and handle high DPI displays
   * @private
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // Account for device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;

    this.canvasWidth = rect.width;
    this.canvasHeight = Math.max(rect.height, 400);

    this.canvas.width = this.canvasWidth * dpr;
    this.canvas.height = this.canvasHeight * dpr;

    this.canvas.style.width = `${this.canvasWidth}px`;
    this.canvas.style.height = `${this.canvasHeight}px`;

    // Scale context for high DPI
    this.ctx.scale(dpr, dpr);

    // Redraw after resize
    if (this.isInitialized) {
      this.render();
    }
  }

  /**
   * Create interactive controls for the visualizer
   * @private
   */
  createControls() {
    this.createMetricsDisplay();
    this.createInteractiveControls();
  }

  /**
   * Create the metrics display panel
   * @private
   */
  createMetricsDisplay() {
    const metricsGrid = this.container.querySelector('#metrics-grid');

    const metrics = [
      { key: 'screenWidth', label: 'Screen Width', unit: 'px' },
      { key: 'screenHeight', label: 'Screen Height', unit: 'px' },
      { key: 'windowWidth', label: 'Window Width', unit: 'px' },
      { key: 'windowHeight', label: 'Window Height', unit: 'px' },
      { key: 'documentWidth', label: 'Document Width', unit: 'px' },
      { key: 'documentHeight', label: 'Document Height', unit: 'px' },
      { key: 'viewportWidth', label: 'Viewport Width', unit: 'px' },
      { key: 'viewportHeight', label: 'Viewport Height', unit: 'px' },
      { key: 'scrollX', label: 'Scroll X', unit: 'px' },
      { key: 'scrollY', label: 'Scroll Y', unit: 'px' }
    ];

    metricsGrid.innerHTML = metrics
      .map(
        metric => `
      <div class="metric-item">
        <label class="metric-label">${metric.label}</label>
        <span class="metric-value" id="metric-${metric.key}">0${metric.unit}</span>
      </div>
    `
      )
      .join('');
  }

  /**
   * Create interactive controls for simulation
   * @private
   */
  createInteractiveControls() {
    const controlsGrid = this.container.querySelector('#controls-grid');

    controlsGrid.innerHTML = `
      <div class="control-group">
        <label for="window-width-control">Simulate Window Width</label>
        <input
          type="range"
          id="window-width-control"
          class="control-slider"
          min="300"
          max="2000"
          value="${window.innerWidth}"
          step="10"
        >
        <span class="control-value" id="window-width-value">${window.innerWidth}px</span>
      </div>

      <div class="control-group">
        <label for="window-height-control">Simulate Window Height</label>
        <input
          type="range"
          id="window-height-control"
          class="control-slider"
          min="200"
          max="1200"
          value="${window.innerHeight}"
          step="10"
        >
        <span class="control-value" id="window-height-value">${window.innerHeight}px</span>
      </div>

      <div class="control-group">
        <label for="scroll-x-control">Simulate Scroll X</label>
        <input
          type="range"
          id="scroll-x-control"
          class="control-slider"
          min="0"
          max="1000"
          value="0"
          step="5"
        >
        <span class="control-value" id="scroll-x-value">0px</span>
      </div>

      <div class="control-group">
        <label for="scroll-y-control">Simulate Scroll Y</label>
        <input
          type="range"
          id="scroll-y-control"
          class="control-slider"
          min="0"
          max="1000"
          value="0"
          step="5"
        >
        <span class="control-value" id="scroll-y-value">0px</span>
      </div>

      <div class="control-group">
        <button class="control-button" id="reset-controls">Reset to Actual</button>
        <button class="control-button" id="fullscreen-sim">Fullscreen Simulation</button>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" id="auto-update" checked>
          Auto-update from real values
        </label>
      </div>
    `;
  }

  /**
   * Bind event listeners
   * @private
   */
  bindEvents() {
    // Window resize and scroll events
    this.addEventListener(
      window,
      'resize',
      this.throttle(() => {
        this.resizeCanvas();
        this.updateMetrics();
      }, 100)
    );

    this.addEventListener(
      window,
      'scroll',
      this.throttle(() => {
        this.updateMetrics();
      }, 16)
    );

    // Control events
    this.bindControlEvents();

    // Canvas interaction events
    this.bindCanvasEvents();
  }

  /**
   * Bind control panel events
   * @private
   */
  bindControlEvents() {
    // Sliders
    const controls = [
      'window-width-control',
      'window-height-control',
      'scroll-x-control',
      'scroll-y-control'
    ];

    controls.forEach(controlId => {
      const control = this.container.querySelector(`#${controlId}`);
      const valueDisplay = this.container.querySelector(
        `#${controlId.replace('-control', '-value')}`
      );

      if (control && valueDisplay) {
        this.addEventListener(control, 'input', e => {
          const value = parseInt(e.target.value);
          valueDisplay.textContent = `${value}px`;
          this.updateSimulatedMetrics();
        });
      }
    });

    // Buttons
    const resetBtn = this.container.querySelector('#reset-controls');
    if (resetBtn) {
      this.addEventListener(resetBtn, 'click', () => {
        this.resetControlsToActual();
      });
    }

    const fullscreenBtn = this.container.querySelector('#fullscreen-sim');
    if (fullscreenBtn) {
      this.addEventListener(fullscreenBtn, 'click', () => {
        this.simulateFullscreen();
      });
    }

    // Auto-update checkbox
    const autoUpdate = this.container.querySelector('#auto-update');
    if (autoUpdate) {
      this.addEventListener(autoUpdate, 'change', e => {
        if (e.target.checked) {
          this.startMonitoring();
        } else {
          this.stopMonitoring();
        }
      });
    }
  }

  /**
   * Bind canvas interaction events
   * @private
   */
  bindCanvasEvents() {
    this.addEventListener(this.canvas, 'mousemove', e => {
      this.handleCanvasHover(e);
    });

    this.addEventListener(this.canvas, 'click', e => {
      this.handleCanvasClick(e);
    });
  }

  /**
   * Handle canvas hover for tooltips
   * @param {MouseEvent} e - Mouse event
   * @private
   */
  handleCanvasHover(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Determine which container is being hovered
    const hoveredContainer = this.getContainerAtPoint(x, y);

    if (hoveredContainer) {
      this.canvas.style.cursor = 'pointer';
      this.showTooltip(hoveredContainer, x, y);
    } else {
      this.canvas.style.cursor = 'default';
      this.hideTooltip();
    }
  }

  /**
   * Handle canvas click for interaction
   * @param {MouseEvent} e - Mouse event
   * @private
   */
  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedContainer = this.getContainerAtPoint(x, y);

    if (clickedContainer) {
      this.highlightContainer(clickedContainer);
      this.showContainerInfo(clickedContainer);
    }
  }

  /**
   * Determine which container is at the given point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {string|null} Container name or null
   * @private
   */
  getContainerAtPoint(x, y) {
    // This would contain the logic to determine which visual container
    // the point intersects with based on the current rendering
    // Implementation depends on the current metrics and scale

    // Simplified implementation - would need actual bounds checking
    const containers = ['viewport', 'document', 'window', 'screen'];

    // Return the smallest container that contains the point
    // This is a placeholder - actual implementation would check bounds
    return containers[0];
  }

  /**
   * Show tooltip for hovered container
   * @param {string} container - Container name
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @private
   */
  showTooltip(container, x, y) {
    // Implementation for showing tooltips
    console.log(`Hovering over ${container} at (${x}, ${y})`);
  }

  /**
   * Hide tooltip
   * @private
   */
  hideTooltip() {
    // Implementation for hiding tooltips
  }

  /**
   * Highlight a specific container
   * @param {string} container - Container name
   * @private
   */
  highlightContainer(container) {
    console.log(`Highlighting ${container}`);
    // This would add visual emphasis to the selected container
  }

  /**
   * Show detailed information about a container
   * @param {string} container - Container name
   * @private
   */
  showContainerInfo(container) {
    const info = {
      screen: 'Physical display device dimensions',
      window: 'Browser window including UI elements',
      document: 'Full document content area',
      viewport: 'Currently visible content area'
    };

    console.log(`${container}: ${info[container]}`);
  }

  /**
   * Start monitoring DOM metrics
   * @private
   */
  startMonitoring() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(() => {
      this.updateMetrics();
    }, this.options.updateInterval);

    // Initial update
    this.updateMetrics();
  }

  /**
   * Stop monitoring DOM metrics
   * @private
   */
  stopMonitoring() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Update metrics from current DOM state
   * @private
   */
  updateMetrics() {
    const newMetrics = this.getCurrentMetrics();

    // Only update if metrics have changed
    if (!this.metricsEqual(this.currentMetrics, newMetrics)) {
      this.currentMetrics = newMetrics;
      this.updateDisplay();
      this.render();
    }
  }

  /**
   * Get current DOM metrics
   * @returns {Object} Current metrics object
   * @private
   */
  getCurrentMetrics() {
    const autoUpdate =
      this.container.querySelector('#auto-update')?.checked ?? true;

    if (autoUpdate) {
      // Get real values from DOM
      return {
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        viewportWidth: document.documentElement.clientWidth,
        viewportHeight: document.documentElement.clientHeight,
        scrollX: window.pageXOffset || document.documentElement.scrollLeft,
        scrollY: window.pageYOffset || document.documentElement.scrollTop
      };
    } else {
      // Get simulated values from controls
      return this.getSimulatedMetrics();
    }
  }

  /**
   * Get simulated metrics from controls
   * @returns {Object} Simulated metrics object
   * @private
   */
  getSimulatedMetrics() {
    const getControlValue = id => {
      const control = this.container.querySelector(`#${id}`);
      return control ? parseInt(control.value) : 0;
    };

    return {
      screenWidth: screen.width, // Always use real screen size
      screenHeight: screen.height,
      windowWidth: getControlValue('window-width-control'),
      windowHeight: getControlValue('window-height-control'),
      documentWidth: Math.max(getControlValue('window-width-control'), 1000),
      documentHeight: Math.max(getControlValue('window-height-control'), 1000),
      viewportWidth: getControlValue('window-width-control'),
      viewportHeight: getControlValue('window-height-control'),
      scrollX: getControlValue('scroll-x-control'),
      scrollY: getControlValue('scroll-y-control')
    };
  }

  /**
   * Update simulated metrics when controls change
   * @private
   */
  updateSimulatedMetrics() {
    if (!this.container.querySelector('#auto-update')?.checked) {
      this.updateMetrics();
    }
  }

  /**
   * Check if two metrics objects are equal
   * @param {Object} a - First metrics object
   * @param {Object} b - Second metrics object
   * @returns {boolean} True if equal
   * @private
   */
  metricsEqual(a, b) {
    if (!a || !b) return false;

    const keys = Object.keys(a);
    return keys.every(key => a[key] === b[key]);
  }

  /**
   * Update the metrics display
   * @private
   */
  updateDisplay() {
    Object.entries(this.currentMetrics).forEach(([key, value]) => {
      const element = this.container.querySelector(`#metric-${key}`);
      if (element) {
        element.textContent = `${value}px`;

        // Add animation class for changes
        if (this.options.enableAnimation) {
          element.classList.add('updated');
          setTimeout(() => element.classList.remove('updated'), 300);
        }
      }
    });
  }

  /**
   * Reset controls to actual values
   * @private
   */
  resetControlsToActual() {
    const controls = [
      { id: 'window-width-control', value: window.innerWidth },
      { id: 'window-height-control', value: window.innerHeight },
      { id: 'scroll-x-control', value: window.pageXOffset },
      { id: 'scroll-y-control', value: window.pageYOffset }
    ];

    controls.forEach(({ id, value }) => {
      const control = this.container.querySelector(`#${id}`);
      const valueDisplay = this.container.querySelector(
        `#${id.replace('-control', '-value')}`
      );

      if (control && valueDisplay) {
        control.value = value;
        valueDisplay.textContent = `${value}px`;
      }
    });

    this.updateSimulatedMetrics();
  }

  /**
   * Simulate fullscreen dimensions
   * @private
   */
  simulateFullscreen() {
    const controls = [
      { id: 'window-width-control', value: screen.width },
      { id: 'window-height-control', value: screen.height },
      { id: 'scroll-x-control', value: 0 },
      { id: 'scroll-y-control', value: 0 }
    ];

    controls.forEach(({ id, value }) => {
      const control = this.container.querySelector(`#${id}`);
      const valueDisplay = this.container.querySelector(
        `#${id.replace('-control', '-value')}`
      );

      if (control && valueDisplay) {
        control.value = value;
        valueDisplay.textContent = `${value}px`;
      }
    });

    this.updateSimulatedMetrics();
  }

  /**
   * Render the visualization
   * @private
   */
  render() {
    if (!this.ctx || !this.currentMetrics) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw background grid if enabled
    if (this.options.showGrid) {
      this.drawGrid();
    }

    // Draw containers in order (largest to smallest)
    this.drawContainer('screen');
    this.drawContainer('window');
    this.drawContainer('document');
    this.drawContainer('viewport');

    // Draw labels and dimensions
    this.drawLabels();
  }

  /**
   * Draw background grid
   * @private
   */
  drawGrid() {
    const gridSize = 20;

    this.ctx.strokeStyle = 'var(--canvas-grid)';
    this.ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= this.canvasWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.canvasHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw a specific container
   * @param {string} containerType - Type of container to draw
   * @private
   */
  drawContainer(containerType) {
    const bounds = this.getContainerBounds(containerType);
    if (!bounds) return;

    const { x, y, width, height } = bounds;

    // Set style based on container type
    this.ctx.fillStyle = this.options.colors[containerType];
    this.ctx.strokeStyle = this.getContainerBorderColor(containerType);
    this.ctx.lineWidth = 2;

    // Draw filled rectangle
    this.ctx.fillRect(x, y, width, height);

    // Draw border
    this.ctx.strokeRect(x, y, width, height);

    // Draw container label
    this.drawContainerLabel(containerType, x, y, width, height);
  }

  /**
   * Get bounds for a container type
   * @param {string} containerType - Container type
   * @returns {Object|null} Bounds object or null
   * @private
   */
  getContainerBounds(containerType) {
    const metrics = this.currentMetrics;
    const scale = this.options.scale;
    const padding = 20;

    // Calculate positions based on metrics and scale
    switch (containerType) {
      case 'screen':
        return {
          x: padding,
          y: padding,
          width: metrics.screenWidth * scale,
          height: metrics.screenHeight * scale
        };

      case 'window':
        return {
          x: padding + 10,
          y: padding + 10,
          width: metrics.windowWidth * scale,
          height: metrics.windowHeight * scale
        };

      case 'document':
        return {
          x: padding + 20,
          y: padding + 20,
          width: metrics.documentWidth * scale,
          height: metrics.documentHeight * scale
        };

      case 'viewport':
        return {
          x: padding + 20 + metrics.scrollX * scale,
          y: padding + 20 + metrics.scrollY * scale,
          width: metrics.viewportWidth * scale,
          height: metrics.viewportHeight * scale
        };

      default:
        return null;
    }
  }

  /**
   * Get border color for container type
   * @param {string} containerType - Container type
   * @returns {string} Color string
   * @private
   */
  getContainerBorderColor(containerType) {
    const colors = {
      screen: '#ff6347',
      window: '#87ceeb',
      document: '#90ee90',
      viewport: '#ffb6c1'
    };

    return colors[containerType] || '#000000';
  }

  /**
   * Draw container label
   * @param {string} containerType - Container type
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @private
   */
  drawContainerLabel(containerType, x, y, width, height) {
    const metrics = this.currentMetrics;

    // Label text
    const label = containerType.toUpperCase();
    const dimensions = this.getContainerDimensions(containerType);

    // Set text style
    this.ctx.fillStyle = '#000000';
    this.ctx.font = '12px var(--font-family-sans)';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    // Draw label background
    const labelText = `${label}: ${dimensions}`;
    const labelMetrics = this.ctx.measureText(labelText);
    const labelWidth = labelMetrics.width + 8;
    const labelHeight = 20;

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillRect(x + 4, y + 4, labelWidth, labelHeight);

    this.ctx.strokeStyle = this.getContainerBorderColor(containerType);
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 4, y + 4, labelWidth, labelHeight);

    // Draw label text
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText(labelText, x + 8, y + 8);
  }

  /**
   * Get formatted dimensions for container
   * @param {string} containerType - Container type
   * @returns {string} Formatted dimensions
   * @private
   */
  getContainerDimensions(containerType) {
    const metrics = this.currentMetrics;

    switch (containerType) {
      case 'screen':
        return `${metrics.screenWidth} × ${metrics.screenHeight}`;
      case 'window':
        return `${metrics.windowWidth} × ${metrics.windowHeight}`;
      case 'document':
        return `${metrics.documentWidth} × ${metrics.documentHeight}`;
      case 'viewport':
        return `${metrics.viewportWidth} × ${metrics.viewportHeight}`;
      default:
        return '';
    }
  }

  /**
   * Draw labels and additional information
   * @private
   */
  drawLabels() {
    // Draw scroll position indicator if there's scrolling
    if (this.currentMetrics.scrollX > 0 || this.currentMetrics.scrollY > 0) {
      this.drawScrollIndicator();
    }

    // Draw scale indicator
    this.drawScaleIndicator();
  }

  /**
   * Draw scroll position indicator
   * @private
   */
  drawScrollIndicator() {
    const scrollX = this.currentMetrics.scrollX;
    const scrollY = this.currentMetrics.scrollY;

    if (scrollX === 0 && scrollY === 0) return;

    // Draw scroll arrow
    const arrowX = this.canvasWidth - 100;
    const arrowY = this.canvasHeight - 50;

    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    this.ctx.font = '14px var(--font-family-sans)';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Scroll: ${scrollX}, ${scrollY}`, arrowX, arrowY);
  }

  /**
   * Draw scale indicator
   * @private
   */
  drawScaleIndicator() {
    const scale = this.options.scale;
    const scaleText = `Scale: ${Math.round(scale * 100)}%`;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.font = '12px var(--font-family-mono)';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(scaleText, 10, this.canvasHeight - 10);
  }

  /**
   * Add event listener with cleanup tracking
   * @param {EventTarget} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @private
   */
  addEventListener(target, event, handler) {
    target.addEventListener(event, handler);

    // Track for cleanup
    if (!this.listeners.has(target)) {
      this.listeners.set(target, []);
    }
    this.listeners.get(target).push({ event, handler });
  }

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {Function} Throttled function
   * @private
   */
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Public API: Update visualization with new metrics
   * @param {Object} metrics - New metrics to display
   * @returns {Promise<void>} Promise that resolves when update is complete
   * @public
   */
  async updateMetrics(metrics) {
    if (!this.isInitialized) {
      throw new Error('Visualizer not initialized');
    }

    // Validate metrics
    const requiredKeys = [
      'screenWidth',
      'screenHeight',
      'windowWidth',
      'windowHeight',
      'documentWidth',
      'documentHeight',
      'viewportWidth',
      'viewportHeight',
      'scrollX',
      'scrollY'
    ];

    const missingKeys = requiredKeys.filter(key => !(key in metrics));
    if (missingKeys.length > 0) {
      throw new Error(`Missing required metrics: ${missingKeys.join(', ')}`);
    }

    // Update current metrics
    this.currentMetrics = { ...metrics };

    // Update display and render
    this.updateDisplay();
    this.render();

    // Emit update event
    this.emit('metrics:updated', metrics);
  }

  /**
   * Public API: Get current metrics
   * @returns {Object} Current metrics object
   * @public
   */
  getMetrics() {
    return { ...this.currentMetrics };
  }

  /**
   * Public API: Set visualization options
   * @param {Object} newOptions - New options to apply
   * @public
   */
  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    if (this.isInitialized) {
      this.render();
    }
  }

  /**
   * Public API: Export current visualization as image
   * @param {string} format - Image format ('png', 'jpeg', 'webp')
   * @param {number} quality - Image quality (0-1)
   * @returns {string} Data URL of the image
   * @public
   */
  exportImage(format = 'png', quality = 1.0) {
    if (!this.canvas) {
      throw new Error('Canvas not available for export');
    }

    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * Public API: Take a screenshot and download it
   * @param {string} filename - Filename for download
   * @public
   */
  downloadScreenshot(filename = 'dom-metrics-visualization.png') {
    const dataURL = this.exportImage('png');

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Public API: Start animation loop
   * @public
   */
  startAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.animationFrame = requestAnimationFrame(() => this.animationLoop());
  }

  /**
   * Public API: Stop animation loop
   * @public
   */
  stopAnimation() {
    this.isAnimating = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Animation loop for smooth updates
   * @private
   */
  animationLoop() {
    if (!this.isAnimating) return;

    // Update metrics if auto-update is enabled
    const autoUpdate =
      this.container.querySelector('#auto-update')?.checked ?? true;
    if (autoUpdate) {
      this.updateMetrics();
    }

    // Continue animation
    this.animationFrame = requestAnimationFrame(() => this.animationLoop());
  }

  /**
   * Simple event emitter functionality
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   * @private
   */
  emit(eventName, data) {
    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true,
      cancelable: true
    });

    this.container.dispatchEvent(event);
  }

  /**
   * Public API: Add event listener for custom events
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @public
   */
  on(eventName, handler) {
    this.addEventListener(this.container, eventName, handler);
  }

  /**
   * Public API: Remove event listener
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @public
   */
  off(eventName, handler) {
    this.container.removeEventListener(eventName, handler);
  }

  /**
   * Public API: Destroy the visualizer and clean up resources
   * @public
   */
  destroy() {
    // Stop monitoring and animation
    this.stopMonitoring();
    this.stopAnimation();

    // Remove all event listeners
    this.listeners.forEach((events, target) => {
      events.forEach(({ event, handler }) => {
        target.removeEventListener(event, handler);
      });
    });
    this.listeners.clear();

    // Clear intervals and timeouts
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    // Reset state
    this.isInitialized = false;
    this.currentMetrics = {};
    this.canvas = null;
    this.ctx = null;

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }

    console.log('✅ DOMMetricsVisualizer destroyed successfully');
  }

  /**
   * Public API: Get visualizer status and debug info
   * @returns {Object} Status information
   * @public
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isAnimating: this.isAnimating,
      isMonitoring: !!this.updateTimer,
      canvasSize: {
        width: this.canvasWidth,
        height: this.canvasHeight
      },
      currentMetrics: this.currentMetrics,
      options: this.options,
      listenerCount: Array.from(this.listeners.values()).reduce(
        (total, events) => total + events.length,
        0
      )
    };
  }
}
