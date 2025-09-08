/**
 * ElementManipulator Component
 *
 * Educational helper component for safe DOM element manipulation.
 * Provides utilities for creating, modifying, and managing DOM elements
 * with built-in validation and performance monitoring.
 *
 * @fileoverview DOM element manipulation utilities
 * @version 1.0.0
 * @author DOM Visualizer OOP Team
 */

/**
 * ElementManipulator class for safe DOM operations
 * @class ElementManipulator
 */
export class ElementManipulator {
  /**
   * Initialize the Element Manipulator
   * @param {Object} options - Configuration options
   * @param {boolean} [options.enableValidation=true] - Enable input validation
   * @param {boolean} [options.trackChanges=true] - Track manipulation history
   * @param {boolean} [options.sanitizeInput=true] - Sanitize user input
   */
  constructor(options = {}) {
    this.options = {
      enableValidation: true,
      trackChanges: true,
      sanitizeInput: true,
      ...options
    };

    // History tracking
    this.operationHistory = [];
    this.undoStack = [];
    this.redoStack = [];

    // Performance tracking
    this.performanceMetrics = {
      operationsCount: 0,
      averageTime: 0,
      totalTime: 0,
      lastOperation: null
    };

    // Validation rules
    this.validationRules = {
      tagNames: new Set([
        'div',
        'span',
        'p',
        'a',
        'img',
        'button',
        'input',
        'label',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'table',
        'tr',
        'td',
        'th',
        'thead',
        'tbody',
        'tfoot',
        'section',
        'article',
        'header',
        'footer',
        'nav',
        'aside',
        'main',
        'figure',
        'figcaption',
        'blockquote',
        'pre',
        'code'
      ]),
      safeAttributes: new Set([
        'id',
        'class',
        'title',
        'alt',
        'src',
        'href',
        'target',
        'data-*',
        'aria-*',
        'role',
        'tabindex',
        'style'
      ])
    };

    console.log('🔧 ElementManipulator initialized');
  }

  /**
   * Create a new DOM element with specified properties
   * @param {string} tagName - HTML tag name
   * @param {Object} [options={}] - Element options
   * @param {string} [options.id] - Element ID
   * @param {string} [options.className] - CSS classes
   * @param {Object} [options.attributes] - HTML attributes
   * @param {Object} [options.style] - Inline styles
   * @param {string} [options.textContent] - Text content
   * @param {string} [options.innerHTML] - HTML content (sanitized)
   * @returns {HTMLElement} Created element
   */
  createElement(tagName, options = {}) {
    const startTime = performance.now();

    try {
      // Validate tag name
      if (this.options.enableValidation) {
        this.validateTagName(tagName);
      }

      // Create element
      const element = document.createElement(tagName);

      // Set ID
      if (options.id) {
        if (this.options.enableValidation) {
          this.validateId(options.id);
        }
        element.id = options.id;
      }

      // Set classes
      if (options.className) {
        element.className = this.options.sanitizeInput
          ? this.sanitizeClassName(options.className)
          : options.className;
      }

      // Set attributes
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([name, value]) => {
          if (this.options.enableValidation) {
            this.validateAttribute(name, value);
          }
          element.setAttribute(
            name,
            this.options.sanitizeInput
              ? this.sanitizeAttributeValue(value)
              : value
          );
        });
      }

      // Set styles
      if (options.style) {
        Object.entries(options.style).forEach(([property, value]) => {
          if (this.options.enableValidation) {
            this.validateStyleProperty(property, value);
          }
          element.style[property] = value;
        });
      }

      // Set content
      if (options.textContent) {
        element.textContent = this.options.sanitizeInput
          ? this.sanitizeText(options.textContent)
          : options.textContent;
      } else if (options.innerHTML) {
        element.innerHTML = this.options.sanitizeInput
          ? this.sanitizeHTML(options.innerHTML)
          : options.innerHTML;
      }

      // Track operation
      this.trackOperation('createElement', {
        tagName,
        options,
        element,
        duration: performance.now() - startTime
      });

      console.log(`✨ Element created: ${tagName}`, element);
      return element;
    } catch (error) {
      console.error('❌ Failed to create element:', error);
      throw new Error(`Element creation failed: ${error.message}`);
    }
  }

  /**
   * Safely modify an existing element
   * @param {HTMLElement} element - Element to modify
   * @param {Object} changes - Changes to apply
   * @returns {Object} Modification result
   */
  modifyElement(element, changes) {
    const startTime = performance.now();

    try {
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error('Invalid element provided');
      }

      const originalState = this.captureElementState(element);
      const appliedChanges = [];

      // Apply changes
      Object.entries(changes).forEach(([property, value]) => {
        const change = this.applyChange(element, property, value);
        if (change) {
          appliedChanges.push(change);
        }
      });

      const result = {
        element,
        originalState,
        appliedChanges,
        success: true,
        duration: performance.now() - startTime
      };

      // Track operation
      this.trackOperation('modifyElement', result);

      // Add to undo stack
      if (this.options.trackChanges) {
        this.undoStack.push({
          type: 'modify',
          element,
          originalState,
          changes: appliedChanges,
          timestamp: Date.now()
        });
        this.redoStack = []; // Clear redo stack
      }

      console.log('🔧 Element modified:', appliedChanges);
      return result;
    } catch (error) {
      console.error('❌ Failed to modify element:', error);
      return {
        success: false,
        error: error.message,
        duration: performance.now() - startTime
      };
    }
  }

  /**
   * Apply a single change to an element
   * @param {HTMLElement} element - Target element
   * @param {string} property - Property to change
   * @param {*} value - New value
   * @returns {Object|null} Change record
   * @private
   */
  applyChange(element, property, value) {
    const oldValue = this.getPropertyValue(element, property);

    try {
      switch (property) {
        case 'textContent':
          element.textContent = this.options.sanitizeInput
            ? this.sanitizeText(value)
            : value;
          break;

        case 'innerHTML':
          element.innerHTML = this.options.sanitizeInput
            ? this.sanitizeHTML(value)
            : value;
          break;

        case 'className':
          element.className = this.options.sanitizeInput
            ? this.sanitizeClassName(value)
            : value;
          break;

        case 'id':
          if (this.options.enableValidation) {
            this.validateId(value);
          }
          element.id = value;
          break;

        default:
          // Handle attributes and styles
          if (property.startsWith('style.')) {
            const styleProp = property.substring(6);
            if (this.options.enableValidation) {
              this.validateStyleProperty(styleProp, value);
            }
            element.style[styleProp] = value;
          } else if (
            property.startsWith('data-') ||
            property.startsWith('aria-')
          ) {
            if (this.options.enableValidation) {
              this.validateAttribute(property, value);
            }
            element.setAttribute(
              property,
              this.options.sanitizeInput
                ? this.sanitizeAttributeValue(value)
                : value
            );
          } else {
            // Try to set as property first, then as attribute
            try {
              element[property] = value;
            } catch {
              element.setAttribute(
                property,
                this.options.sanitizeInput
                  ? this.sanitizeAttributeValue(value)
                  : value
              );
            }
          }
          break;
      }

      return {
        property,
        oldValue,
        newValue: value,
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn(`Failed to apply change ${property}:`, error);
      return null;
    }
  }

  /**
   * Get property value from element
   * @param {HTMLElement} element - Target element
   * @param {string} property - Property name
   * @returns {*} Property value
   * @private
   */
  getPropertyValue(element, property) {
    switch (property) {
      case 'textContent':
        return element.textContent;
      case 'innerHTML':
        return element.innerHTML;
      case 'className':
        return element.className;
      case 'id':
        return element.id;
      default:
        if (property.startsWith('style.')) {
          const styleProp = property.substring(6);
          return element.style[styleProp];
        } else if (
          property.startsWith('data-') ||
          property.startsWith('aria-')
        ) {
          return element.getAttribute(property);
        } else {
          return element[property] !== undefined
            ? element[property]
            : element.getAttribute(property);
        }
    }
  }

  /**
   * Capture current state of an element
   * @param {HTMLElement} element - Element to capture
   * @returns {Object} Element state
   * @private
   */
  captureElementState(element) {
    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent,
      innerHTML: element.innerHTML,
      attributes: this.getElementAttributes(element),
      styles: this.getElementStyles(element),
      timestamp: Date.now()
    };
  }

  /**
   * Get all attributes of an element
   * @param {HTMLElement} element - Target element
   * @returns {Object} Attributes object
   * @private
   */
  getElementAttributes(element) {
    const attributes = {};
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  }

  /**
   * Get computed styles of an element
   * @param {HTMLElement} element - Target element
   * @returns {Object} Styles object
   * @private
   */
  getElementStyles(element) {
    const styles = {};
    const computedStyle = window.getComputedStyle(element);

    // Get only explicitly set inline styles
    for (let i = 0; i < element.style.length; i++) {
      const property = element.style[i];
      styles[property] = element.style.getPropertyValue(property);
    }

    return styles;
  }

  /**
   * Insert element at specified position
   * @param {HTMLElement} element - Element to insert
   * @param {HTMLElement} parent - Parent element
   * @param {string|number} position - Position ('beforebegin', 'afterbegin', 'beforeend', 'afterend', or index)
   * @returns {Object} Operation result
   */
  insertElement(element, parent, position = 'beforeend') {
    const startTime = performance.now();

    try {
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error('Invalid element provided');
      }

      if (!parent || !(parent instanceof HTMLElement)) {
        throw new Error('Invalid parent element provided');
      }

      const originalParent = element.parentElement;
      const originalNextSibling = element.nextElementSibling;

      if (typeof position === 'string') {
        parent.insertAdjacentElement(position, element);
      } else if (typeof position === 'number') {
        const referenceElement = parent.children[position];
        if (referenceElement) {
          parent.insertBefore(element, referenceElement);
        } else {
          parent.appendChild(element);
        }
      } else {
        throw new Error('Invalid position specified');
      }

      const result = {
        element,
        parent,
        position,
        originalParent,
        originalNextSibling,
        success: true,
        duration: performance.now() - startTime
      };

      // Track operation
      this.trackOperation('insertElement', result);

      // Add to undo stack
      if (this.options.trackChanges) {
        this.undoStack.push({
          type: 'insert',
          element,
          originalParent,
          originalNextSibling,
          timestamp: Date.now()
        });
        this.redoStack = [];
      }

      console.log('📍 Element inserted:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to insert element:', error);
      return {
        success: false,
        error: error.message,
        duration: performance.now() - startTime
      };
    }
  }

  /**
   * Remove element from DOM
   * @param {HTMLElement} element - Element to remove
   * @returns {Object} Operation result
   */
  removeElement(element) {
    const startTime = performance.now();

    try {
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error('Invalid element provided');
      }

      const parent = element.parentElement;
      const nextSibling = element.nextElementSibling;
      const elementState = this.captureElementState(element);

      element.remove();

      const result = {
        element,
        parent,
        nextSibling,
        elementState,
        success: true,
        duration: performance.now() - startTime
      };

      // Track operation
      this.trackOperation('removeElement', result);

      // Add to undo stack
      if (this.options.trackChanges) {
        this.undoStack.push({
          type: 'remove',
          element,
          parent,
          nextSibling,
          elementState,
          timestamp: Date.now()
        });
        this.redoStack = [];
      }

      console.log('🗑️ Element removed:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to remove element:', error);
      return {
        success: false,
        error: error.message,
        duration: performance.now() - startTime
      };
    }
  }

  /**
   * Clone an element with options
   * @param {HTMLElement} element - Element to clone
   * @param {Object} [options={}] - Clone options
   * @param {boolean} [options.deep=true] - Deep clone
   * @param {Object} [options.modifications] - Modifications to apply to clone
   * @returns {HTMLElement} Cloned element
   */
  cloneElement(element, options = {}) {
    const startTime = performance.now();

    try {
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error('Invalid element provided');
      }

      const { deep = true, modifications = {} } = options;
      const clone = element.cloneNode(deep);

      // Apply modifications if provided
      if (Object.keys(modifications).length > 0) {
        this.modifyElement(clone, modifications);
      }

      // Generate unique ID if the original had one
      if (clone.id) {
        clone.id = this.generateUniqueId(clone.id);
      }

      // Track operation
      this.trackOperation('cloneElement', {
        originalElement: element,
        clonedElement: clone,
        options,
        duration: performance.now() - startTime
      });

      console.log('🔄 Element cloned:', clone);
      return clone;
    } catch (error) {
      console.error('❌ Failed to clone element:', error);
      throw new Error(`Element cloning failed: ${error.message}`);
    }
  }

  /**
   * Generate unique ID based on existing ID
   * @param {string} baseId - Base ID to modify
   * @returns {string} Unique ID
   * @private
   */
  generateUniqueId(baseId) {
    let counter = 1;
    let newId = `${baseId}_copy`;

    while (document.getElementById(newId)) {
      newId = `${baseId}_copy_${counter}`;
      counter++;
    }

    return newId;
  }

  /**
   * Undo last operation
   * @returns {boolean} Success status
   */
  undo() {
    if (this.undoStack.length === 0) {
      console.warn('⚠️ No operations to undo');
      return false;
    }

    const operation = this.undoStack.pop();

    try {
      switch (operation.type) {
        case 'modify':
          this.restoreElementState(operation.element, operation.originalState);
          break;

        case 'insert':
          if (operation.originalParent) {
            if (operation.originalNextSibling) {
              operation.originalParent.insertBefore(
                operation.element,
                operation.originalNextSibling
              );
            } else {
              operation.originalParent.appendChild(operation.element);
            }
          } else {
            operation.element.remove();
          }
          break;

        case 'remove':
          if (operation.nextSibling) {
            operation.parent.insertBefore(
              operation.element,
              operation.nextSibling
            );
          } else {
            operation.parent.appendChild(operation.element);
          }
          break;
      }

      this.redoStack.push(operation);
      console.log('↶ Operation undone:', operation.type);
      return true;
    } catch (error) {
      console.error('❌ Failed to undo operation:', error);
      // Put the operation back if undo failed
      this.undoStack.push(operation);
      return false;
    }
  }

  /**
   * Redo last undone operation
   * @returns {boolean} Success status
   */
  redo() {
    if (this.redoStack.length === 0) {
      console.warn('⚠️ No operations to redo');
      return false;
    }

    const operation = this.redoStack.pop();

    try {
      switch (operation.type) {
        case 'modify':
          // Reapply the changes
          operation.changes.forEach(change => {
            this.applyChange(
              operation.element,
              change.property,
              change.newValue
            );
          });
          break;

        case 'insert':
          // Remove from original position again
          operation.element.remove();
          break;

        case 'remove':
          // Remove the element again
          operation.element.remove();
          break;
      }

      this.undoStack.push(operation);
      console.log('↷ Operation redone:', operation.type);
      return true;
    } catch (error) {
      console.error('❌ Failed to redo operation:', error);
      // Put the operation back if redo failed
      this.redoStack.push(operation);
      return false;
    }
  }

  /**
   * Restore element to previous state
   * @param {HTMLElement} element - Element to restore
   * @param {Object} state - Previous state
   * @private
   */
  restoreElementState(element, state) {
    // Restore basic properties
    element.id = state.id || '';
    element.className = state.className || '';
    element.textContent = state.textContent || '';

    // Restore attributes
    Array.from(element.attributes).forEach(attr => {
      if (!state.attributes[attr.name]) {
        element.removeAttribute(attr.name);
      }
    });

    Object.entries(state.attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });

    // Restore styles
    element.style.cssText = '';
    Object.entries(state.styles).forEach(([property, value]) => {
      element.style[property] = value;
    });
  }

  /**
   * Track operation for history and metrics
   * @param {string} operationType - Type of operation
   * @param {Object} operationData - Operation data
   * @private
   */
  trackOperation(operationType, operationData) {
    const operation = {
      type: operationType,
      timestamp: Date.now(),
      duration: operationData.duration,
      data: operationData
    };

    this.operationHistory.push(operation);

    // Update performance metrics
    this.performanceMetrics.operationsCount++;
    this.performanceMetrics.totalTime += operationData.duration;
    this.performanceMetrics.averageTime =
      this.performanceMetrics.totalTime /
      this.performanceMetrics.operationsCount;
    this.performanceMetrics.lastOperation = operation;

    // Limit history size
    if (this.operationHistory.length > 1000) {
      this.operationHistory = this.operationHistory.slice(-500);
    }
  }

  /**
   * Validation methods
   */

  /**
   * Validate tag name
   * @param {string} tagName - Tag name to validate
   * @private
   */
  validateTagName(tagName) {
    if (!tagName || typeof tagName !== 'string') {
      throw new Error('Tag name must be a non-empty string');
    }

    const normalizedTag = tagName.toLowerCase();
    if (!this.validationRules.tagNames.has(normalizedTag)) {
      throw new Error(`Tag name '${tagName}' is not in the allowed list`);
    }
  }

  /**
   * Validate element ID
   * @param {string} id - ID to validate
   * @private
   */
  validateId(id) {
    if (typeof id !== 'string') {
      throw new Error('ID must be a string');
    }

    if (!/^[a-zA-Z][\w-]*$/.test(id)) {
      throw new Error(
        'ID must start with a letter and contain only letters, numbers, hyphens, and underscores'
      );
    }

    if (document.getElementById(id)) {
      console.warn(`⚠️ Element with ID '${id}' already exists`);
    }
  }

  /**
   * Validate attribute
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   * @private
   */
  validateAttribute(name, value) {
    if (typeof name !== 'string' || typeof value !== 'string') {
      throw new Error('Attribute name and value must be strings');
    }

    // Check if attribute is in safe list or follows allowed patterns
    const isSafe =
      this.validationRules.safeAttributes.has(name) ||
      name.startsWith('data-') ||
      name.startsWith('aria-');

    if (!isSafe) {
      throw new Error(`Attribute '${name}' is not in the safe attributes list`);
    }
  }

  /**
   * Validate style property
   * @param {string} property - CSS property
   * @param {string} value - CSS value
   * @private
   */
  validateStyleProperty(property, value) {
    if (typeof property !== 'string' || typeof value !== 'string') {
      throw new Error('Style property and value must be strings');
    }

    // Basic validation - could be expanded
    if (property.includes('javascript:') || value.includes('javascript:')) {
      throw new Error('JavaScript in styles is not allowed');
    }
  }

  /**
   * Sanitization methods
   */

  /**
   * Sanitize text content
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   * @private
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return '';

    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize HTML content (basic implementation)
   * @param {string} html - HTML to sanitize
   * @returns {string} Sanitized HTML
   * @private
   */
  sanitizeHTML(html) {
    if (typeof html !== 'string') return '';

    // This is a basic implementation - in production, use a proper HTML sanitizer
    const allowedTags = /<\/?(?:b|i|em|strong|span|p|br|a|ul|ol|li)\b[^>]*>/gi;

    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Sanitize class name
   * @param {string} className - Class name to sanitize
   * @returns {string} Sanitized class name
   * @private
   */
  sanitizeClassName(className) {
    if (typeof className !== 'string') return '';

    return className
      .split(' ')
      .filter(cls => cls.trim())
      .map(cls => cls.replace(/[^a-zA-Z0-9_-]/g, ''))
      .filter(cls => cls.length > 0)
      .join(' ');
  }

  /**
   * Sanitize attribute value
   * @param {string} value - Attribute value to sanitize
   * @returns {string} Sanitized value
   * @private
   */
  sanitizeAttributeValue(value) {
    if (typeof value !== 'string') return '';

    return value
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+/gi, '');
  }

  /**
   * Utility methods
   */

  /**
   * Get operation history
   * @returns {Array} Array of operations
   */
  getOperationHistory() {
    return [...this.operationHistory];
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length,
      historySize: this.operationHistory.length
    };
  }

  /**
   * Clear operation history
   */
  clearHistory() {
    this.operationHistory = [];
    this.undoStack = [];
    this.redoStack = [];
    console.log('🧹 Operation history cleared');
  }

  /**
   * Export operation history
   * @param {string} format - Export format ('json', 'csv')
   * @returns {string} Exported data
   */
  exportHistory(format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(
          {
            operations: this.operationHistory,
            metrics: this.performanceMetrics,
            exportedAt: new Date().toISOString()
          },
          null,
          2
        );

      case 'csv':
        const headers = 'timestamp,type,duration,element,details\n';
        const rows = this.operationHistory
          .map(op => {
            const elementInfo = op.data.element
              ? `${op.data.element.tagName}${op.data.element.id ? '#' + op.data.element.id : ''}`
              : 'N/A';
            return `${new Date(op.timestamp).toISOString()},${op.type},${op.duration},${elementInfo},"${JSON.stringify(op.data).replace(/"/g, '""')}"`;
          })
          .join('\n');
        return headers + rows;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Reset the manipulator to initial state
   */
  reset() {
    this.clearHistory();
    this.performanceMetrics = {
      operationsCount: 0,
      averageTime: 0,
      totalTime: 0,
      lastOperation: null
    };
    console.log('🔄 ElementManipulator reset');
  }

  /**
   * Get component status for debugging
   * @returns {Object} Component status
   */
  getStatus() {
    return {
      operationsCount: this.performanceMetrics.operationsCount,
      historySize: this.operationHistory.length,
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length,
      averageOperationTime: this.performanceMetrics.averageTime,
      options: { ...this.options },
      validationRules: {
        allowedTags: Array.from(this.validationRules.tagNames),
        safeAttributes: Array.from(this.validationRules.safeAttributes)
      }
    };
  }
}
