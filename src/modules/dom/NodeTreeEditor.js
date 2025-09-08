/**
 * NodeTreeEditor - Interactive DOM Tree Visualization and Editing Component
 *
 * Provides a visual tree representation of DOM structure with editing capabilities
 * including drag-and-drop reordering, inline editing, and real-time updates.
 *
 * @fileoverview DOM tree editor component for educational DOM manipulation
 * @version 1.0.0
 */

export class NodeTreeEditor {
  /**
   * Create a new NodeTreeEditor instance
   * @param {HTMLElement} container - Container element for the tree editor
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      maxDepth: 10,
      enableDragDrop: true,
      showNodeDetails: true,
      expandedByDefault: 2,
      highlightChanges: true,
      enableInlineEdit: true,
      showNodeTypes: true,
      showTextNodes: false,
      ...options
    };

    // State management
    this.state = {
      rootElement: null,
      selectedNode: null,
      expandedNodes: new Set(),
      draggedNode: null,
      dropTarget: null,
      editingNode: null,
      filterText: '',
      showAttributes: true,
      showTextContent: true
    };

    // Event handlers
    this.eventHandlers = new Map();

    // Tree data cache
    this.treeCache = new Map();

    // Change tracking
    this.changeHistory = [];
    this.maxHistorySize = 50;

    this.initialize();
  }

  /**
   * Initialize the tree editor
   * @private
   */
  initialize() {
    this.createEditorInterface();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();

    console.log('🌲 NodeTreeEditor initialized');
  }

  /**
   * Create the main editor interface
   * @private
   */
  createEditorInterface() {
    this.container.innerHTML = `
      <div class="tree-editor">
        <div class="tree-editor__toolbar">
          <div class="toolbar-section">
            <button class="toolbar-btn" id="expand-all" title="Expand All Nodes">
              <span class="icon">📖</span>
              Expand All
            </button>
            <button class="toolbar-btn" id="collapse-all" title="Collapse All Nodes">
              <span class="icon">📕</span>
              Collapse All
            </button>
            <button class="toolbar-btn" id="refresh-tree" title="Refresh Tree">
              <span class="icon">🔄</span>
              Refresh
            </button>
          </div>

          <div class="toolbar-section">
            <div class="filter-controls">
              <input
                type="text"
                id="tree-filter"
                placeholder="Filter nodes..."
                class="filter-input"
              />
              <button class="filter-clear" id="clear-filter" title="Clear Filter">✕</button>
            </div>
          </div>

          <div class="toolbar-section">
            <div class="view-options">
              <label class="checkbox-label">
                <input type="checkbox" id="show-attributes" checked />
                <span>Attributes</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="show-text-nodes" />
                <span>Text Nodes</span>
              </label>
            </div>
          </div>
        </div>

        <div class="tree-editor__content">
          <div class="tree-container">
            <div id="tree-view" class="tree-view">
              <div class="tree-placeholder">
                <div class="placeholder-icon">🌳</div>
                <p>Load a DOM element to view its tree structure</p>
                <button class="load-demo-btn" id="load-demo">Load Demo Content</button>
              </div>
            </div>
          </div>

          <div class="tree-sidebar">
            <div class="sidebar-section">
              <h4>Node Details</h4>
              <div id="node-details" class="node-details">
                <div class="details-placeholder">
                  Select a node to view details
                </div>
              </div>
            </div>

            <div class="sidebar-section">
              <h4>Quick Actions</h4>
              <div class="quick-actions">
                <button class="action-btn" id="add-child" disabled>
                  <span class="icon">➕</span>
                  Add Child
                </button>
                <button class="action-btn" id="add-sibling" disabled>
                  <span class="icon">🔗</span>
                  Add Sibling
                </button>
                <button class="action-btn" id="duplicate-node" disabled>
                  <span class="icon">📋</span>
                  Duplicate
                </button>
                <button class="action-btn" id="delete-node" disabled>
                  <span class="icon">🗑️</span>
                  Delete
                </button>
              </div>
            </div>

            <div class="sidebar-section">
              <h4>Tree Statistics</h4>
              <div class="tree-stats">
                <div class="stat">
                  <label>Total Nodes:</label>
                  <span id="total-nodes">0</span>
                </div>
                <div class="stat">
                  <label>Max Depth:</label>
                  <span id="max-depth">0</span>
                </div>
                <div class="stat">
                  <label>Elements:</label>
                  <span id="element-count">0</span>
                </div>
                <div class="stat">
                  <label>Text Nodes:</label>
                  <span id="text-node-count">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tree-editor__footer">
          <div class="footer-info">
            <span class="keyboard-hint">
              💡 <strong>Tip:</strong> Use arrow keys to navigate, Enter to edit, Del to delete
            </span>
          </div>

          <div class="footer-actions">
            <button class="footer-btn" id="export-tree">
              <span class="icon">💾</span>
              Export Tree
            </button>
            <button class="footer-btn" id="import-tree">
              <span class="icon">📂</span>
              Import Tree
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Set up event listeners for tree interactions
   * @private
   */
  setupEventListeners() {
    // Toolbar actions
    this.addEventListener('click', '#expand-all', () => this.expandAll());
    this.addEventListener('click', '#collapse-all', () => this.collapseAll());
    this.addEventListener('click', '#refresh-tree', () => this.refreshTree());
    this.addEventListener('click', '#load-demo', () => this.loadDemoContent());

    // Filter functionality
    this.addEventListener('input', '#tree-filter', event => {
      this.filterTree(event.target.value);
    });
    this.addEventListener('click', '#clear-filter', () => this.clearFilter());

    // View options
    this.addEventListener('change', '#show-attributes', event => {
      this.state.showAttributes = event.target.checked;
      this.refreshTree();
    });
    this.addEventListener('change', '#show-text-nodes', event => {
      this.options.showTextNodes = event.target.checked;
      this.refreshTree();
    });

    // Quick actions
    this.addEventListener('click', '#add-child', () => this.addChildNode());
    this.addEventListener('click', '#add-sibling', () => this.addSiblingNode());
    this.addEventListener('click', '#duplicate-node', () =>
      this.duplicateNode()
    );
    this.addEventListener('click', '#delete-node', () => this.deleteNode());

    // Export/Import
    this.addEventListener('click', '#export-tree', () => this.exportTree());
    this.addEventListener('click', '#import-tree', () => this.importTree());

    // Tree view interactions (delegated)
    this.addEventListener('click', '.tree-view', event => {
      this.handleTreeClick(event);
    });

    this.addEventListener('dblclick', '.tree-view', event => {
      this.handleTreeDoubleClick(event);
    });

    // Drag and drop (if enabled)
    if (this.options.enableDragDrop) {
      this.setupDragAndDrop();
    }
  }

  /**
   * Set up keyboard shortcuts for tree navigation and editing
   * @private
   */
  setupKeyboardShortcuts() {
    this.addEventListener('keydown', '.tree-view', event => {
      this.handleKeyboardNavigation(event);
    });

    // Global shortcuts
    document.addEventListener('keydown', event => {
      if (!this.container.contains(document.activeElement)) return;

      switch (event.key) {
        case 'F2':
          event.preventDefault();
          this.startInlineEdit();
          break;
        case 'Delete':
          if (event.target.tagName !== 'INPUT') {
            event.preventDefault();
            this.deleteNode();
          }
          break;
        case 'Escape':
          this.cancelInlineEdit();
          this.clearSelection();
          break;
      }
    });
  }

  /**
   * Set up drag and drop functionality
   * @private
   */
  setupDragAndDrop() {
    this.addEventListener('dragstart', '.tree-node', event => {
      this.handleDragStart(event);
    });

    this.addEventListener('dragover', '.tree-node', event => {
      this.handleDragOver(event);
    });

    this.addEventListener('drop', '.tree-node', event => {
      this.handleDrop(event);
    });

    this.addEventListener('dragend', '.tree-node', event => {
      this.handleDragEnd(event);
    });
  }

  /**
   * Load DOM element to visualize
   * @param {HTMLElement} element - Root element to load
   */
  loadDOM(element) {
    if (!element || !element.nodeType) {
      console.warn('Invalid element provided to NodeTreeEditor');
      return;
    }

    this.state.rootElement = element;
    this.state.selectedNode = null;
    this.state.expandedNodes.clear();

    // Auto-expand first few levels
    this.autoExpandNodes(element, this.options.expandedByDefault);

    this.renderTree();
    this.updateTreeStatistics();

    console.log('🌳 DOM loaded into tree editor:', element.tagName);
  }

  /**
   * Auto-expand nodes up to specified depth
   * @param {HTMLElement} element - Starting element
   * @param {number} depth - Depth to expand to
   * @private
   */
  autoExpandNodes(element, depth) {
    if (depth <= 0) return;

    const nodeId = this.getNodeId(element);
    this.state.expandedNodes.add(nodeId);

    Array.from(element.children).forEach(child => {
      this.autoExpandNodes(child, depth - 1);
    });
  }

  /**
   * Render the complete tree structure
   * @private
   */
  renderTree() {
    const treeView = this.container.querySelector('#tree-view');

    if (!this.state.rootElement) {
      treeView.innerHTML = `
        <div class="tree-placeholder">
          <div class="placeholder-icon">🌳</div>
          <p>Load a DOM element to view its tree structure</p>
          <button class="load-demo-btn" id="load-demo">Load Demo Content</button>
        </div>
      `;
      return;
    }

    const treeHTML = this.renderNode(this.state.rootElement, 0);
    treeView.innerHTML = `<div class="tree-root">${treeHTML}</div>`;

    // Apply filter if active
    if (this.state.filterText) {
      this.applyFilter(this.state.filterText);
    }
  }

  /**
   * Render a single node and its children
   * @param {HTMLElement} node - Node to render
   * @param {number} depth - Current depth in tree
   * @returns {string} HTML string for the node
   * @private
   */
  renderNode(node, depth) {
    if (depth > this.options.maxDepth) {
      return '<div class="tree-node-limit">... (max depth reached)</div>';
    }

    const nodeId = this.getNodeId(node);
    const isExpanded = this.state.expandedNodes.has(nodeId);
    const isSelected = this.state.selectedNode === node;
    const hasChildren = this.getValidChildren(node).length > 0;

    // Node type and icon
    const nodeInfo = this.getNodeInfo(node);

    // Build node classes
    const nodeClasses = [
      'tree-node',
      `node-type-${nodeInfo.type}`,
      isSelected ? 'selected' : '',
      hasChildren ? 'has-children' : '',
      isExpanded ? 'expanded' : 'collapsed'
    ]
      .filter(Boolean)
      .join(' ');

    // Build node content
    let nodeContent = `
      <div class="${nodeClasses}"
           data-node-id="${nodeId}"
           data-depth="${depth}"
           draggable="${this.options.enableDragDrop}"
           tabindex="0">

        <div class="node-header">
          <div class="node-toggle">
            ${hasChildren ? (isExpanded ? '📂' : '📁') : '📄'}
          </div>

          <div class="node-icon">
            ${nodeInfo.icon}
          </div>

          <div class="node-label">
            <span class="node-tag">${nodeInfo.tagName}</span>
            ${nodeInfo.id ? `<span class="node-id">#${nodeInfo.id}</span>` : ''}
            ${nodeInfo.classes ? `<span class="node-classes">.${nodeInfo.classes}</span>` : ''}
          </div>

          <div class="node-actions">
            <button class="node-action" title="Edit" data-action="edit">✏️</button>
            <button class="node-action" title="Add Child" data-action="add-child">➕</button>
            <button class="node-action" title="Delete" data-action="delete">🗑️</button>
          </div>
        </div>`;

    // Add attributes if enabled
    if (this.state.showAttributes && nodeInfo.attributes.length > 0) {
      nodeContent += `
        <div class="node-attributes">
          ${nodeInfo.attributes
            .map(
              attr =>
                `<span class="attribute">
              <span class="attr-name">${attr.name}</span>=
              <span class="attr-value">"${attr.value}"</span>
            </span>`
            )
            .join('')}
        </div>`;
    }

    // Add text content if present and enabled
    if (this.state.showTextContent && nodeInfo.textContent) {
      nodeContent += `
        <div class="node-text-content">
          <span class="text-label">Text:</span>
          <span class="text-value">${nodeInfo.textContent}</span>
        </div>`;
    }

    // Add children if expanded
    if (hasChildren && isExpanded) {
      const children = this.getValidChildren(node);
      const childrenHTML = children
        .map(child => this.renderNode(child, depth + 1))
        .join('');

      nodeContent += `
        <div class="node-children">
          ${childrenHTML}
        </div>`;
    }

    nodeContent += '</div>';

    return nodeContent;
  }

  /**
   * Get node information for rendering
   * @param {HTMLElement} node - Node to analyze
   * @returns {Object} Node information object
   * @private
   */
  getNodeInfo(node) {
    const info = {
      type: this.getNodeType(node),
      tagName: node.tagName ? node.tagName.toLowerCase() : node.nodeName,
      id: node.id || '',
      classes: node.className
        ? node.className.split(' ').filter(Boolean).join('.')
        : '',
      attributes: [],
      textContent: '',
      icon: this.getNodeIcon(node)
    };

    // Get attributes
    if (node.attributes) {
      Array.from(node.attributes).forEach(attr => {
        if (attr.name !== 'id' && attr.name !== 'class') {
          info.attributes.push({
            name: attr.name,
            value:
              attr.value.substring(0, 50) +
              (attr.value.length > 50 ? '...' : '')
          });
        }
      });
    }

    // Get text content (direct text only, not from children)
    if (node.nodeType === Node.TEXT_NODE) {
      info.textContent = node.textContent.trim().substring(0, 100);
    } else if (node.childNodes) {
      const directText = Array.from(node.childNodes)
        .filter(child => child.nodeType === Node.TEXT_NODE)
        .map(child => child.textContent.trim())
        .filter(text => text.length > 0)
        .join(' ')
        .substring(0, 100);

      if (directText) {
        info.textContent = directText;
      }
    }

    return info;
  }

  /**
   * Get node type classification
   * @param {HTMLElement} node - Node to classify
   * @returns {string} Node type
   * @private
   */
  getNodeType(node) {
    if (node.nodeType === Node.TEXT_NODE) return 'text';
    if (node.nodeType === Node.COMMENT_NODE) return 'comment';
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      if (
        [
          'div',
          'span',
          'section',
          'article',
          'header',
          'footer',
          'main',
          'aside'
        ].includes(tagName)
      ) {
        return 'container';
      }
      if (
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'strong', 'em'].includes(
          tagName
        )
      ) {
        return 'content';
      }
      if (['input', 'button', 'select', 'textarea', 'form'].includes(tagName)) {
        return 'form';
      }
      if (['img', 'video', 'audio', 'canvas', 'svg'].includes(tagName)) {
        return 'media';
      }
      return 'element';
    }
    return 'unknown';
  }

  /**
   * Get appropriate icon for node type
   * @param {HTMLElement} node - Node to get icon for
   * @returns {string} Icon character
   * @private
   */
  getNodeIcon(node) {
    const iconMap = {
      text: '📝',
      comment: '💬',
      container: '📦',
      content: '📄',
      form: '📋',
      media: '🖼️',
      element: '🏷️',
      unknown: '❓'
    };

    const nodeType = this.getNodeType(node);
    return iconMap[nodeType] || iconMap.unknown;
  }

  /**
   * Get valid children for display (filtered by options)
   * @param {HTMLElement} node - Parent node
   * @returns {Array} Array of child nodes to display
   * @private
   */
  getValidChildren(node) {
    if (!node.childNodes) return [];

    return Array.from(node.childNodes).filter(child => {
      if (child.nodeType === Node.ELEMENT_NODE) return true;
      if (child.nodeType === Node.TEXT_NODE && this.options.showTextNodes) {
        return child.textContent.trim().length > 0;
      }
      return false;
    });
  }

  /**
   * Generate unique ID for node
   * @param {HTMLElement} node - Node to generate ID for
   * @returns {string} Unique node ID
   * @private
   */
  getNodeId(node) {
    if (node.id) return `id-${node.id}`;

    // Generate ID based on position and tag
    let current = node;
    const path = [];

    while (current && current.parentElement) {
      const siblings = Array.from(current.parentElement.children);
      const index = siblings.indexOf(current);
      path.unshift(`${current.tagName.toLowerCase()}-${index}`);
      current = current.parentElement;
    }

    return path.join('-') || 'root';
  }

  /**
   * Handle tree click events
   * @param {Event} event - Click event
   * @private
   */
  handleTreeClick(event) {
    const treeNode = event.target.closest('.tree-node');
    if (!treeNode) return;

    const nodeId = treeNode.dataset.nodeId;
    const actualNode = this.findNodeById(nodeId);

    if (!actualNode) return;

    // Handle different click targets
    if (event.target.closest('.node-toggle')) {
      this.toggleNode(nodeId);
    } else if (event.target.closest('.node-action')) {
      const action = event.target.dataset.action;
      this.handleNodeAction(action, actualNode);
    } else {
      this.selectNode(actualNode);
    }

    event.stopPropagation();
  }

  /**
   * Handle tree double-click events
   * @param {Event} event - Double-click event
   * @private
   */
  handleTreeDoubleClick(event) {
    const treeNode = event.target.closest('.tree-node');
    if (!treeNode) return;

    if (this.options.enableInlineEdit) {
      this.startInlineEdit();
    }

    event.stopPropagation();
  }

  /**
   * Handle keyboard navigation in tree
   * @param {Event} event - Keyboard event
   * @private
   */
  handleKeyboardNavigation(event) {
    if (!this.state.selectedNode) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectNextNode();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectPreviousNode();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.expandSelectedNode();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.collapseSelectedNode();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.options.enableInlineEdit) {
          this.startInlineEdit();
        }
        break;
    }
  }

  /**
   * Select a node
   * @param {HTMLElement} node - Node to select
   */
  selectNode(node) {
    // Remove previous selection
    const prevSelected = this.container.querySelector('.tree-node.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }

    this.state.selectedNode = node;

    // Add selection to tree view
    const nodeId = this.getNodeId(node);
    const treeNode = this.container.querySelector(`[data-node-id="${nodeId}"]`);
    if (treeNode) {
      treeNode.classList.add('selected');
      treeNode.focus();
    }

    // Update node details
    this.updateNodeDetails(node);

    // Update quick actions
    this.updateQuickActions(true);

    // Emit selection event
    this.dispatchEvent('element:selected', { element: node });

    console.log('🎯 Node selected:', node.tagName);
  }

  /**
   * Clear current selection
   */
  clearSelection() {
    const prevSelected = this.container.querySelector('.tree-node.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }

    this.state.selectedNode = null;
    this.updateNodeDetails(null);
    this.updateQuickActions(false);
  }

  /**
   * Toggle node expansion
   * @param {string} nodeId - ID of node to toggle
   */
  toggleNode(nodeId) {
    if (this.state.expandedNodes.has(nodeId)) {
      this.state.expandedNodes.delete(nodeId);
    } else {
      this.state.expandedNodes.add(nodeId);
    }

    this.renderTree();
  }

  /**
   * Expand all nodes in the tree
   */
  expandAll() {
    this.traverseDOM(this.state.rootElement, node => {
      const nodeId = this.getNodeId(node);
      this.state.expandedNodes.add(nodeId);
    });

    this.renderTree();
    console.log('📖 All nodes expanded');
  }

  /**
   * Collapse all nodes in the tree
   */
  collapseAll() {
    this.state.expandedNodes.clear();
    this.renderTree();
    console.log('📕 All nodes collapsed');
  }

  /**
   * Refresh the tree display
   */
  refreshTree() {
    this.treeCache.clear();
    this.renderTree();
    this.updateTreeStatistics();
    console.log('🔄 Tree refreshed');
  }

  /**
   * Filter tree nodes by text
   * @param {string} filterText - Filter text
   */
  filterTree(filterText) {
    this.state.filterText = filterText.toLowerCase();
    this.applyFilter(this.state.filterText);
  }

  /**
   * Apply filter to tree display
   * @param {string} filterText - Filter text
   * @private
   */
  applyFilter(filterText) {
    const treeNodes = this.container.querySelectorAll('.tree-node');

    treeNodes.forEach(node => {
      const nodeText = node.textContent.toLowerCase();
      const matches = !filterText || nodeText.includes(filterText);

      node.style.display = matches ? 'block' : 'none';

      if (matches) {
        node.classList.add('filter-match');
      } else {
        node.classList.remove('filter-match');
      }
    });
  }

  /**
   * Clear filter
   */
  clearFilter() {
    this.state.filterText = '';
    const filterInput = this.container.querySelector('#tree-filter');
    if (filterInput) {
      filterInput.value = '';
    }

    const treeNodes = this.container.querySelectorAll('.tree-node');
    treeNodes.forEach(node => {
      node.style.display = 'block';
      node.classList.remove('filter-match');
    });
  }

  /**
   * Update node details panel
   * @param {HTMLElement} node - Node to show details for
   * @private
   */
  updateNodeDetails(node) {
    const detailsContainer = this.container.querySelector('#node-details');

    if (!node) {
      detailsContainer.innerHTML = `
        <div class="details-placeholder">
          Select a node to view details
        </div>
      `;
      return;
    }

    const nodeInfo = this.getNodeInfo(node);

    detailsContainer.innerHTML = `
      <div class="node-detail-content">
        <div class="detail-header">
          <h5>${nodeInfo.icon} ${nodeInfo.tagName}</h5>
          <span class="node-type-badge">${nodeInfo.type}</span>
        </div>

        <div class="detail-section">
          <h6>Basic Information</h6>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Tag:</label>
              <span>${nodeInfo.tagName}</span>
            </div>
            <div class="detail-item">
              <label>Type:</label>
              <span>${nodeInfo.type}</span>
            </div>
            <div class="detail-item">
              <label>ID:</label>
              <span>${nodeInfo.id || 'None'}</span>
            </div>
            <div class="detail-item">
              <label>Classes:</label>
              <span>${nodeInfo.classes || 'None'}</span>
            </div>
          </div>
        </div>

        ${
          nodeInfo.attributes.length > 0
            ? `
          <div class="detail-section">
            <h6>Attributes</h6>
            <div class="attributes-list">
              ${nodeInfo.attributes
                .map(
                  attr => `
                <div class="attribute-item">
                  <span class="attr-name">${attr.name}</span>
                  <span class="attr-value">${attr.value}</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <div class="detail-section">
          <h6>Structure</h6>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Children:</label>
              <span>${this.getValidChildren(node).length}</span>
            </div>
            <div class="detail-item">
              <label>Siblings:</label>
              <span>${node.parentElement ? node.parentElement.children.length - 1 : 0}</span>
            </div>
            <div class="detail-item">
              <label>Depth:</label>
              <span>${this.getNodeDepth(node)}</span>
            </div>
          </div>
        </div>

        ${
          nodeInfo.textContent
            ? `
          <div class="detail-section">
            <h6>Text Content</h6>
            <div class="text-content-display">
              ${nodeInfo.textContent}
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  /**
   * Update quick actions availability
   * @param {boolean} hasSelection - Whether a node is selected
   * @private
   */
  updateQuickActions(hasSelection) {
    const actionButtons = this.container.querySelectorAll(
      '.quick-actions .action-btn'
    );
    actionButtons.forEach(button => {
      button.disabled = !hasSelection;
    });
  }

  /**
   * Update tree statistics
   * @private
   */
  updateTreeStatistics() {
    if (!this.state.rootElement) return;

    const stats = this.calculateTreeStatistics(this.state.rootElement);

    this.container.querySelector('#total-nodes').textContent = stats.totalNodes;
    this.container.querySelector('#max-depth').textContent = stats.maxDepth;
    this.container.querySelector('#element-count').textContent =
      stats.elementCount;
    this.container.querySelector('#text-node-count').textContent =
      stats.textNodeCount;
  }

  /**
   * Calculate tree statistics
   * @param {HTMLElement} rootNode - Root node to analyze
   * @returns {Object} Statistics object
   * @private
   */
  calculateTreeStatistics(rootNode) {
    const stats = {
      totalNodes: 0,
      maxDepth: 0,
      elementCount: 0,
      textNodeCount: 0
    };

    this.traverseDOM(rootNode, (node, depth) => {
      stats.totalNodes++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);

      if (node.nodeType === Node.ELEMENT_NODE) {
        stats.elementCount++;
      } else if (node.nodeType === Node.TEXT_NODE) {
        stats.textNodeCount++;
      }
    });

    return stats;
  }

  /**
   * Get node depth in tree
   * @param {HTMLElement} node - Node to analyze
   * @returns {number} Depth level
   * @private
   */
  getNodeDepth(node) {
    let depth = 0;
    let current = node;

    while (current && current !== this.state.rootElement) {
      depth++;
      current = current.parentElement;
    }

    return depth;
  }

  /**
   * Traverse DOM tree and execute callback for each node
   * @param {HTMLElement} node - Starting node
   * @param {Function} callback - Function to call for each node
   * @param {number} depth - Current depth (internal)
   * @private
   */
  traverseDOM(node, callback, depth = 0) {
    callback(node, depth);

    if (node.childNodes) {
      Array.from(node.childNodes).forEach(child => {
        this.traverseDOM(child, callback, depth + 1);
      });
    }
  }

  /**
   * Find node by ID in current tree
   * @param {string} nodeId - Node ID to find
   * @returns {HTMLElement|null} Found node or null
   * @private
   */
  findNodeById(nodeId) {
    if (!this.state.rootElement) return null;

    let foundNode = null;

    this.traverseDOM(this.state.rootElement, node => {
      if (this.getNodeId(node) === nodeId) {
        foundNode = node;
      }
    });

    return foundNode;
  }

  /**
   * Handle node actions (edit, delete, etc.)
   * @param {string} action - Action to perform
   * @param {HTMLElement} node - Target node
   * @private
   */
  handleNodeAction(action, node) {
    switch (action) {
      case 'edit':
        this.startInlineEdit();
        break;
      case 'add-child':
        this.addChildNode();
        break;
      case 'delete':
        this.deleteNode();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  /**
   * Add event listener with cleanup tracking
   * @param {string} eventType - Event type
   * @param {string} selector - CSS selector for delegation
   * @param {Function} handler - Event handler
   * @private
   */
  addEventListener(eventType, selector, handler) {
    const wrappedHandler = event => {
      if (typeof selector === 'string') {
        const target = event.target.closest(selector);
        if (target) {
          handler.call(target, event);
        }
      } else {
        // If selector is actually the handler (no delegation)
        selector.call(this, event);
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
   * Load demo content for testing
   */
  loadDemoContent() {
    // Create sample DOM structure
    const demoRoot = document.createElement('div');
    demoRoot.id = 'demo-root';
    demoRoot.className = 'demo-container sample-content';

    demoRoot.innerHTML = `
      <header class="demo-header">
        <h1>Demo Page Title</h1>
        <nav class="main-navigation" role="navigation">
          <ul class="nav-list">
            <li class="nav-item active"><a href="#home">Home</a></li>
            <li class="nav-item"><a href="#about">About</a></li>
            <li class="nav-item"><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main class="demo-content">
        <section class="hero-section" data-section="hero">
          <h2>Welcome to DOM Tree Editor</h2>
          <p class="hero-text">This is a sample content area for testing DOM manipulation.</p>
          <button class="cta-button" type="button">Get Started</button>
        </section>

        <section class="features-section">
          <h3>Features</h3>
          <div class="features-grid">
            <article class="feature-card" data-feature="tree">
              <h4>Tree Visualization</h4>
              <p>Interactive DOM tree display</p>
            </article>
            <article class="feature-card" data-feature="edit">
              <h4>Live Editing</h4>
              <p>Real-time DOM manipulation</p>
            </article>
            <article class="feature-card" data-feature="inspect">
              <h4>Element Inspection</h4>
              <p>Detailed property analysis</p>
            </article>
          </div>
        </section>
      </main>

      <footer class="demo-footer">
        <p>&copy; 2024 DOM Visualizer OOP Demo</p>
      </footer>
    `;

    this.loadDOM(demoRoot);
    console.log('📚 Demo content loaded');
  }

  // Placeholder methods for future implementation
  selectNextNode() {
    console.log('Navigate to next node');
  }
  selectPreviousNode() {
    console.log('Navigate to previous node');
  }
  expandSelectedNode() {
    console.log('Expand selected node');
  }
  collapseSelectedNode() {
    console.log('Collapse selected node');
  }
  startInlineEdit() {
    console.log('Start inline editing');
  }
  cancelInlineEdit() {
    console.log('Cancel inline editing');
  }
  addChildNode() {
    console.log('Add child node');
  }
  addSiblingNode() {
    console.log('Add sibling node');
  }
  duplicateNode() {
    console.log('Duplicate node');
  }
  deleteNode() {
    console.log('Delete node');
  }
  exportTree() {
    console.log('Export tree');
  }
  importTree() {
    console.log('Import tree');
  }
  handleDragStart(event) {
    console.log('Drag start');
  }
  handleDragOver(event) {
    console.log('Drag over');
  }
  handleDrop(event) {
    console.log('Drop');
  }
  handleDragEnd(event) {
    console.log('Drag end');
  }

  /**
   * Activate the component
   */
  activate() {
    this.container.style.display = 'block';
    console.log('🌲 NodeTreeEditor activated');
  }

  /**
   * Deactivate the component
   */
  deactivate() {
    this.container.style.display = 'none';
    console.log('🌲 NodeTreeEditor deactivated');
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
    this.state.rootElement = null;
    this.state.selectedNode = null;
    this.state.expandedNodes.clear();
    this.treeCache.clear();

    // Clear container
    this.container.innerHTML = '';

    console.log('🌲 NodeTreeEditor destroyed');
  }
}
