/**
 * ListenerProfiler - Event performance monitoring and analysis
 *
 * This component monitors event listener performance, memory usage, and provides
 * insights for optimization. It helps developers understand the performance
 * implications of their event handling strategies.
 *
 * Educational Goals:
 * - Monitor event listener performance
 * - Detect memory leaks in event handlers
 * - Analyze event timing and frequency
 * - Provide optimization recommendations
 *
 * @author DOM Visualizer OOP Team
 * @version 1.0.0
 */

/**
 * ListenerProfiler Class
 * Provides comprehensive event performance monitoring
 */
export class ListenerProfiler {
  /**
   * Initialize the Listener Profiler
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      trackEventTiming: true,
      trackMemoryUsage: true,
      updateInterval: 1000,
      maxHistorySize: 1000,
      enableWarnings: true,
      warningThresholds: {
        listenerCount: 100,
        handlerTime: 10, // milliseconds
        memoryGrowth: 50, // MB
        eventFrequency: 100 // events per second
      },
      ...options
    };

    // Profiler state
    this.isMonitoring = false;
    this.startTime = null;
    this.metrics = {
      listenerCount: 0,
      eventsFired: 0,
      avgHandlerTime: 0,
      memoryUsage: 0,
      eventTypes: new Map(),
      handlerTimes: [],
      memoryHistory: [],
      eventFrequency: 0
    };

    // Tracking data
    this.trackedListeners = new Map();
    this.eventTimings = [];
    this.memorySnapshots = [];
    this.warningsIssued = new Set();

    // Performance monitoring
    this.updateTimer = null;
    this.originalAddEventListener = null;
    this.originalRemoveEventListener = null;

    console.log('📊 ListenerProfiler initialized with options:', this.options);
  }

  /**
   * Start monitoring event listener performance
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn('⚠️ Profiler already monitoring');
      return;
    }

    console.log('🚀 Starting event listener profiling...');

    try {
      this.isMonitoring = true;
      this.startTime = performance.now();

      // Override addEventListener to track listeners
      this.instrumentEventListeners();

      // Start periodic updates
      this.startPeriodicUpdates();

      // Take initial memory snapshot
      this.takeMemorySnapshot();

      console.log('✅ Event listener profiling started');
    } catch (error) {
      console.error('❌ Failed to start profiling:', error);
      this.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    console.log('⏹️ Stopping event listener profiling...');

    this.isMonitoring = false;

    // Restore original methods
    this.restoreEventListeners();

    // Stop periodic updates
    this.stopPeriodicUpdates();

    // Generate final report
    this.generateFinalReport();

    console.log('✅ Event listener profiling stopped');
  }

  /**
   * Instrument addEventListener and removeEventListener
   * @private
   */
  instrumentEventListeners() {
    // Store original methods
    this.originalAddEventListener = EventTarget.prototype.addEventListener;
    this.originalRemoveEventListener =
      EventTarget.prototype.removeEventListener;

    const profiler = this;

    // Override addEventListener
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      const element = this;
      const listenerId = profiler.generateListenerId(element, type, listener);

      // Create wrapped listener for timing
      const wrappedListener = profiler.wrapListener(listener, type, listenerId);

      // Track the listener
      profiler.trackListener(element, type, wrappedListener, listener, options);

      // Call original method with wrapped listener
      return profiler.originalAddEventListener.call(
        this,
        type,
        wrappedListener,
        options
      );
    };

    // Override removeEventListener
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options
    ) {
      const element = this;
      const listenerId = profiler.generateListenerId(element, type, listener);

      // Get wrapped listener
      const trackedListener = profiler.trackedListeners.get(listenerId);
      if (trackedListener) {
        // Remove with wrapped listener
        const result = profiler.originalRemoveEventListener.call(
          this,
          type,
          trackedListener.wrappedListener,
          options
        );

        // Untrack the listener
        profiler.untrackListener(listenerId);

        return result;
      }

      // Fallback to original method
      return profiler.originalRemoveEventListener.call(
        this,
        type,
        listener,
        options
      );
    };
  }

  /**
   * Restore original addEventListener and removeEventListener
   * @private
   */
  restoreEventListeners() {
    if (this.originalAddEventListener) {
      EventTarget.prototype.addEventListener = this.originalAddEventListener;
    }

    if (this.originalRemoveEventListener) {
      EventTarget.prototype.removeEventListener =
        this.originalRemoveEventListener;
    }
  }

  /**
   * Generate unique listener ID
   * @param {EventTarget} element - Target element
   * @param {string} type - Event type
   * @param {Function} listener - Event listener
   * @returns {string} Unique listener ID
   * @private
   */
  generateListenerId(element, type, listener) {
    const elementId = element.id || element.tagName || 'unknown';
    const listenerString = listener.toString().substring(0, 50);
    const timestamp = Date.now();

    return `${elementId}-${type}-${btoa(listenerString).substring(0, 10)}-${timestamp}`;
  }

  /**
   * Wrap listener function for performance tracking
   * @param {Function} originalListener - Original listener function
   * @param {string} eventType - Event type
   * @param {string} listenerId - Listener identifier
   * @returns {Function} Wrapped listener
   * @private
   */
  wrapListener(originalListener, eventType, listenerId) {
    const profiler = this;

    return function wrappedEventListener(event) {
      const startTime = performance.now();

      try {
        // Call original listener
        const result = originalListener.call(this, event);

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Record timing if monitoring is active
        if (profiler.isMonitoring && profiler.options.trackEventTiming) {
          profiler.recordEventTiming(eventType, executionTime, listenerId);
        }

        return result;
      } catch (error) {
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Record error timing
        if (profiler.isMonitoring) {
          profiler.recordEventError(
            eventType,
            error,
            executionTime,
            listenerId
          );
        }

        throw error;
      }
    };
  }

  /**
   * Track a new event listener
   * @param {EventTarget} element - Target element
   * @param {string} type - Event type
   * @param {Function} wrappedListener - Wrapped listener function
   * @param {Function} originalListener - Original listener function
   * @param {Object|boolean} options - Event listener options
   * @private
   */
  trackListener(element, type, wrappedListener, originalListener, options) {
    const listenerId = this.generateListenerId(element, type, originalListener);

    const listenerData = {
      id: listenerId,
      element,
      type,
      wrappedListener,
      originalListener,
      options,
      addedAt: Date.now(),
      callCount: 0,
      totalTime: 0,
      avgTime: 0,
      errors: []
    };

    this.trackedListeners.set(listenerId, listenerData);
    this.metrics.listenerCount++;

    // Update event type tracking
    const typeCount = this.metrics.eventTypes.get(type) || 0;
    this.metrics.eventTypes.set(type, typeCount + 1);

    this.checkThresholds();

    if (this.options.enableWarnings) {
      this.checkForPotentialIssues(listenerData);
    }
  }

  /**
   * Untrack an event listener
   * @param {string} listenerId - Listener identifier
   * @private
   */
  untrackListener(listenerId) {
    const listenerData = this.trackedListeners.get(listenerId);
    if (!listenerData) return;

    // Update metrics
    this.metrics.listenerCount--;

    // Update event type count
    const typeCount = this.metrics.eventTypes.get(listenerData.type);
    if (typeCount <= 1) {
      this.metrics.eventTypes.delete(listenerData.type);
    } else {
      this.metrics.eventTypes.set(listenerData.type, typeCount - 1);
    }

    // Remove from tracking
    this.trackedListeners.delete(listenerId);
  }

  /**
   * Record event timing data
   * @param {string} eventType - Event type
   * @param {number} executionTime - Execution time in milliseconds
   * @param {string} listenerId - Listener identifier
   * @private
   */
  recordEventTiming(eventType, executionTime, listenerId) {
    // Update global metrics
    this.metrics.eventsFired++;
    this.metrics.handlerTimes.push(executionTime);

    // Calculate average handler time
    if (this.metrics.handlerTimes.length > 100) {
      this.metrics.handlerTimes.shift(); // Keep last 100 timings
    }

    this.metrics.avgHandlerTime =
      this.metrics.handlerTimes.reduce((sum, time) => sum + time, 0) /
      this.metrics.handlerTimes.length;

    // Update specific listener data
    const listenerData = this.trackedListeners.get(listenerId);
    if (listenerData) {
      listenerData.callCount++;
      listenerData.totalTime += executionTime;
      listenerData.avgTime = listenerData.totalTime / listenerData.callCount;
    }

    // Store timing for analysis
    this.eventTimings.push({
      eventType,
      executionTime,
      listenerId,
      timestamp: Date.now()
    });

    // Limit timing history
    if (this.eventTimings.length > this.options.maxHistorySize) {
      this.eventTimings.shift();
    }

    // Check for performance warnings
    if (
      this.options.enableWarnings &&
      executionTime > this.options.warningThresholds.handlerTime
    ) {
      this.issuePerformanceWarning('slow-handler', {
        eventType,
        executionTime,
        listenerId,
        threshold: this.options.warningThresholds.handlerTime
      });
    }
  }

  /**
   * Record event error
   * @param {string} eventType - Event type
   * @param {Error} error - Error object
   * @param {number} executionTime - Time before error
   * @param {string} listenerId - Listener identifier
   * @private
   */
  recordEventError(eventType, error, executionTime, listenerId) {
    const errorData = {
      eventType,
      error: error.message,
      stack: error.stack,
      executionTime,
      listenerId,
      timestamp: Date.now()
    };

    // Add to listener's error list
    const listenerData = this.trackedListeners.get(listenerId);
    if (listenerData) {
      listenerData.errors.push(errorData);
    }

    console.error('🚨 Event handler error recorded:', errorData);
  }

  /**
   * Start periodic metric updates
   * @private
   */
  startPeriodicUpdates() {
    this.updateTimer = setInterval(() => {
      this.updateMetrics();
    }, this.options.updateInterval);
  }

  /**
   * Stop periodic updates
   * @private
   */
  stopPeriodicUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Update performance metrics
   * @private
   */
  updateMetrics() {
    if (!this.isMonitoring) return;

    // Update memory usage if supported
    if (this.options.trackMemoryUsage && performance.memory) {
      this.takeMemorySnapshot();
    }

    // Calculate event frequency
    this.calculateEventFrequency();

    // Emit metrics update event
    this.emit('metrics:updated', this.getMetrics());
  }

  /**
   * Take memory snapshot
   * @private
   */
  takeMemorySnapshot() {
    if (!performance.memory) return;

    const memoryInfo = {
      used: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
      total: performance.memory.totalJSHeapSize / 1024 / 1024, // MB
      limit: performance.memory.jsHeapSizeLimit / 1024 / 1024, // MB
      timestamp: Date.now()
    };

    this.memorySnapshots.push(memoryInfo);
    this.metrics.memoryUsage = memoryInfo.used;

    // Limit memory history
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots.shift();
    }

    // Check for memory growth warnings
    if (this.options.enableWarnings && this.memorySnapshots.length > 1) {
      const previous = this.memorySnapshots[this.memorySnapshots.length - 2];
      const growth = memoryInfo.used - previous.used;

      if (growth > this.options.warningThresholds.memoryGrowth) {
        this.issuePerformanceWarning('memory-growth', {
          growth,
          current: memoryInfo.used,
          previous: previous.used,
          threshold: this.options.warningThresholds.memoryGrowth
        });
      }
    }
  }

  /**
   * Calculate event frequency
   * @private
   */
  calculateEventFrequency() {
    const now = Date.now();
    const timeWindow = 1000; // 1 second

    // Count events in the last second
    const recentEvents = this.eventTimings.filter(
      timing => now - timing.timestamp <= timeWindow
    );

    this.metrics.eventFrequency = recentEvents.length;

    // Check frequency warning
    if (
      this.options.enableWarnings &&
      this.metrics.eventFrequency >
        this.options.warningThresholds.eventFrequency
    ) {
      this.issuePerformanceWarning('high-frequency', {
        frequency: this.metrics.eventFrequency,
        threshold: this.options.warningThresholds.eventFrequency
      });
    }
  }

  /**
   * Check performance thresholds
   * @private
   */
  checkThresholds() {
    if (!this.options.enableWarnings) return;

    // Check listener count threshold
    if (
      this.metrics.listenerCount > this.options.warningThresholds.listenerCount
    ) {
      this.issuePerformanceWarning('listener-count', {
        count: this.metrics.listenerCount,
        threshold: this.options.warningThresholds.listenerCount
      });
    }
  }

  /**
   * Check for potential issues in listener configuration
   * @param {Object} listenerData - Listener data
   * @private
   */
  checkForPotentialIssues(listenerData) {
    // Check for common anti-patterns
    const { element, type, originalListener } = listenerData;

    // Check for inline handlers (potential memory leaks)
    if (originalListener.toString().includes('function(')) {
      this.issuePerformanceWarning('inline-handler', {
        listenerId: listenerData.id,
        eventType: type,
        suggestion:
          'Consider using named functions for better performance and debugging'
      });
    }

    // Check for document/window listeners without cleanup
    if (
      (element === document || element === window) &&
      !this.hasCleanupPattern(originalListener)
    ) {
      this.issuePerformanceWarning('global-listener', {
        listenerId: listenerData.id,
        eventType: type,
        target: element === document ? 'document' : 'window',
        suggestion:
          'Ensure global listeners are properly removed to prevent memory leaks'
      });
    }
  }

  /**
   * Check if listener has cleanup pattern
   * @param {Function} listener - Listener function
   * @returns {boolean} Whether cleanup pattern is detected
   * @private
   */
  hasCleanupPattern(listener) {
    const listenerString = listener.toString();
    return (
      listenerString.includes('removeEventListener') ||
      listenerString.includes('cleanup') ||
      listenerString.includes('destroy')
    );
  }

  /**
   * Issue performance warning
   * @param {string} warningType - Type of warning
   * @param {Object} details - Warning details
   * @private
   */
  issuePerformanceWarning(warningType, details) {
    const warningKey = `${warningType}-${JSON.stringify(details)}`;

    // Avoid duplicate warnings
    if (this.warningsIssued.has(warningKey)) return;

    this.warningsIssued.add(warningKey);

    const warning = {
      type: warningType,
      details,
      timestamp: Date.now(),
      message: this.getWarningMessage(warningType, details)
    };

    console.warn('⚠️ Performance Warning:', warning);

    // Emit warning event
    this.emit('performance:warning', warning);
  }

  /**
   * Get warning message for warning type
   * @param {string} warningType - Warning type
   * @param {Object} details - Warning details
   * @returns {string} Warning message
   * @private
   */
  getWarningMessage(warningType, details) {
    const messages = {
      'listener-count': `High listener count: ${details.count} listeners (threshold: ${details.threshold})`,
      'slow-handler': `Slow event handler: ${details.executionTime.toFixed(2)}ms for ${details.eventType} (threshold: ${details.threshold}ms)`,
      'memory-growth': `Memory growth detected: +${details.growth.toFixed(2)}MB (threshold: ${details.threshold}MB)`,
      'high-frequency': `High event frequency: ${details.frequency} events/sec (threshold: ${details.threshold})`,
      'inline-handler': `Inline event handler detected for ${details.eventType}. ${details.suggestion}`,
      'global-listener': `Global ${details.target} listener for ${details.eventType}. ${details.suggestion}`
    };

    return messages[warningType] || `Unknown warning: ${warningType}`;
  }

  /**
   * Generate optimization recommendations
   * @returns {Array} Array of recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];

    // High listener count
    if (this.metrics.listenerCount > 50) {
      recommendations.push({
        type: 'delegation',
        priority: 'high',
        message: 'Consider using event delegation to reduce listener count',
        details: `Current: ${this.metrics.listenerCount} listeners`
      });
    }

    // Slow handlers
    if (this.metrics.avgHandlerTime > 5) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Optimize slow event handlers',
        details: `Average handler time: ${this.metrics.avgHandlerTime.toFixed(2)}ms`
      });
    }

    // Memory usage
    if (this.metrics.memoryUsage > 100) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: 'Monitor memory usage for potential leaks',
        details: `Current usage: ${this.metrics.memoryUsage.toFixed(2)}MB`
      });
    }

    // High frequency events
    if (this.metrics.eventFrequency > 50) {
      recommendations.push({
        type: 'throttling',
        priority: 'medium',
        message: 'Consider throttling or debouncing high-frequency events',
        details: `Current frequency: ${this.metrics.eventFrequency} events/sec`
      });
    }

    return recommendations;
  }

  /**
   * Generate final performance report
   * @private
   */
  generateFinalReport() {
    const duration = performance.now() - this.startTime;

    const report = {
      monitoringDuration: duration,
      totalListeners: this.metrics.listenerCount,
      totalEvents: this.metrics.eventsFired,
      eventTypes: Array.from(this.metrics.eventTypes.keys()),
      averageHandlerTime: this.metrics.avgHandlerTime,
      memoryUsage: this.metrics.memoryUsage,
      recommendations: this.getOptimizationRecommendations(),
      timestamp: Date.now()
    };

    console.log('📊 Performance Report:', report);

    // Emit final report
    this.emit('profiling:completed', report);

    return report;
  }

  /**
   * Get current metrics
   * @returns {Object} Current performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      eventTypes: Array.from(this.metrics.eventTypes.entries()),
      isMonitoring: this.isMonitoring,
      monitoringDuration: this.startTime
        ? performance.now() - this.startTime
        : 0
    };
  }

  /**
   * Get detailed listener information
   * @returns {Array} Array of listener details
   */
  getListenerDetails() {
    return Array.from(this.trackedListeners.values()).map(listener => ({
      id: listener.id,
      type: listener.type,
      element: listener.element.tagName || 'Unknown',
      callCount: listener.callCount,
      avgTime: listener.avgTime,
      totalTime: listener.totalTime,
      errors: listener.errors.length,
      addedAt: new Date(listener.addedAt).toISOString()
    }));
  }

  /**
   * Reset profiler data
   */
  reset() {
    console.log('🔄 Resetting profiler data...');

    // Reset metrics
    this.metrics = {
      listenerCount: this.trackedListeners.size,
      eventsFired: 0,
      avgHandlerTime: 0,
      memoryUsage: 0,
      eventTypes: new Map(),
      handlerTimes: [],
      memoryHistory: [],
      eventFrequency: 0
    };

    // Clear tracking data
    this.eventTimings = [];
    this.memorySnapshots = [];
    this.warningsIssued.clear();

    // Recalculate event types from tracked listeners
    this.trackedListeners.forEach(listener => {
      const typeCount = this.metrics.eventTypes.get(listener.type) || 0;
      this.metrics.eventTypes.set(listener.type, typeCount + 1);
    });

    this.emit('profiler:reset');
  }

  /**
   * Manually track a listener (for external use)
   * @param {EventTarget} element - Target element
   * @param {string} type - Event type
   * @param {Function} handler - Event handler
   */
  trackListener(element, type, handler) {
    if (!this.isMonitoring) return;

    const listenerId = this.generateListenerId(element, type, handler);
    this.trackListener(element, type, handler, handler, false);
  }

  /**
   * Update metrics manually
   */
  updateMetrics() {
    this.updateMetrics();
  }

  /**
   * Emit events for external listeners
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   * @private
   */
  emit(eventName, data) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent(`profiler:${eventName}`, {
        detail: data
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Add event listener
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   */
  on(eventName, handler) {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener(`profiler:${eventName}`, handler);
    }
  }

  /**
   * Remove event listener
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   */
  off(eventName, handler) {
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener(`profiler:${eventName}`, handler);
    }
  }

  /**
   * Export profiling data
   * @param {string} format - Export format ('json', 'csv')
   * @returns {string} Exported data
   */
  exportData(format = 'json') {
    const data = {
      metrics: this.getMetrics(),
      listeners: this.getListenerDetails(),
      timings: this.eventTimings,
      memorySnapshots: this.memorySnapshots,
      recommendations: this.getOptimizationRecommendations(),
      exportTime: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);

      case 'csv':
        // Export event timings as CSV
        const csvHeader = 'timestamp,eventType,executionTime,listenerId\n';
        const csvRows = this.eventTimings
          .map(
            timing =>
              `${new Date(timing.timestamp).toISOString()},${timing.eventType},${timing.executionTime},${timing.listenerId}`
          )
          .join('\n');
        return csvHeader + csvRows;

      default:
        return data;
    }
  }

  /**
   * Destroy profiler and clean up
   */
  destroy() {
    console.log('🗑️ Destroying ListenerProfiler...');

    // Stop monitoring
    if (this.isMonitoring) {
      this.stopMonitoring();
    }

    // Clear all data
    this.trackedListeners.clear();
    this.eventTimings = [];
    this.memorySnapshots = [];
    this.warningsIssued.clear();

    console.log('✅ ListenerProfiler destroyed');
  }
}
