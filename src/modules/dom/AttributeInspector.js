/**
 * AttributeInspector - Real-time Element Attribute Analysis and Manipulation
 *
 * Provides comprehensive tools for examining and modifying element attributes,
 * including live editing, validation, and visual feedback for attribute changes.
 *
 * @fileoverview Attribute inspector component for DOM manipulation learning
 * @version 1.0.0
 */

export class AttributeInspector {
  /**
   * Create a new AttributeInspector instance
   * @param {HTMLElement} container - Container element for the inspector
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      enableLiveEdit: true,
      showComputedValues: true,
      enableValidation: true,
      showAttributeTypes: true,
      enableHistory: true,
      maxHistorySize: 50,
      ...options
    };

    // State management
    this.state = {
      currentElement: null,
      editingAttribute: null,
      filterText: '',
      showSystemAttributes: false,
      attributeHistory: [],
      undoStack: [],
      redoStack: []
    };

    // Attribute categories for organization
    this.attributeCategories = {
      core: ['id', 'class', 'title', 'lang', 'dir'],
      content: ['alt', 'src', 'href', 'value', 'placeholder', 'content'],
      form: ['name', 'type', 'required', 'disabled', 'readonly', 'checked'],
      interaction: ['tabindex', 'accesskey', 'contenteditable', 'draggable'],
      aria: [], // Populated dynamically with aria-* attributes
      data: [], // Populated dynamically with data-* attributes
      event: [], // Populated dynamically with on* attributes
      style: ['style'],
      meta: ['role', 'itemtype', 'itemprop', 'itemscope']
    };

    // Known attribute types for validation
    this.attributeTypes = {
      id: { type: 'identifier', unique: true },
      class: { type: 'tokens', separator: ' ' },
      style: { type: 'css', multiline: true },
      href: { type: 'url' },
      src: { type: 'url' },
      alt: { type: 'text' },
      title: { type: 'text' },
      value: { type: 'text' },
      tabindex: { type: 'number', min: -1 },
      colspan: { type: 'number', min: 1 },
      rowspan: { type: 'number', min: 1 },
      required: { type: 'boolean' },
      disabled: { type: 'boolean' },
      readonly: { type: 'boolean' },
      checked: { type: 'boolean' },
      selected: { type: 'boolean' },
      hidden: { type: 'boolean' },
      contenteditable: { type: 'enum', values: ['true', 'false', 'inherit'] },
      draggable: { type: 'enum', values: ['true', 'false', 'auto'] },
      spellcheck: { type: 'enum', values: ['true', 'false', 'default'] },
      autocomplete: {
        type: 'enum',
        values: ['on', 'off', 'name', 'email', 'current-password']
      },
      target: { type: 'enum', values: ['_blank', '_self', '_parent', '_top'] },
      method: { type: 'enum', values: ['GET', 'POST', 'PUT', 'DELETE'] },
      enctype: {
        type: 'enum',
        values: [
          'application/x-www-form-urlencoded',
          'multipart/form-data',
          'text/plain'
        ]
      }
    };

    // Event handlers
    this.eventHandlers = new Map();

    this.initialize();
  }

  /**
   * Initialize the attribute inspector
   * @private
   */
  initialize() {
    this.createInspectorInterface();
    this.setupEventListeners();
    this.setupValidationRules();

    console.log('🔍 AttributeInspector initialized');
  }

  /**
   * Create the main inspector interface
   * @private
   */
  createInspectorInterface() {
    this.container.innerHTML = `
      <div class="attribute-inspector">
        <div class="inspector-header">
          <div class="header-title">
            <h3>🔍 Attribute Inspector</h3>
            <p>Examine and modify element attributes in real-time</p>
          </div>

          <div class="inspector-controls">
            <div class="filter-section">
              <input
                type="text"
                id="attribute-filter"
                placeholder="Filter attributes..."
                class="filter-input"
              />
              <button class="filter-clear" id="clear-attribute-filter">✕</button>
            </div>

            <div class="view-options">
              <label class="checkbox-label">
                <input type="checkbox" id="show-system-attrs" />
                <span>System Attributes</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="show-computed-values" checked />
                <span>Computed Values</span>
              </label>
            </div>
          </div>
        </div>

        <div class="inspector-content">
          <div class="element-info-panel">
            <div id="current-element-info" class="current-element">
              <div class="element-placeholder">
                <div class="placeholder-icon">🎯</div>
                <p>Select an element to inspect its attributes</p>
              </div>
            </div>
          </div>

          <div class="attributes-panel">
            <div class="panel-header">
              <h4>Attributes</h4>
              <div class="panel-actions">
                <button class="action-btn" id="add-attribute">
                  <span class="icon">➕</span>
                  Add Attribute
                </button>
                <button class="action-btn" id="sort-attributes">
                  <span class="icon">🔤</span>
                  Sort
                </button>
              </div>
            </div>

            <div class="attributes-container">
              <div id="attributes-list" class="attributes-list">
                <!-- Attributes will be rendered here -->
              </div>
            </div>
          </div>

          <div class="categories-panel">
            <div class="panel-header">
              <h4>Categories</h4>
            </div>

            <div class="categories-container">
              <div class="category-tabs">
                <button class="category-tab active" data-category="all">All</button>
                <button class="category-tab" data-category="core">Core</button>
                <button class="category-tab" data-category="content">Content</button>
                <button class="category-tab" data-category="form">Form</button>
                <button class="category-tab" data-category="aria">ARIA</button>
                <button class="category-tab" data-category="data">Data</button>
              </div>

              <div id="category-content" class="category-content">
                <!-- Category-specific content will be rendered here -->
              </div>
            </div>
          </div>
        </div>

        <div class="inspector-sidebar">
          <div class="sidebar-section">
            <h4>Attribute Details</h4>
            <div id="attribute-details" class="attribute-details">
              <div class="details-placeholder">
                Select an attribute to view details
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h4>Validation</h4>
            <div id="validation-results" class="validation-results">
              <div class="validation-placeholder">
                No validation issues
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h4>Quick Actions</h4>
            <div class="quick-actions">
              <button class="action-btn" id="copy-attributes" disabled>
                <span class="icon">📋</span>
                Copy All
              </button>
              <button class="action-btn" id="paste-attributes" disabled>
                <span class="icon">📌</span>
                Paste
              </button>
              <button class="action-btn" id="clear-attributes" disabled>
                <span class="icon">🗑️</span>
                Clear All
              </button>
            </div>
          </div>

          <div class="sidebar-section">
            <h4>History</h4>
            <div class="history-controls">
              <button class="history-btn" id="undo-change" disabled>
                <span class="icon">↶</span>
                Undo
              </button>
              <button class="history-btn" id="redo-change" disabled>
                <span class="icon">↷</span>
                Redo
              </button>
            </div>
            <div id="history-list" class="history-list">
              <!-- History items will be rendered here -->
            </div>
          </div>
        </div>

        <div class="inspector-footer">
          <div class="footer-stats">
            <span class="stat">
              Attributes: <span id="attribute-count">0</span>
            </span>
            <span class="stat">
              Valid: <span id="valid-count">0</span>
            </span>
            <span class="stat">
              Issues: <span id="issues-count">0</span>
            </span>
          </div>

          <div class="footer-actions">
            <button class="footer-btn" id="export-attributes">
              <span class="icon">💾</span>
              Export
            </button>
            <button class="footer-btn" id="import-attributes">
              <span class="icon">📂</span>
              Import
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Set up event listeners for inspector interactions
   * @private
   */
  setupEventListeners() {
    // Filter functionality
    this.addEventListener('input', '#attribute-filter', event => {
      this.filterAttributes(event.target.value);
    });
    this.addEventListener('click', '#clear-attribute-filter', () =>
      this.clearFilter()
    );

    // View options
    this.addEventListener('change', '#show-system-attrs', event => {
      this.state.showSystemAttributes = event.target.checked;
      this.refreshAttributes();
    });
    this.addEventListener('change', '#show-computed-values', event => {
      this.options.showComputedValues = event.target.checked;
      this.refreshAttributes();
    });

    // Attribute actions
    this.addEventListener('click', '#add-attribute', () =>
      this.showAddAttributeDialog()
    );
    this.addEventListener('click', '#sort-attributes', () =>
      this.sortAttributes()
    );

    // Category tabs
    this.addEventListener('click', '.category-tab', event => {
      this.switchCategory(event.target.dataset.category);
    });

    // Quick actions
    this.addEventListener('click', '#copy-attributes', () =>
      this.copyAttributes()
    );
    this.addEventListener('click', '#paste-attributes', () =>
      this.pasteAttributes()
    );
    this.addEventListener('click', '#clear-attributes', () =>
      this.clearAllAttributes()
    );

    // History controls
    this.addEventListener('click', '#undo-change', () => this.undoChange());
    this.addEventListener('click', '#redo-change', () => this.redoChange());

    // Export/Import
    this.addEventListener('click', '#export-attributes', () =>
      this.exportAttributes()
    );
    this.addEventListener('click', '#import-attributes', () =>
      this.importAttributes()
    );

    // Attribute list interactions (delegated)
    this.addEventListener('click', '.attributes-list', event => {
      this.handleAttributeClick(event);
    });
    this.addEventListener('dblclick', '.attributes-list', event => {
      this.handleAttributeDoubleClick(event);
    });
    this.addEventListener('change', '.attributes-list', event => {
      this.handleAttributeChange(event);
    });
  }

  /**
   * Set up validation rules and patterns
   * @private
   */
  setupValidationRules() {
    this.validationRules = {
      url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      color: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      number: /^-?\d+(\.\d+)?$/,
      identifier: /^[a-zA-Z][\w-]*$/,
      className: /^[a-zA-Z][\w-]*(\s+[a-zA-Z][\w-]*)*$/
    };
  }

  /**
   * Set the element to inspect
   * @param {HTMLElement} element - Element to inspect
   */
  setSelectedElement(element) {
    if (this.state.currentElement === element) return;

    this.state.currentElement = element;
    this.state.editingAttribute = null;

    this.updateElementInfo();
    this.loadAttributes();
    this.updateQuickActions();
    this.validateAllAttributes();

    console.log(
      '🎯 Element selected for attribute inspection:',
      element?.tagName
    );
  }

  /**
   * Update current element information display
   * @private
   */
  updateElementInfo() {
    const infoContainer = this.container.querySelector('#current-element-info');

    if (!this.state.currentElement) {
      infoContainer.innerHTML = `
        <div class="element-placeholder">
          <div class="placeholder-icon">🎯</div>
          <p>Select an element to inspect its attributes</p>
        </div>
      `;
      return;
    }

    const element = this.state.currentElement;
    const tagName = element.tagName.toLowerCase();
    const id = element.id;
    const classes = element.className;

    infoContainer.innerHTML = `
      <div class="current-element-display">
        <div class="element-header">
          <div class="element-icon">${this.getElementIcon(element)}</div>
          <div class="element-identity">
            <h4 class="element-tag">&lt;${tagName}&gt;</h4>
            ${id ? `<span class="element-id">#${id}</span>` : ''}
            ${classes ? `<span class="element-classes">.${classes.split(' ').join('.')}</span>` : ''}
          </div>
        </div>

        <div class="element-summary">
          <div class="summary-item">
            <label>Attributes:</label>
            <span>${element.attributes.length}</span>
          </div>
          <div class="summary-item">
            <label>Node Type:</label>
            <span>${element.nodeType === 1 ? 'Element' : 'Other'}</span>
          </div>
          <div class="summary-item">
            <label>Tag Name:</label>
            <span>${tagName}</span>
          </div>
        </div>

        <div class="element-path">
          <label>Path:</label>
          <span class="path-display">${this.generateElementPath(element)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Load and display attributes for current element
   * @private
   */
  loadAttributes() {
    if (!this.state.currentElement) {
      this.renderAttributes([]);
      return;
    }

    const element = this.state.currentElement;
    const attributes = Array.from(element.attributes).map(attr => ({
      name: attr.name,
      value: attr.value,
      category: this.categorizeAttribute(attr.name),
      type: this.getAttributeType(attr.name),
      isValid: this.validateAttributeValue(attr.name, attr.value),
      isSystem: this.isSystemAttribute(attr.name),
      isEditable: true
    }));

    // Add computed values if enabled
    if (this.options.showComputedValues) {
      this.addComputedProperties(attributes, element);
    }

    this.renderAttributes(attributes);
    this.updateAttributeStats(attributes);
  }

  /**
   * Render attributes list
   * @param {Array} attributes - Array of attribute objects
   * @private
   */
  renderAttributes(attributes) {
    const attributesList = this.container.querySelector('#attributes-list');

    if (attributes.length === 0) {
      attributesList.innerHTML = `
        <div class="no-attributes">
          <div class="no-attributes-icon">📝</div>
          <p>No attributes found</p>
          <button class="add-first-attribute" onclick="this.closest('.attribute-inspector').inspector.showAddAttributeDialog()">
            Add First Attribute
          </button>
        </div>
      `;
      return;
    }

    // Filter attributes if needed
    const filteredAttributes = this.filterAttributesList(attributes);

    const attributesHTML = filteredAttributes
      .map(attr => this.renderAttributeItem(attr))
      .join('');

    attributesList.innerHTML = `
      <div class="attributes-grid">
        ${attributesHTML}
      </div>
    `;
  }

  /**
   * Render a single attribute item
   * @param {Object} attribute - Attribute object
   * @returns {string} HTML string
   * @private
   */
  renderAttributeItem(attribute) {
    const isEditing = this.state.editingAttribute === attribute.name;
    const statusIcon = attribute.isValid ? '✅' : '❌';
    const categoryColor = this.getCategoryColor(attribute.category);

    return `
      <div class="attribute-item ${attribute.isValid ? 'valid' : 'invalid'} ${attribute.isSystem ? 'system' : ''}"
           data-attribute="${attribute.name}"
           data-category="${attribute.category}">

        <div class="attribute-header">
          <div class="attribute-name-section">
            <span class="attribute-status">${statusIcon}</span>
            <span class="attribute-name" title="${attribute.name}">${attribute.name}</span>
            <span class="attribute-category" style="background-color: ${categoryColor}">
              ${attribute.category}
            </span>
          </div>

          <div class="attribute-actions">
            <button class="attr-action" data-action="edit" title="Edit">✏️</button>
            <button class="attr-action" data-action="copy" title="Copy">📋</button>
            <button class="attr-action" data-action="delete" title="Delete">🗑️</button>
          </div>
        </div>

        <div class="attribute-value-section">
          ${isEditing ? this.renderAttributeEditor(attribute) : this.renderAttributeValue(attribute)}
        </div>

        <div class="attribute-meta">
          <span class="attribute-type">${attribute.type}</span>
          ${!attribute.isValid ? `<span class="validation-error">Invalid value</span>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render attribute value display
   * @param {Object} attribute - Attribute object
   * @returns {string} HTML string
   * @private
   */
  renderAttributeValue(attribute) {
    const displayValue = this.formatAttributeValue(
      attribute.value,
      attribute.type
    );

    return `
      <div class="attribute-value" data-type="${attribute.type}">
        <span class="value-display">${displayValue}</span>
        ${
          attribute.type === 'url' && attribute.value
            ? `
          <a href="${attribute.value}" target="_blank" class="value-link" title="Open link">🔗</a>
        `
            : ''
        }
      </div>
    `;
  }

  /**
   * Render attribute editor
   * @param {Object} attribute - Attribute object
   * @returns {string} HTML string
   * @private
   */
  renderAttributeEditor(attribute) {
    const inputType = this.getInputType(attribute.type);
    const suggestions = this.getAttributeSuggestions(attribute.name);

    return `
      <div class="attribute-editor">
        <div class="editor-input">
          ${inputType === 'select' ? this.renderSelectEditor(attribute, suggestions) : this.renderTextEditor(attribute, inputType)}
        </div>

        <div class="editor-actions">
          <button class="editor-btn save" data-action="save">✅</button>
          <button class="editor-btn cancel" data-action="cancel">❌</button>
        </div>

        ${
          suggestions.length > 0 && inputType !== 'select'
            ? `
          <div class="editor-suggestions">
            ${suggestions
              .map(
                suggestion => `
              <button class="suggestion-btn" data-value="${suggestion}">${suggestion}</button>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  /**
   * Render text editor for attribute
   * @param {Object} attribute - Attribute object
   * @param {string} inputType - Input type
   * @returns {string} HTML string
   * @private
   */
  renderTextEditor(attribute, inputType) {
    if (attribute.type === 'css' || attribute.value.length > 100) {
      return `
        <textarea
          class="attribute-input textarea-input"
          data-attribute="${attribute.name}"
          placeholder="Enter ${attribute.name} value..."
          rows="3"
        >${attribute.value}</textarea>
      `;
    }

    return `
      <input
        type="${inputType}"
        class="attribute-input text-input"
        data-attribute="${attribute.name}"
        value="${attribute.value}"
        placeholder="Enter ${attribute.name} value..."
      />
    `;
  }

  /**
   * Render select editor for enumerated attributes
   * @param {Object} attribute - Attribute object
   * @param {Array} options - Available options
   * @returns {string} HTML string
   * @private
   */
  renderSelectEditor(attribute, options) {
    return `
      <select class="attribute-input select-input" data-attribute="${attribute.name}">
        <option value="">Select value...</option>
        ${options
          .map(
            option => `
          <option value="${option}" ${attribute.value === option ? 'selected' : ''}>
            ${option}
          </option>
        `
          )
          .join('')}
      </select>
    `;
  }

  /**
   * Handle attribute list click events
   * @param {Event} event - Click event
   * @private
   */
  handleAttributeClick(event) {
    const attributeItem = event.target.closest('.attribute-item');
    if (!attributeItem) return;

    const attributeName = attributeItem.dataset.attribute;
    const action = event.target.dataset.action;

    if (action) {
      this.handleAttributeAction(action, attributeName, event.target);
    } else if (event.target.classList.contains('suggestion-btn')) {
      this.applySuggestion(attributeName, event.target.dataset.value);
    } else {
      this.selectAttribute(attributeName);
    }

    event.stopPropagation();
  }

  /**
   * Handle attribute double-click for quick editing
   * @param {Event} event - Double-click event
   * @private
   */
  handleAttributeDoubleClick(event) {
    const attributeItem = event.target.closest('.attribute-item');
    if (!attributeItem) return;

    const attributeName = attributeItem.dataset.attribute;
    this.startAttributeEdit(attributeName);

    event.stopPropagation();
  }

  /**
   * Handle attribute change events
   * @param {Event} event - Change event
   * @private
   */
  handleAttributeChange(event) {
    if (!event.target.classList.contains('attribute-input')) return;

    const attributeName = event.target.dataset.attribute;
    const newValue = event.target.value;

    if (
      event.target.classList.contains('text-input') ||
      event.target.classList.contains('textarea-input')
    ) {
      // Real-time validation for text inputs
      this.validateAttributeInput(attributeName, newValue, event.target);
    }
  }

  /**
   * Handle attribute actions (edit, copy, delete)
   * @param {string} action - Action to perform
   * @param {string} attributeName - Name of the attribute
   * @param {HTMLElement} actionButton - Button that triggered the action
   * @private
   */
  handleAttributeAction(action, attributeName, actionButton) {
    switch (action) {
      case 'edit':
        this.startAttributeEdit(attributeName);
        break;
      case 'copy':
        this.copyAttribute(attributeName);
        break;
      case 'delete':
        this.deleteAttribute(attributeName);
        break;
      case 'save':
        this.saveAttributeEdit(attributeName);
        break;
      case 'cancel':
        this.cancelAttributeEdit();
        break;
      default:
        console.warn(`Unknown attribute action: ${action}`);
    }
  }

  /**
   * Start editing an attribute
   * @param {string} attributeName - Name of attribute to edit
   */
  startAttributeEdit(attributeName) {
    if (this.state.editingAttribute) {
      this.cancelAttributeEdit();
    }

    this.state.editingAttribute = attributeName;
    this.refreshAttributes();

    // Focus the input
    setTimeout(() => {
      const input = this.container.querySelector(
        `[data-attribute="${attributeName}"]`
      );
      if (input) {
        input.focus();
        if (input.select) input.select();
      }
    }, 0);
  }

  /**
   * Save attribute edit
   * @param {string} attributeName - Name of attribute being edited
   */
  saveAttributeEdit(attributeName) {
    const input = this.container.querySelector(
      `[data-attribute="${attributeName}"]`
    );
    if (!input) return;

    const newValue = input.value;
    const oldValue =
      this.state.currentElement.getAttribute(attributeName) || '';

    if (newValue !== oldValue) {
      this.updateAttribute(attributeName, newValue, oldValue);
    }

    this.state.editingAttribute = null;
    this.refreshAttributes();
  }

  /**
   * Cancel attribute edit
   */
  cancelAttributeEdit() {
    this.state.editingAttribute = null;
    this.refreshAttributes();
  }

  /**
   * Update an attribute value
   * @param {string} name - Attribute name
   * @param {string} newValue - New value
   * @param {string} oldValue - Old value
   * @private
   */
  updateAttribute(name, newValue, oldValue) {
    if (!this.state.currentElement) return;

    // Record change for history
    this.recordChange({
      type: 'update',
      attribute: name,
      oldValue,
      newValue,
      element: this.state.currentElement,
      timestamp: Date.now()
    });

    // Update the attribute
    if (newValue === '') {
      this.state.currentElement.removeAttribute(name);
    } else {
      this.state.currentElement.setAttribute(name, newValue);
    }

    // Emit change event
    this.dispatchEvent('attribute:changed', {
      element: this.state.currentElement,
      attribute: name,
      oldValue,
      newValue
    });

    // Refresh display
    this.loadAttributes();

    console.log(`📝 Attribute updated: ${name} = "${newValue}"`);
  }

  /**
   * Delete an attribute
   * @param {string} attributeName - Name of attribute to delete
   */
  deleteAttribute(attributeName) {
    if (!this.state.currentElement) return;

    const oldValue = this.state.currentElement.getAttribute(attributeName);

    if (confirm(`Delete attribute "${attributeName}"?`)) {
      this.recordChange({
        type: 'delete',
        attribute: attributeName,
        oldValue,
        element: this.state.currentElement,
        timestamp: Date.now()
      });

      this.state.currentElement.removeAttribute(attributeName);

      this.dispatchEvent('attribute:changed', {
        element: this.state.currentElement,
        attribute: attributeName,
        oldValue,
        newValue: null
      });

      this.loadAttributes();
      console.log(`🗑️ Attribute deleted: ${attributeName}`);
    }
  }

  /**
   * Add a new attribute
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   */
  addAttribute(name, value = '') {
    if (!this.state.currentElement || !name) return;

    if (this.state.currentElement.hasAttribute(name)) {
      alert(`Attribute "${name}" already exists. Use edit to modify it.`);
      return;
    }

    this.recordChange({
      type: 'add',
      attribute: name,
      newValue: value,
      element: this.state.currentElement,
      timestamp: Date.now()
    });

    this.state.currentElement.setAttribute(name, value);

    this.dispatchEvent('attribute:changed', {
      element: this.state.currentElement,
      attribute: name,
      oldValue: null,
      newValue: value
    });

    this.loadAttributes();

    // Start editing the new attribute
    setTimeout(() => {
      this.startAttributeEdit(name);
    }, 100);

    console.log(`➕ Attribute added: ${name} = "${value}"`);
  }

  /**
   * Show add attribute dialog
   */
  showAddAttributeDialog() {
    const name = prompt('Enter attribute name:');
    if (name && name.trim()) {
      const trimmedName = name.trim().toLowerCase();

      // Basic name validation
      if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(trimmedName)) {
        alert(
          'Invalid attribute name. Use letters, numbers, and hyphens only.'
        );
        return;
      }

      this.addAttribute(trimmedName);
    }
  }

  /**
   * Categorize an attribute by name
   * @param {string} attributeName - Name of the attribute
   * @returns {string} Category name
   * @private
   */
  categorizeAttribute(attributeName) {
    const name = attributeName.toLowerCase();

    // Check predefined categories
    for (const [category, attributes] of Object.entries(
      this.attributeCategories
    )) {
      if (attributes.includes(name)) {
        return category;
      }
    }

    // Dynamic categorization
    if (name.startsWith('aria-')) return 'aria';
    if (name.startsWith('data-')) return 'data';
    if (name.startsWith('on')) return 'event';

    return 'other';
  }

  /**
   * Get attribute type information
   * @param {string} attributeName - Name of the attribute
   * @returns {string} Attribute type
   * @private
   */
  getAttributeType(attributeName) {
    const typeInfo = this.attributeTypes[attributeName.toLowerCase()];
    return typeInfo ? typeInfo.type : 'text';
  }

  /**
   * Validate attribute value
   * @param {string} attributeName - Name of the attribute
   * @param {string} value - Value to validate
   * @returns {boolean} Whether the value is valid
   * @private
   */
  validateAttributeValue(attributeName, value) {
    const typeInfo = this.attributeTypes[attributeName.toLowerCase()];
    if (!typeInfo) return true; // Unknown attributes are considered valid

    switch (typeInfo.type) {
      case 'boolean':
        return (
          value === '' ||
          value === attributeName ||
          value === 'true' ||
          value === 'false'
        );
      case 'number':
        const num = parseFloat(value);
        return (
          !isNaN(num) &&
          (typeInfo.min === undefined || num >= typeInfo.min) &&
          (typeInfo.max === undefined || num <= typeInfo.max)
        );
      case 'enum':
        return typeInfo.values.includes(value);
      case 'url':
        return !value || this.validationRules.url.test(value);
      case 'identifier':
        return this.validationRules.identifier.test(value);
      case 'tokens':
        return value
          .split(typeInfo.separator || ' ')
          .every(token => this.validationRules.identifier.test(token.trim()));
      default:
        return true;
    }
  }

  /**
   * Get appropriate input type for attribute
   * @param {string} attributeType - Type of the attribute
   * @returns {string} Input type
   * @private
   */
  getInputType(attributeType) {
    const inputTypeMap = {
      number: 'number',
      url: 'url',
      email: 'email',
      boolean: 'checkbox',
      enum: 'select',
      css: 'textarea'
    };

    return inputTypeMap[attributeType] || 'text';
  }

  /**
   * Get suggestions for attribute values
   * @param {string} attributeName - Name of the attribute
   * @returns {Array} Array of suggestion strings
   * @private
   */
  getAttributeSuggestions(attributeName) {
    const suggestions = {
      class: [
        'container',
        'header',
        'content',
        'footer',
        'nav',
        'sidebar',
        'btn',
        'active',
        'hidden'
      ],
      role: [
        'button',
        'navigation',
        'main',
        'banner',
        'complementary',
        'contentinfo',
        'article',
        'section'
      ],
      type: [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'submit',
        'button',
        'reset'
      ],
      target: ['_blank', '_self', '_parent', '_top'],
      rel: [
        'nofollow',
        'noopener',
        'noreferrer',
        'external',
        'author',
        'license'
      ],
      autocomplete: [
        'on',
        'off',
        'name',
        'email',
        'username',
        'current-password',
        'new-password'
      ],
      method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      enctype: [
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain'
      ]
    };

    const typeInfo = this.attributeTypes[attributeName.toLowerCase()];
    if (typeInfo && typeInfo.values) {
      return typeInfo.values;
    }

    return suggestions[attributeName.toLowerCase()] || [];
  }

  /**
   * Apply suggestion to attribute input
   * @param {string} attributeName - Name of attribute
   * @param {string} value - Suggested value
   */
  applySuggestion(attributeName, value) {
    const input = this.container.querySelector(
      `[data-attribute="${attributeName}"]`
    );
    if (input) {
      input.value = value;
      input.focus();
    }
  }
  /**
   * Format attribute value for display
   * @param {string} value - Raw attribute value
   * @param {string} type - Attribute type
   * @returns {string} Formatted value
   * @private
   */
  formatAttributeValue(value, type) {
    if (!value) return '<em>empty</em>';

    switch (type) {
      case 'url':
        return value.length > 50 ? value.substring(0, 47) + '...' : value;
      case 'css':
        return (
          value.replace(/\s+/g, ' ').substring(0, 100) +
          (value.length > 100 ? '...' : '')
        );
      case 'tokens':
        const tokens = value.split(' ').filter(Boolean);
        return tokens.length > 3
          ? `${tokens.slice(0, 3).join(' ')} +${tokens.length - 3}`
          : value;
      default:
        return value.length > 100 ? value.substring(0, 97) + '...' : value;
    }
  }

  /**
   * Check if attribute is a system attribute
   * @param {string} attributeName - Name of attribute
   * @returns {boolean} Whether it's a system attribute
   * @private
   */
  isSystemAttribute(attributeName) {
    const systemAttributes = [
      'style',
      'onload',
      'onclick',
      'onchange',
      'onsubmit',
      'onfocus',
      'onblur',
      'onmouseover',
      'onmouseout',
      'onkeydown',
      'onkeyup',
      'onkeypress'
    ];

    return (
      systemAttributes.includes(attributeName.toLowerCase()) ||
      attributeName.startsWith('on') ||
      (attributeName.startsWith('data-') && attributeName.includes('internal'))
    );
  }

  /**
   * Add computed properties to attributes list
   * @param {Array} attributes - Current attributes array
   * @param {HTMLElement} element - Element to compute properties for
   * @private
   */
  addComputedProperties(attributes, element) {
    const computedStyle = window.getComputedStyle(element);

    // Add some key computed properties
    const computedProperties = [
      {
        name: 'computed-display',
        value: computedStyle.display,
        category: 'computed',
        type: 'text',
        isEditable: false
      },
      {
        name: 'computed-position',
        value: computedStyle.position,
        category: 'computed',
        type: 'text',
        isEditable: false
      },
      {
        name: 'computed-width',
        value: computedStyle.width,
        category: 'computed',
        type: 'text',
        isEditable: false
      },
      {
        name: 'computed-height',
        value: computedStyle.height,
        category: 'computed',
        type: 'text',
        isEditable: false
      }
    ];

    computedProperties.forEach(prop => {
      prop.isValid = true;
      prop.isSystem = true;
      attributes.push(prop);
    });
  }

  /**
   * Filter attributes list based on current filter text and options
   * @param {Array} attributes - Array of attributes
   * @returns {Array} Filtered attributes
   * @private
   */
  filterAttributesList(attributes) {
    let filtered = attributes;

    // Filter by system attributes visibility
    if (!this.state.showSystemAttributes) {
      filtered = filtered.filter(attr => !attr.isSystem);
    }

    // Filter by search text
    if (this.state.filterText) {
      const filterText = this.state.filterText.toLowerCase();
      filtered = filtered.filter(
        attr =>
          attr.name.toLowerCase().includes(filterText) ||
          attr.value.toLowerCase().includes(filterText) ||
          attr.category.toLowerCase().includes(filterText)
      );
    }

    return filtered;
  }

  /**
   * Filter attributes by text
   * @param {string} filterText - Filter text
   */
  filterAttributes(filterText) {
    this.state.filterText = filterText.toLowerCase();
    this.refreshAttributes();
  }

  /**
   * Clear attribute filter
   */
  clearFilter() {
    this.state.filterText = '';
    const filterInput = this.container.querySelector('#attribute-filter');
    if (filterInput) {
      filterInput.value = '';
    }
    this.refreshAttributes();
  }

  /**
   * Sort attributes alphabetically
   */
  sortAttributes() {
    // This will be handled by re-rendering with sorted data
    this.refreshAttributes();
  }

  /**
   * Switch category view
   * @param {string} category - Category to show
   */
  switchCategory(category) {
    // Update tab states
    const categoryTabs = this.container.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });

    // Filter attributes by category if not 'all'
    if (category === 'all') {
      this.state.filterText = '';
    } else {
      // This is a simple implementation - could be enhanced
      console.log(`Filtering by category: ${category}`);
    }

    this.loadCategoryContent(category);
  }

  /**
   * Load content for selected category
   * @param {string} category - Category name
   * @private
   */
  loadCategoryContent(category) {
    const categoryContent = this.container.querySelector('#category-content');

    if (category === 'all') {
      categoryContent.innerHTML = `
        <div class="category-overview">
          <p>Showing all attributes for the selected element.</p>
        </div>
      `;
      return;
    }

    const categoryInfo = {
      core: {
        title: 'Core Attributes',
        description: 'Essential attributes like id, class, and title',
        attributes: this.attributeCategories.core
      },
      content: {
        title: 'Content Attributes',
        description: 'Attributes related to content like src, href, and alt',
        attributes: this.attributeCategories.content
      },
      form: {
        title: 'Form Attributes',
        description: 'Form-related attributes like name, type, and required',
        attributes: this.attributeCategories.form
      },
      aria: {
        title: 'ARIA Attributes',
        description: 'Accessibility attributes for screen readers',
        attributes: [
          'aria-label',
          'aria-labelledby',
          'aria-describedby',
          'aria-hidden',
          'aria-expanded'
        ]
      },
      data: {
        title: 'Data Attributes',
        description: 'Custom data attributes (data-*)',
        attributes: ['data-*', 'data-id', 'data-value', 'data-config']
      }
    };

    const info = categoryInfo[category];
    if (!info) return;

    categoryContent.innerHTML = `
      <div class="category-info">
        <h5>${info.title}</h5>
        <p>${info.description}</p>

        <div class="category-attributes">
          <h6>Common Attributes:</h6>
          <div class="attribute-chips">
            ${info.attributes
              .map(
                attr => `
              <button class="attribute-chip" onclick="this.closest('.attribute-inspector').inspector.addAttribute('${attr}')">
                ${attr}
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Select an attribute for detailed view
   * @param {string} attributeName - Name of attribute to select
   */
  selectAttribute(attributeName) {
    if (!this.state.currentElement) return;

    const attribute = this.state.currentElement.getAttribute(attributeName);
    this.showAttributeDetails(attributeName, attribute);
  }

  /**
   * Show detailed information about an attribute
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   * @private
   */
  showAttributeDetails(name, value) {
    const detailsContainer = this.container.querySelector('#attribute-details');
    const type = this.getAttributeType(name);
    const category = this.categorizeAttribute(name);
    const isValid = this.validateAttributeValue(name, value);

    detailsContainer.innerHTML = `
      <div class="attribute-details-content">
        <div class="details-header">
          <h5>${name}</h5>
          <span class="attribute-type-badge">${type}</span>
        </div>

        <div class="details-section">
          <h6>Information</h6>
          <div class="details-grid">
            <div class="detail-item">
              <label>Type:</label>
              <span>${type}</span>
            </div>
            <div class="detail-item">
              <label>Category:</label>
              <span>${category}</span>
            </div>
            <div class="detail-item">
              <label>Valid:</label>
              <span class="${isValid ? 'valid' : 'invalid'}">${isValid ? 'Yes' : 'No'}</span>
            </div>
            <div class="detail-item">
              <label>Length:</label>
              <span>${value ? value.length : 0} chars</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h6>Current Value</h6>
          <div class="value-display-detailed">
            <code>${value || '<em>empty</em>'}</code>
          </div>
        </div>

        ${this.getAttributeDocumentation(name)}
      </div>
    `;
  }

  /**
   * Get documentation for an attribute
   * @param {string} attributeName - Name of attribute
   * @returns {string} HTML documentation
   * @private
   */
  getAttributeDocumentation(attributeName) {
    const docs = {
      id: 'Unique identifier for the element. Must be unique within the document.',
      class: 'Space-separated list of CSS class names.',
      style: 'Inline CSS styling for the element.',
      href: 'URL that the hyperlink points to.',
      src: 'URL of the embedded content.',
      alt: 'Alternative text for images when they cannot be displayed.',
      title:
        'Advisory information about the element, typically shown as a tooltip.',
      role: 'ARIA role that defines what the element is or does.',
      tabindex:
        'Controls tab order. -1 removes from tab order, 0 is natural order, positive numbers set specific order.'
    };

    const doc = docs[attributeName.toLowerCase()];

    return doc
      ? `
      <div class="details-section">
        <h6>Documentation</h6>
        <p class="attribute-documentation">${doc}</p>
      </div>
    `
      : '';
  }

  /**
   * Update attribute statistics
   * @param {Array} attributes - Array of attributes
   * @private
   */
  updateAttributeStats(attributes) {
    const total = attributes.length;
    const valid = attributes.filter(attr => attr.isValid).length;
    const issues = total - valid;

    this.container.querySelector('#attribute-count').textContent = total;
    this.container.querySelector('#valid-count').textContent = valid;
    this.container.querySelector('#issues-count').textContent = issues;
  }

  /**
   * Update quick actions availability
   * @private
   */
  updateQuickActions() {
    const hasElement = !!this.state.currentElement;
    const actionButtons = this.container.querySelectorAll(
      '.quick-actions .action-btn'
    );

    actionButtons.forEach(button => {
      button.disabled = !hasElement;
    });
  }

  /**
   * Validate all attributes and update display
   */
  validateAllAttributes() {
    if (!this.state.currentElement) return;

    const validationResults = [];

    Array.from(this.state.currentElement.attributes).forEach(attr => {
      const isValid = this.validateAttributeValue(attr.name, attr.value);
      if (!isValid) {
        validationResults.push({
          attribute: attr.name,
          value: attr.value,
          issue: this.getValidationIssue(attr.name, attr.value)
        });
      }
    });

    this.displayValidationResults(validationResults);
  }

  /**
   * Get specific validation issue description
   * @param {string} attributeName - Name of attribute
   * @param {string} value - Value that failed validation
   * @returns {string} Description of the issue
   * @private
   */
  getValidationIssue(attributeName, value) {
    const typeInfo = this.attributeTypes[attributeName.toLowerCase()];
    if (!typeInfo) return 'Unknown validation error';

    switch (typeInfo.type) {
      case 'number':
        if (isNaN(parseFloat(value))) return 'Must be a valid number';
        if (typeInfo.min !== undefined && parseFloat(value) < typeInfo.min) {
          return `Must be at least ${typeInfo.min}`;
        }
        if (typeInfo.max !== undefined && parseFloat(value) > typeInfo.max) {
          return `Must be at most ${typeInfo.max}`;
        }
        break;
      case 'url':
        return 'Must be a valid URL';
      case 'identifier':
        return 'Must start with a letter and contain only letters, numbers, and hyphens';
      case 'enum':
        return `Must be one of: ${typeInfo.values.join(', ')}`;
      case 'boolean':
        return 'Must be empty, the attribute name, "true", or "false"';
    }

    return 'Invalid value format';
  }

  /**
   * Display validation results
   * @param {Array} results - Array of validation issues
   * @private
   */
  displayValidationResults(results) {
    const validationContainer = this.container.querySelector(
      '#validation-results'
    );

    if (results.length === 0) {
      validationContainer.innerHTML = `
        <div class="validation-placeholder">
          <div class="validation-success">✅ No validation issues</div>
        </div>
      `;
      return;
    }

    validationContainer.innerHTML = `
      <div class="validation-issues">
        ${results
          .map(
            result => `
          <div class="validation-issue">
            <div class="issue-header">
              <span class="issue-attribute">${result.attribute}</span>
              <span class="issue-severity">Error</span>
            </div>
            <div class="issue-description">${result.issue}</div>
            <div class="issue-value">
              <strong>Current value:</strong> <code>${result.value}</code>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  /**
   * Record a change for history/undo functionality
   * @param {Object} change - Change object
   * @private
   */
  recordChange(change) {
    if (!this.options.enableHistory) return;

    this.state.undoStack.push(change);
    this.state.redoStack = []; // Clear redo stack when new change is made

    // Limit history size
    if (this.state.undoStack.length > this.options.maxHistorySize) {
      this.state.undoStack.shift();
    }

    this.updateHistoryControls();
    this.updateHistoryDisplay();
  }

  /**
   * Undo the last change
   */
  undoChange() {
    if (this.state.undoStack.length === 0) return;

    const change = this.state.undoStack.pop();
    this.state.redoStack.push(change);

    this.applyReverseChange(change);
    this.updateHistoryControls();
    this.updateHistoryDisplay();

    console.log('↶ Undid change:', change.type, change.attribute);
  }

  /**
   * Redo the last undone change
   */
  redoChange() {
    if (this.state.redoStack.length === 0) return;

    const change = this.state.redoStack.pop();
    this.state.undoStack.push(change);

    this.applyChange(change);
    this.updateHistoryControls();
    this.updateHistoryDisplay();

    console.log('↷ Redid change:', change.type, change.attribute);
  }

  /**
   * Apply a change from history
   * @param {Object} change - Change to apply
   * @private
   */
  applyChange(change) {
    switch (change.type) {
      case 'add':
      case 'update':
        change.element.setAttribute(change.attribute, change.newValue);
        break;
      case 'delete':
        change.element.removeAttribute(change.attribute);
        break;
    }

    this.loadAttributes();
  }

  /**
   * Apply reverse of a change (for undo)
   * @param {Object} change - Change to reverse
   * @private
   */
  applyReverseChange(change) {
    switch (change.type) {
      case 'add':
        change.element.removeAttribute(change.attribute);
        break;
      case 'update':
        if (change.oldValue === undefined || change.oldValue === null) {
          change.element.removeAttribute(change.attribute);
        } else {
          change.element.setAttribute(change.attribute, change.oldValue);
        }
        break;
      case 'delete':
        change.element.setAttribute(change.attribute, change.oldValue);
        break;
    }

    this.loadAttributes();
  }

  /**
   * Update history control buttons
   * @private
   */
  updateHistoryControls() {
    const undoBtn = this.container.querySelector('#undo-change');
    const redoBtn = this.container.querySelector('#redo-change');

    if (undoBtn) undoBtn.disabled = this.state.undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = this.state.redoStack.length === 0;
  }

  /**
   * Update history display
   * @private
   */
  updateHistoryDisplay() {
    const historyList = this.container.querySelector('#history-list');
    const recentChanges = this.state.undoStack.slice(-5).reverse();

    if (recentChanges.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No changes yet</div>';
      return;
    }

    historyList.innerHTML = recentChanges
      .map(
        change => `
      <div class="history-item">
        <div class="history-action">${change.type} ${change.attribute}</div>
        <div class="history-time">${this.formatTime(change.timestamp)}</div>
      </div>
    `
      )
      .join('');
  }

  /**
   * Format timestamp for display
   * @param {number} timestamp - Timestamp to format
   * @returns {string} Formatted time
   * @private
   */
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  }

  /**
   * Get category color for visual organization
   * @param {string} category - Category name
   * @returns {string} CSS color value
   * @private
   */
  getCategoryColor(category) {
    const colors = {
      core: '#2196f3',
      content: '#4caf50',
      form: '#ff9800',
      interaction: '#9c27b0',
      aria: '#e91e63',
      data: '#607d8b',
      event: '#f44336',
      style: '#795548',
      meta: '#009688',
      computed: '#9e9e9e',
      other: '#616161'
    };

    return colors[category] || colors.other;
  }

  /**
   * Get appropriate icon for element type
   * @param {HTMLElement} element - Element to get icon for
   * @returns {string} Icon character
   * @private
   */
  getElementIcon(element) {
    const tagName = element.tagName.toLowerCase();
    const iconMap = {
      div: '📦',
      span: '📄',
      p: '📝',
      h1: '📰',
      h2: '📰',
      h3: '📰',
      img: '🖼️',
      a: '🔗',
      button: '🔘',
      input: '📝',
      form: '📋',
      header: '🎯',
      footer: '📍',
      nav: '🧭',
      main: '📄',
      section: '📑'
    };

    return iconMap[tagName] || '🏷️';
  }

  /**
   * Generate element path for display
   * @param {HTMLElement} element - Element to generate path for
   * @returns {string} Element path
   * @private
   */
  generateElementPath(element) {
    const path = [];
    let current = element;

    while (current && current.tagName) {
      let selector = current.tagName.toLowerCase();
      if (current.id) selector += `#${current.id}`;
      if (current.className)
        selector += `.${current.className.split(' ').join('.')}`;

      path.unshift(selector);
      current = current.parentElement;

      if (path.length > 5) break; // Limit path length
    }

    return path.join(' > ');
  }

  /**
   * Refresh attributes display
   */
  refreshAttributes() {
    this.loadAttributes();
  }

  /**
   * Copy all attributes to clipboard
   */
  copyAttributes() {
    if (!this.state.currentElement) return;

    const attributes = Array.from(this.state.currentElement.attributes)
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(' ');

    navigator.clipboard.writeText(attributes).then(() => {
      console.log('📋 Attributes copied to clipboard');
    });
  }

  /**
   * Copy single attribute
   * @param {string} attributeName - Name of attribute to copy
   */
  copyAttribute(attributeName) {
    if (!this.state.currentElement) return;

    const value = this.state.currentElement.getAttribute(attributeName);
    const attributeString = `${attributeName}="${value}"`;

    navigator.clipboard.writeText(attributeString).then(() => {
      console.log(`📋 Attribute copied: ${attributeString}`);
    });
  }

  /**
   * Paste attributes (placeholder)
   */
  pasteAttributes() {
    console.log('📌 Paste attributes functionality - to be implemented');
  }

  /**
   * Clear all attributes with confirmation
   */
  clearAllAttributes() {
    if (!this.state.currentElement) return;

    if (confirm('Delete all attributes? This action cannot be undone.')) {
      Array.from(this.state.currentElement.attributes).forEach(attr => {
        this.state.currentElement.removeAttribute(attr.name);
      });

      this.loadAttributes();
      console.log('🗑️ All attributes cleared');
    }
  }

  /**
   * Export attributes to file
   */
  exportAttributes() {
    if (!this.state.currentElement) return;

    const data = {
      element: this.state.currentElement.tagName.toLowerCase(),
      attributes: Array.from(this.state.currentElement.attributes).reduce(
        (acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        },
        {}
      ),
      exported: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `attributes-${data.element}.json`;
    link.click();

    URL.revokeObjectURL(url);
    console.log('💾 Attributes exported');
  }

  /**
   * Import attributes from file (placeholder)
   */
  importAttributes() {
    console.log('📂 Import attributes functionality - to be implemented');
  }

  /**
   * Validate attribute input in real-time
   * @param {string} attributeName - Name of attribute being validated
   * @param {string} value - Current input value
   * @param {HTMLElement} input - Input element
   * @private
   */
  validateAttributeInput(attributeName, value, input) {
    const isValid = this.validateAttributeValue(attributeName, value);

    input.classList.toggle('invalid', !isValid);
    input.classList.toggle('valid', isValid);

    // Show validation message
    let validationMsg = input.nextElementSibling;
    if (
      validationMsg &&
      validationMsg.classList.contains('validation-message')
    ) {
      validationMsg.remove();
    }

    if (!isValid && value) {
      validationMsg = document.createElement('div');
      validationMsg.className = 'validation-message';
      validationMsg.textContent = this.getValidationIssue(attributeName, value);
      input.parentNode.insertBefore(validationMsg, input.nextSibling);
    }
  }

  /**
   * Add event listener with cleanup tracking
   * @param {string} eventType - Event type
   * @param {string} selector - CSS selector
   * @param {Function} handler - Event handler
   * @private
   */
  addEventListener(eventType, selector, handler) {
    const wrappedHandler = event => {
      const target = event.target.closest(selector);
      if (target) {
        handler.call(target, event);
      }
    };

    this.container.addEventListener(eventType, wrappedHandler);

    // Store for cleanup
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(wrappedHandler);
  }

  /**
   * Dispatch custom event
   * @param {string} eventType - Event type
   * @param {Object} detail - Event detail
   * @private
   */
  dispatchEvent(eventType, detail = {}) {
    const event = new CustomEvent(eventType, { detail });
    this.container.dispatchEvent(event);
  }

  /**
   * Inspect an element (public API for external calls)
   * @param {HTMLElement} element - Element to inspect
   */
  inspect(element) {
    this.setSelectedElement(element);
  }

  /**
   * Activate the component
   */
  activate() {
    this.container.style.display = 'block';
    console.log('🔍 AttributeInspector activated');
  }

  /**
   * Deactivate the component
   */
  deactivate() {
    this.container.style.display = 'none';
    this.cancelAttributeEdit();
    console.log('🔍 AttributeInspector deactivated');
  }

  /**
   * Clean up component resources
   */
  destroy() {
    // Remove event listeners
    this.eventHandlers.forEach((handlers, eventType) => {
      handlers.forEach(handler => {
        this.container.removeEventListener(eventType, handler);
      });
    });
    this.eventHandlers.clear();

    // Clear state
    this.state.currentElement = null;
    this.state.editingAttribute = null;
    this.state.undoStack = [];
    this.state.redoStack = [];

    // Clear container
    this.container.innerHTML = '';

    console.log('🔍 AttributeInspector destroyed');
  }
}
