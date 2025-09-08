/**
 * CustomEventFactory - Interactive demonstration of custom events
 *
 * This component teaches users how to create, dispatch, and handle custom events
 * in JavaScript, showing the power of the CustomEvent API for component communication.
 *
 * Educational Goals:
 * - Understand CustomEvent API
 * - Learn event creation with custom data
 * - Practice event dispatch and listening
 * - Explore component communication patterns
 * - Master event configuration options
 *
 * @author DOM Visualizer OOP Team
 * @version 1.0.0
 */

/**
 * CustomEventFactory Class
 * Creates an interactive workshop for custom event creation and handling
 */
export class CustomEventFactory {
  /**
   * Initialize the Custom Event Factory
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('Valid container element is required');
    }

    this.container = container;
    this.options = {
      enableEventCreation: true,
      showEventDetails: true,
      enableRealTimeMonitoring: true,
      maxEventHistory: 50,
      theme: 'light',
      debugMode: false,
      ...options
    };

    // Component state
    this.isInitialized = false;
    this.isActive = false;
    this.eventHistory = [];
    this.activeListeners = new Map();
    this.eventCounter = 0;

    // Pre-defined event templates
    this.eventTemplates = new Map([
      [
        'user-action',
        {
          name: 'user-action',
          detail: { action: 'click', timestamp: Date.now() },
          bubbles: true,
          cancelable: true,
          description: 'User interaction event'
        }
      ],
      [
        'data-updated',
        {
          name: 'data-updated',
          detail: { data: { id: 1, value: 'example' }, source: 'api' },
          bubbles: false,
          cancelable: false,
          description: 'Data change notification'
        }
      ],
      [
        'navigation',
        {
          name: 'navigation',
          detail: { from: '/home', to: '/about', method: 'pushState' },
          bubbles: true,
          cancelable: true,
          description: 'Navigation state change'
        }
      ],
      [
        'component-ready',
        {
          name: 'component-ready',
          detail: { componentId: 'header', loadTime: 150 },
          bubbles: true,
          cancelable: false,
          description: 'Component initialization complete'
        }
      ]
    ]);

    // DOM references
    this.eventCreator = null;
    this.eventMonitor = null;
    this.eventHistory = null;

    console.log(
      '✨ CustomEventFactory initialized with options:',
      this.options
    );
  }

  /**
   * Initialize the factory
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ CustomEventFactory already initialized');
      return;
    }

    console.log('🚀 Initializing Custom Event Factory...');

    try {
      // Setup component structure
      this.setupStructure();

      // Create event creation interface
      this.createEventCreator();

      // Setup event monitoring
      this.setupEventMonitoring();

      // Create event history display
      this.createEventHistory();

      // Setup demo components
      this.setupDemoComponents();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('✅ Custom Event Factory initialized');

      this.emit('factory:initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Custom Event Factory:', error);
      throw error;
    }
  }

  /**
   * Setup the basic component structure
   * @private
   */
  setupStructure() {
    this.container.className = 'custom-event-factory';

    this.container.innerHTML = `
      <div class="factory-header">
        <h3>Custom Event Factory</h3>
        <p class="description">
          Create, dispatch, and monitor custom events. Learn how to build powerful
          component communication systems using the CustomEvent API.
        </p>
      </div>

      <div class="factory-content">

        <!-- Event Creation Section -->
        <div class="section event-creation-section">
          <h4>🛠️ Event Creator</h4>
          <div class="creator-container">
            <!-- Event creation interface will be added here -->
          </div>
        </div>

        <!-- Demo Components Section -->
        <div class="section demo-components-section">
          <h4>🎭 Demo Components</h4>
          <div class="components-container">

            <div class="demo-component publisher-component" id="publisher">
              <select id="dispatch-target" class="form-control">
                <option value="document">Document</option>
                <option value="publisher">Publisher Component</option>
                <option value="subscriber">Subscriber Component</option>
                <option value="analyzer">Analyzer Component</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" id="create-event">
              ✨ Create & Dispatch Event
            </button>
            <button class="btn btn-secondary" id="preview-event">
              👁️ Preview Event
            </button>
            <button class="btn btn-info" id="save-template">
              💾 Save as Template
            </button>
          </div>
        </div>

        <div class="event-preview" id="event-preview">
          <h5>Event Preview</h5>
          <pre class="preview-code"><code id="preview-content">// Event preview will appear here</code></pre>
        </div>
      </div>
    `;

    this.eventCreator = creatorContainer.querySelector('.event-creator');
  }

  /**
   * Setup event monitoring interface
   * @private
   */
  setupEventMonitoring() {
    const monitorContainer = this.container.querySelector('.monitor-container');

    monitorContainer.innerHTML = `
      <div class="event-monitor">
        <div class="monitor-controls">
          <button class="btn btn-success" id="start-monitoring">
            ▶️ Start Monitoring
          </button>
          <button class="btn btn-warning" id="pause-monitoring">
            ⏸️ Pause
          </button>
          <button class="btn btn-secondary" id="clear-monitor">
            🧹 Clear
          </button>

          <div class="monitor-filters">
            <label for="filter-events">Filter Events:</label>
            <input type="text" id="filter-events" class="form-control"
                   placeholder="event type filter..." />
          </div>
        </div>

        <div class="monitor-display">
          <div class="monitor-header">
            <span class="monitor-title">📡 Live Event Stream</span>
            <span class="monitor-status" id="monitor-status">Stopped</span>
          </div>

          <div class="event-stream" id="event-stream">
            <div class="stream-entry info">
              <span class="entry-time">Ready</span>
              <span class="entry-message">Event monitoring ready. Click "Start Monitoring" to begin.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.eventMonitor = monitorContainer.querySelector('.event-monitor');
  }

  /**
   * Create event history display
   * @private
   */
  createEventHistory() {
    const historyContainer = this.container.querySelector('.history-container');

    historyContainer.innerHTML = `
      <div class="event-history">
        <div class="history-controls">
          <button class="btn btn-secondary" id="export-history">
            📥 Export History
          </button>
          <button class="btn btn-warning" id="clear-history">
            🗑️ Clear History
          </button>

          <div class="history-stats">
            <span class="stat-item">
              <span class="stat-label">Total:</span>
              <span class="stat-value" id="history-total">0</span>
            </span>
            <span class="stat-item">
              <span class="stat-label">Types:</span>
              <span class="stat-value" id="history-types">0</span>
            </span>
          </div>
        </div>

        <div class="history-list" id="history-list">
          <div class="history-entry info">
            <span class="entry-time">Welcome</span>
            <span class="entry-type">system</span>
            <span class="entry-message">Event history tracking initialized</span>
          </div>
        </div>
      </div>
    `;

    this.eventHistoryDisplay = historyContainer.querySelector('.event-history');
  }

  /**
   * Setup demo components
   * @private
   */
  setupDemoComponents() {
    // Publisher component events
    const publishUserAction = this.container.querySelector(
      '#publish-user-action'
    );
    const publishDataUpdate = this.container.querySelector(
      '#publish-data-update'
    );
    const publishNavigation = this.container.querySelector(
      '#publish-navigation'
    );

    publishUserAction.addEventListener('click', () => {
      this.dispatchTemplateEvent('user-action');
    });

    publishDataUpdate.addEventListener('click', () => {
      this.dispatchTemplateEvent('data-updated');
    });

    publishNavigation.addEventListener('click', () => {
      this.dispatchTemplateEvent('navigation');
    });

    // Subscriber component events
    const listenUserAction = this.container.querySelector(
      '#listen-user-action'
    );
    const listenDataUpdate = this.container.querySelector(
      '#listen-data-update'
    );
    const listenAll = this.container.querySelector('#listen-all');

    listenUserAction.addEventListener('click', () => {
      this.addEventListener('user-action');
    });

    listenDataUpdate.addEventListener('click', () => {
      this.addEventListener('data-updated');
    });

    listenAll.addEventListener('click', () => {
      this.addUniversalListener();
    });

    // Initialize analytics
    this.initializeAnalytics();
  }

  /**
   * Setup event listeners for the factory
   * @private
   */
  setupEventListeners() {
    // Event creator controls
    const eventTypeSelect = this.eventCreator.querySelector('#event-type');
    const createEventBtn = this.eventCreator.querySelector('#create-event');
    const previewEventBtn = this.eventCreator.querySelector('#preview-event');
    const saveTemplateBtn = this.eventCreator.querySelector('#save-template');

    eventTypeSelect.addEventListener('change', e => {
      this.loadEventTemplate(e.target.value);
    });

    createEventBtn.addEventListener('click', () => {
      this.createAndDispatchEvent();
    });

    previewEventBtn.addEventListener('click', () => {
      this.previewEvent();
    });

    saveTemplateBtn.addEventListener('click', () => {
      this.saveEventTemplate();
    });

    // Monitor controls
    const startMonitoring =
      this.eventMonitor.querySelector('#start-monitoring');
    const pauseMonitoring =
      this.eventMonitor.querySelector('#pause-monitoring');
    const clearMonitor = this.eventMonitor.querySelector('#clear-monitor');

    startMonitoring.addEventListener('click', () =>
      this.startEventMonitoring()
    );
    pauseMonitoring.addEventListener('click', () =>
      this.pauseEventMonitoring()
    );
    clearMonitor.addEventListener('click', () => this.clearEventMonitor());

    // History controls
    const exportHistory =
      this.eventHistoryDisplay.querySelector('#export-history');
    const clearHistory =
      this.eventHistoryDisplay.querySelector('#clear-history');

    exportHistory.addEventListener('click', () => this.exportEventHistory());
    clearHistory.addEventListener('click', () => this.clearEventHistory());
  }

  /**
   * Load event template into form
   * @param {string} templateName - Template name
   * @private
   */
  loadEventTemplate(templateName) {
    if (!templateName || templateName === 'custom') {
      this.clearEventForm();
      return;
    }

    const template = this.eventTemplates.get(templateName);
    if (!template) return;

    const eventNameInput = this.eventCreator.querySelector('#event-name');
    const eventDetailInput = this.eventCreator.querySelector('#event-detail');
    const bubblesCheckbox = this.eventCreator.querySelector('#event-bubbles');
    const cancelableCheckbox =
      this.eventCreator.querySelector('#event-cancelable');

    eventNameInput.value = template.name;
    eventDetailInput.value = JSON.stringify(template.detail, null, 2);
    bubblesCheckbox.checked = template.bubbles;
    cancelableCheckbox.checked = template.cancelable;

    // Auto-preview
    this.previewEvent();
  }

  /**
   * Clear event creation form
   * @private
   */
  clearEventForm() {
    const eventNameInput = this.eventCreator.querySelector('#event-name');
    const eventDetailInput = this.eventCreator.querySelector('#event-detail');
    const bubblesCheckbox = this.eventCreator.querySelector('#event-bubbles');
    const cancelableCheckbox =
      this.eventCreator.querySelector('#event-cancelable');

    eventNameInput.value = '';
    eventDetailInput.value = '';
    bubblesCheckbox.checked = true;
    cancelableCheckbox.checked = true;

    this.clearEventPreview();
  }

  /**
   * Preview event creation
   * @private
   */
  previewEvent() {
    try {
      const eventData = this.getEventDataFromForm();
      const previewContent =
        this.eventCreator.querySelector('#preview-content');

      const previewCode = `// Custom Event Preview
const event = new CustomEvent('${eventData.name}', {
  detail: ${JSON.stringify(eventData.detail, null, 2)},
  bubbles: ${eventData.bubbles},
  cancelable: ${eventData.cancelable}
});

// Dispatch to: ${eventData.target}
target.dispatchEvent(event);`;

      previewContent.textContent = previewCode;
    } catch (error) {
      const previewContent =
        this.eventCreator.querySelector('#preview-content');
      previewContent.textContent = `// Error in event configuration:\n// ${error.message}`;
    }
  }

  /**
   * Clear event preview
   * @private
   */
  clearEventPreview() {
    const previewContent = this.eventCreator.querySelector('#preview-content');
    previewContent.textContent = '// Event preview will appear here';
  }

  /**
   * Get event data from form
   * @returns {Object} Event configuration
   * @private
   */
  getEventDataFromForm() {
    const eventName = this.eventCreator
      .querySelector('#event-name')
      .value.trim();
    const eventDetailText = this.eventCreator
      .querySelector('#event-detail')
      .value.trim();
    const bubbles = this.eventCreator.querySelector('#event-bubbles').checked;
    const cancelable =
      this.eventCreator.querySelector('#event-cancelable').checked;
    const target = this.eventCreator.querySelector('#dispatch-target').value;

    if (!eventName) {
      throw new Error('Event name is required');
    }

    let detail = {};
    if (eventDetailText) {
      try {
        detail = JSON.parse(eventDetailText);
      } catch (error) {
        throw new Error('Event detail must be valid JSON');
      }
    }

    return {
      name: eventName,
      detail,
      bubbles,
      cancelable,
      target
    };
  }

  /**
   * Create and dispatch custom event
   */
  createAndDispatchEvent() {
    try {
      const eventData = this.getEventDataFromForm();

      // Create the custom event
      const customEvent = new CustomEvent(eventData.name, {
        detail: eventData.detail,
        bubbles: eventData.bubbles,
        cancelable: eventData.cancelable
      });

      // Get target element
      const targetElement = this.getDispatchTarget(eventData.target);

      // Dispatch the event
      targetElement.dispatchEvent(customEvent);

      // Track the event
      this.trackEvent('created', eventData.name, eventData.detail);

      // Show success feedback
      this.showCreateEventFeedback(
        true,
        `Event "${eventData.name}" dispatched successfully!`
      );

      // Emit factory event
      this.emit('custom-event:created', {
        eventType: eventData.name,
        detail: eventData.detail,
        target: eventData.target
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      this.showCreateEventFeedback(false, error.message);
    }
  }

  /**
   * Get dispatch target element
   * @param {string} targetName - Target identifier
   * @returns {HTMLElement} Target element
   * @private
   */
  getDispatchTarget(targetName) {
    switch (targetName) {
      case 'document':
        return document;
      case 'publisher':
        return this.container.querySelector('#publisher');
      case 'subscriber':
        return this.container.querySelector('#subscriber');
      case 'analyzer':
        return this.container.querySelector('#analyzer');
      default:
        return document;
    }
  }

  /**
   * Show feedback for event creation
   * @param {boolean} success - Whether creation was successful
   * @param {string} message - Feedback message
   * @private
   */
  showCreateEventFeedback(success, message) {
    // Remove existing feedback
    const existingFeedback =
      this.eventCreator.querySelector('.creation-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `creation-feedback ${success ? 'success' : 'error'}`;
    feedback.textContent = message;

    // Add to form
    const formActions = this.eventCreator.querySelector('.form-actions');
    formActions.appendChild(feedback);

    // Remove after delay
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 3000);
  }

  /**
   * Dispatch a template event
   * @param {string} templateName - Template name
   */
  dispatchTemplateEvent(templateName) {
    const template = this.eventTemplates.get(templateName);
    if (!template) return;

    // Add timestamp to detail
    const eventDetail = {
      ...template.detail,
      timestamp: Date.now(),
      source: 'publisher-component'
    };

    const customEvent = new CustomEvent(template.name, {
      detail: eventDetail,
      bubbles: template.bubbles,
      cancelable: template.cancelable
    });

    // Dispatch from publisher component
    const publisher = this.container.querySelector('#publisher');
    publisher.dispatchEvent(customEvent);

    // Update publisher stats
    const publishedCount = this.container.querySelector('#published-count');
    if (publishedCount) {
      const count = parseInt(publishedCount.textContent) + 1;
      publishedCount.textContent = count;
    }

    // Track the event
    this.trackEvent('template', template.name, eventDetail);
  }

  /**
   * Add event listener for specific event type
   * @param {string} eventType - Event type to listen for
   */
  addEventListener(eventType) {
    if (this.activeListeners.has(eventType)) {
      console.warn(`Already listening for ${eventType} events`);
      return;
    }

    const handler = event => {
      this.handleSubscribedEvent(event);
    };

    // Add listener to document to catch bubbling events
    document.addEventListener(eventType, handler);

    // Store for cleanup
    this.activeListeners.set(eventType, handler);

    console.log(`👂 Now listening for "${eventType}" events`);

    // Update subscriber feedback
    this.updateSubscriberStatus();
  }

  /**
   * Add universal event listener
   */
  addUniversalListener() {
    if (this.activeListeners.has('*')) {
      console.warn('Universal listener already active');
      return;
    }

    // Create a proxy to catch all custom events
    const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
    const universalHandler = function (event) {
      // Track all custom events
      if (event instanceof CustomEvent) {
        this.handleSubscribedEvent(event);
      }
      return originalDispatchEvent.call(this, event);
    }.bind(this);

    // Store reference for cleanup
    this.activeListeners.set('*', {
      original: originalDispatchEvent,
      handler: universalHandler
    });

    // Override dispatchEvent globally
    EventTarget.prototype.dispatchEvent = universalHandler;

    console.log('👂 Universal event listener activated');
    this.updateSubscriberStatus();
  }

  /**
   * Handle subscribed events
   * @param {CustomEvent} event - Received event
   * @private
   */
  handleSubscribedEvent(event) {
    // Update subscriber stats
    const receivedCount = this.container.querySelector('#received-count');
    if (receivedCount) {
      const count = parseInt(receivedCount.textContent) + 1;
      receivedCount.textContent = count;
    }

    // Track the event
    this.trackEvent('received', event.type, event.detail);

    console.log(`📻 Received event: ${event.type}`, event.detail);
  }

  /**
   * Update subscriber status display
   * @private
   */
  updateSubscriberStatus() {
    const subscriberComponent = this.container.querySelector('#subscriber');
    const listenerCount = this.activeListeners.size;

    subscriberComponent.setAttribute('data-listeners', listenerCount);

    if (listenerCount > 0) {
      subscriberComponent.classList.add('active');
    } else {
      subscriberComponent.classList.remove('active');
    }
  }

  /**
   * Initialize analytics component
   * @private
   */
  initializeAnalytics() {
    this.analytics = {
      totalEvents: 0,
      eventTypes: new Set(),
      firstEventTime: null,
      lastEventTime: null
    };

    this.updateAnalyticsDisplay();
  }

  /**
   * Track event for analytics
   * @param {string} action - Event action (created, received, template)
   * @param {string} eventType - Event type
   * @param {Object} detail - Event detail
   * @private
   */
  trackEvent(action, eventType, detail) {
    const eventRecord = {
      action,
      type: eventType,
      detail,
      timestamp: Date.now(),
      id: ++this.eventCounter
    };

    // Add to history
    this.eventHistory.push(eventRecord);

    // Limit history size
    if (this.eventHistory.length > this.options.maxEventHistory) {
      this.eventHistory.shift();
    }

    // Update analytics
    this.analytics.totalEvents++;
    this.analytics.eventTypes.add(eventType);

    if (!this.analytics.firstEventTime) {
      this.analytics.firstEventTime = eventRecord.timestamp;
    }
    this.analytics.lastEventTime = eventRecord.timestamp;

    // Update displays
    this.updateAnalyticsDisplay();
    this.updateHistoryDisplay();
    this.updateEventMonitor(eventRecord);
  }

  /**
   * Update analytics display
   * @private
   */
  updateAnalyticsDisplay() {
    const totalEventsEl = this.container.querySelector('#total-events');
    const eventTypesEl = this.container.querySelector('#event-types');
    const avgFrequencyEl = this.container.querySelector('#avg-frequency');

    if (totalEventsEl) {
      totalEventsEl.textContent = this.analytics.totalEvents;
    }

    if (eventTypesEl) {
      eventTypesEl.textContent = this.analytics.eventTypes.size;
    }

    if (
      avgFrequencyEl &&
      this.analytics.firstEventTime &&
      this.analytics.lastEventTime
    ) {
      const duration =
        (this.analytics.lastEventTime - this.analytics.firstEventTime) / 1000;
      const frequency =
        duration > 0 ? (this.analytics.totalEvents / duration).toFixed(2) : 0;
      avgFrequencyEl.textContent = `${frequency}/sec`;
    }
  }

  /**
   * Update history display
   * @private
   */
  updateHistoryDisplay() {
    const historyList = this.container.querySelector('#history-list');
    const totalEl = this.container.querySelector('#history-total');
    const typesEl = this.container.querySelector('#history-types');

    // Update stats
    if (totalEl) totalEl.textContent = this.eventHistory.length;
    if (typesEl) {
      const types = new Set(this.eventHistory.map(e => e.type));
      typesEl.textContent = types.size;
    }

    // Show recent events (last 10)
    const recentEvents = this.eventHistory.slice(-10).reverse();

    const entriesHTML = recentEvents
      .map(event => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        const actionIcon = this.getActionIcon(event.action);

        return `
        <div class="history-entry ${event.action}">
          <span class="entry-time">${time}</span>
          <span class="entry-action">${actionIcon}</span>
          <span class="entry-type">${event.type}</span>
          <span class="entry-detail">${JSON.stringify(event.detail).substring(0, 50)}...</span>
        </div>
      `;
      })
      .join('');

    historyList.innerHTML =
      entriesHTML ||
      `
      <div class="history-entry info">
        <span class="entry-time">Empty</span>
        <span class="entry-message">No events recorded yet</span>
      </div>
    `;
  }

  /**
   * Get icon for event action
   * @param {string} action - Event action
   * @returns {string} Action icon
   * @private
   */
  getActionIcon(action) {
    const icons = {
      created: '✨',
      template: '📡',
      received: '📻'
    };
    return icons[action] || '📍';
  }

  /**
   * Start event monitoring
   */
  startEventMonitoring() {
    this.isMonitoring = true;

    const status = this.eventMonitor.querySelector('#monitor-status');
    if (status) {
      status.textContent = 'Monitoring';
      status.className = 'monitor-status active';
    }

    console.log('📡 Event monitoring started');
  }

  /**
   * Pause event monitoring
   */
  pauseEventMonitoring() {
    this.isMonitoring = false;

    const status = this.eventMonitor.querySelector('#monitor-status');
    if (status) {
      status.textContent = 'Paused';
      status.className = 'monitor-status paused';
    }

    console.log('⏸️ Event monitoring paused');
  }

  /**
   * Clear event monitor
   */
  clearEventMonitor() {
    const eventStream = this.eventMonitor.querySelector('#event-stream');
    eventStream.innerHTML = `
      <div class="stream-entry info">
        <span class="entry-time">Cleared</span>
        <span class="entry-message">Event stream cleared</span>
      </div>
    `;
  }

  /**
   * Update event monitor with new event
   * @param {Object} eventRecord - Event record
   * @private
   */
  updateEventMonitor(eventRecord) {
    if (!this.isMonitoring) return;

    const eventStream = this.eventMonitor.querySelector('#event-stream');
    const filterInput = this.eventMonitor.querySelector('#filter-events');
    const filter = filterInput ? filterInput.value.toLowerCase() : '';

    // Apply filter
    if (filter && !eventRecord.type.toLowerCase().includes(filter)) {
      return;
    }

    const time = new Date(eventRecord.timestamp).toLocaleTimeString();
    const actionIcon = this.getActionIcon(eventRecord.action);

    const streamEntry = document.createElement('div');
    streamEntry.className = `stream-entry ${eventRecord.action}`;
    streamEntry.innerHTML = `
      <span class="entry-time">${time}</span>
      <span class="entry-action">${actionIcon}</span>
      <span class="entry-type">${eventRecord.type}</span>
      <span class="entry-detail">${JSON.stringify(eventRecord.detail)}</span>
    `;

    eventStream.appendChild(streamEntry);

    // Scroll to bottom
    eventStream.scrollTop = eventStream.scrollHeight;

    // Limit entries
    while (eventStream.children.length > 50) {
      eventStream.removeChild(eventStream.firstChild);
    }
  }

  /**
   * Save event template
   */
  saveEventTemplate() {
    try {
      const eventData = this.getEventDataFromForm();
      const templateName = prompt('Enter template name:', eventData.name);

      if (!templateName) return;

      const template = {
        name: eventData.name,
        detail: eventData.detail,
        bubbles: eventData.bubbles,
        cancelable: eventData.cancelable,
        description: `Custom template: ${templateName}`
      };

      this.eventTemplates.set(templateName, template);

      // Update template selector
      const templateSelect = this.eventCreator.querySelector('#event-type');
      const option = document.createElement('option');
      option.value = templateName;
      option.textContent = templateName;
      templateSelect.appendChild(option);

      this.showCreateEventFeedback(
        true,
        `Template "${templateName}" saved successfully!`
      );
    } catch (error) {
      this.showCreateEventFeedback(false, error.message);
    }
  }

  /**
   * Export event history
   */
  exportEventHistory() {
    const data = {
      events: this.eventHistory,
      analytics: this.analytics,
      templates: Array.from(this.eventTemplates.entries()),
      exportTime: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `custom-events-history-${Date.now()}.json`;
    link.click();

    console.log('📥 Event history exported');
  }

  /**
   * Clear event history
   */
  clearEventHistory() {
    this.eventHistory = [];
    this.analytics = {
      totalEvents: 0,
      eventTypes: new Set(),
      firstEventTime: null,
      lastEventTime: null
    };

    this.updateAnalyticsDisplay();
    this.updateHistoryDisplay();
    this.clearEventMonitor();

    console.log('🗑️ Event history cleared');
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
   * Reset factory to initial state
   */
  reset() {
    console.log('🔄 Resetting Custom Event Factory...');

    // Clear forms
    this.clearEventForm();

    // Clear history and analytics
    this.clearEventHistory();

    // Remove all active listeners
    this.removeAllListeners();

    // Reset component stats
    const publishedCount = this.container.querySelector('#published-count');
    const receivedCount = this.container.querySelector('#received-count');

    if (publishedCount) publishedCount.textContent = '0';
    if (receivedCount) receivedCount.textContent = '0';

    // Reset monitoring
    this.pauseEventMonitoring();

    this.emit('factory:reset');
  }

  /**
   * Remove all active event listeners
   * @private
   */
  removeAllListeners() {
    this.activeListeners.forEach((handler, eventType) => {
      if (eventType === '*') {
        // Restore original dispatchEvent
        EventTarget.prototype.dispatchEvent = handler.original;
      } else {
        document.removeEventListener(eventType, handler);
      }
    });

    this.activeListeners.clear();
    this.updateSubscriberStatus();

    console.log('🧹 All event listeners removed');
  }

  /**
   * Deactivate the factory
   */
  deactivate() {
    console.log('⏸️ Deactivating Custom Event Factory...');

    this.removeAllListeners();
    this.pauseEventMonitoring();

    this.isActive = false;
    this.emit('factory:deactivated');
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
   * Add event listener
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
      isMonitoring: this.isMonitoring,
      eventCounter: this.eventCounter,
      historySize: this.eventHistory.length,
      activeListeners: Array.from(this.activeListeners.keys()),
      analytics: {
        ...this.analytics,
        eventTypes: Array.from(this.analytics.eventTypes)
      },
      options: this.options
    };
  }

  /**
   * Export factory data
   * @param {string} format - Export format
   * @returns {string|Object} Exported data
   */
  exportData(format = 'json') {
    const data = {
      events: this.eventHistory,
      analytics: {
        ...this.analytics,
        eventTypes: Array.from(this.analytics.eventTypes)
      },
      templates: Array.from(this.eventTemplates.entries()),
      activeListeners: Array.from(this.activeListeners.keys()),
      timestamp: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);

      case 'csv':
        const csvHeaders = 'timestamp,action,type,detail\n';
        const csvRows = this.eventHistory
          .map(
            event =>
              `${new Date(event.timestamp).toISOString()},${event.action},${event.type},"${JSON.stringify(event.detail).replace(/"/g, '""')}"`
          )
          .join('\n');
        return csvHeaders + csvRows;

      default:
        return data;
    }
  }

  /**
   * Destroy the component and clean up resources
   */
  destroy() {
    console.log('🗑️ Destroying Custom Event Factory...');

    // Deactivate first
    if (this.isActive) {
      this.deactivate();
    }

    // Remove all listeners
    this.removeAllListeners();

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove('custom-event-factory');
    }

    // Reset state
    this.isInitialized = false;
    this.isActive = false;
    this.eventHistory = [];
    this.activeListeners.clear();
    this.eventCounter = 0;

    console.log('✅ Custom Event Factory destroyed');
  }
}
