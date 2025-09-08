/**
 * DOMDiffer Component
 *
 * Educational component for comparing DOM states and visualizing changes.
 * Helps users understand how DOM operations affect the document structure
 * and provides insights into performance implications.
 *
 * @fileoverview DOM comparison and diff visualization component
 * @version 1.0.0
 * @author DOM Visualizer OOP Team
 */

/**
 * DOMDiffer class for analyzing and visualizing DOM changes
 * @class DOMDiffer
 */
export class DOMDiffer {
  /**
   * Initialize the DOM Differ component
   * @param {Object} options - Configuration options
   * @param {boolean} [options.trackAllChanges=true] - Track all types of changes
   * @param {boolean} [options.showPerformanceImpact=true] - Show performance metrics
   * @param {number} [options.maxHistorySize=50] - Maximum number of snapshots to keep
   */
  constructor(options = {}) {
    this.options = {
      trackAllChanges: true,
      showPerformanceImpact: true,
      maxHistorySize: 50,
      ...options
    };

    // Snapshot storage
    this.snapshots = new Map();
    this.snapshotCounter = 0;
    this.currentSnapshot = null;

    // Change tracking
    this.changeHistory = [];
    this.isTracking = false;

    // Performance metrics
    this.performanceMetrics = {
      snapshotTime: 0,
      diffTime: 0,
      totalElements: 0,
      changedElements: 0
    };

    console.log('📊 DOMDiffer initialized');
  }

  /**
   * Create a snapshot of the current DOM state
   * @param {HTMLElement} [root=document.body] - Root element to snapshot
   * @param {string} [label] - Optional label for the snapshot
   * @returns {string} Snapshot ID
   */
  createSnapshot(root = document.body, label = null) {
    const startTime = performance.now();

    try {
      const snapshotId = `snapshot_${++this.snapshotCounter}`;
      const snapshot = {
        id: snapshotId,
        label: label || `Snapshot ${this.snapshotCounter}`,
        timestamp: Date.now(),
        root: root,
        structure: this.serializeDOM(root),
        elementCount: this.countElements(root),
        metadata: {
          url: window.location.href,
          title: document.title,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };

      this.snapshots.set(snapshotId, snapshot);
      this.currentSnapshot = snapshotId;

      // Cleanup old snapshots if needed
      if (this.snapshots.size > this.options.maxHistorySize) {
        const oldestId = this.snapshots.keys().next().value;
        this.snapshots.delete(oldestId);
      }

      this.performanceMetrics.snapshotTime = performance.now() - startTime;
      this.performanceMetrics.totalElements = snapshot.elementCount;

      console.log(`📸 Snapshot created: ${snapshotId}`, snapshot);
      return snapshotId;
    } catch (error) {
      console.error('❌ Failed to create snapshot:', error);
      throw new Error(`Snapshot creation failed: ${error.message}`);
    }
  }

  /**
   * Compare two snapshots and return differences
   * @param {string} beforeId - ID of the before snapshot
   * @param {string} afterId - ID of the after snapshot
   * @returns {Object} Diff results
   */
  compareSnapshots(beforeId, afterId) {
    const startTime = performance.now();

    try {
      const beforeSnapshot = this.snapshots.get(beforeId);
      const afterSnapshot = this.snapshots.get(afterId);

      if (!beforeSnapshot || !afterSnapshot) {
        throw new Error('Invalid snapshot IDs provided');
      }

      const diff = {
        before: beforeSnapshot,
        after: afterSnapshot,
        changes: this.computeChanges(
          beforeSnapshot.structure,
          afterSnapshot.structure
        ),
        summary: {
          totalChanges: 0,
          additions: 0,
          deletions: 0,
          modifications: 0,
          moved: 0
        },
        performance: {
          diffTime: 0,
          elementsCompared: Math.max(
            beforeSnapshot.elementCount,
            afterSnapshot.elementCount
          )
        }
      };

      // Calculate summary statistics
      diff.changes.forEach(change => {
        diff.summary.totalChanges++;
        diff.summary[change.type]++;
      });

      diff.performance.diffTime = performance.now() - startTime;
      this.performanceMetrics.diffTime = diff.performance.diffTime;
      this.performanceMetrics.changedElements = diff.summary.totalChanges;

      console.log('🔍 Diff completed:', diff.summary);
      return diff;
    } catch (error) {
      console.error('❌ Failed to compare snapshots:', error);
      throw new Error(`Snapshot comparison failed: ${error.message}`);
    }
  }

  /**
   * Serialize DOM structure for comparison
   * @param {HTMLElement} element - Element to serialize
   * @param {string} [path=''] - Current path in the DOM tree
   * @returns {Object} Serialized structure
   * @private
   */
  serializeDOM(element, path = '') {
    const serialized = {
      path: path,
      tagName: element.tagName?.toLowerCase() || 'text',
      id: element.id || null,
      className: element.className || null,
      attributes: this.getElementAttributes(element),
      textContent:
        element.nodeType === Node.TEXT_NODE ? element.textContent : null,
      children: [],
      hash: null // Will be computed after children
    };

    // Process children
    const children = Array.from(element.childNodes);
    children.forEach((child, index) => {
      const childPath = `${path}/${index}`;

      if (child.nodeType === Node.ELEMENT_NODE) {
        serialized.children.push(this.serializeDOM(child, childPath));
      } else if (
        child.nodeType === Node.TEXT_NODE &&
        child.textContent.trim()
      ) {
        serialized.children.push({
          path: childPath,
          tagName: 'text',
          textContent: child.textContent.trim(),
          hash: this.hashString(child.textContent.trim())
        });
      }
    });

    // Compute hash for this element
    serialized.hash = this.computeElementHash(serialized);

    return serialized;
  }

  /**
   * Get all attributes of an element
   * @param {HTMLElement} element - Target element
   * @returns {Object} Attributes object
   * @private
   */
  getElementAttributes(element) {
    const attributes = {};

    if (element.attributes) {
      Array.from(element.attributes).forEach(attr => {
        attributes[attr.name] = attr.value;
      });
    }

    return attributes;
  }

  /**
   * Compute changes between two DOM structures
   * @param {Object} before - Before structure
   * @param {Object} after - After structure
   * @returns {Array} Array of changes
   * @private
   */
  computeChanges(before, after) {
    const changes = [];
    const beforeMap = this.buildElementMap(before);
    const afterMap = this.buildElementMap(after);

    // Find deletions and modifications
    beforeMap.forEach((beforeElement, path) => {
      const afterElement = afterMap.get(path);

      if (!afterElement) {
        changes.push({
          type: 'deletions',
          path: path,
          element: beforeElement,
          description: `Removed ${beforeElement.tagName}${beforeElement.id ? '#' + beforeElement.id : ''}`
        });
      } else if (beforeElement.hash !== afterElement.hash) {
        const modifications = this.findElementModifications(
          beforeElement,
          afterElement
        );
        modifications.forEach(mod => {
          changes.push({
            type: 'modifications',
            path: path,
            property: mod.property,
            before: mod.before,
            after: mod.after,
            description: mod.description
          });
        });
      }
    });

    // Find additions
    afterMap.forEach((afterElement, path) => {
      if (!beforeMap.has(path)) {
        changes.push({
          type: 'additions',
          path: path,
          element: afterElement,
          description: `Added ${afterElement.tagName}${afterElement.id ? '#' + afterElement.id : ''}`
        });
      }
    });

    // Find moved elements (simplified approach)
    this.findMovedElements(beforeMap, afterMap, changes);

    return changes.sort((a, b) => a.path.localeCompare(b.path));
  }

  /**
   * Build a flat map of elements by path
   * @param {Object} structure - DOM structure
   * @param {Map} [map=new Map()] - Map to populate
   * @returns {Map} Element map
   * @private
   */
  buildElementMap(structure, map = new Map()) {
    map.set(structure.path, structure);

    structure.children.forEach(child => {
      this.buildElementMap(child, map);
    });

    return map;
  }

  /**
   * Find modifications between two elements
   * @param {Object} before - Before element
   * @param {Object} after - After element
   * @returns {Array} Array of modifications
   * @private
   */
  findElementModifications(before, after) {
    const modifications = [];

    // Check text content
    if (before.textContent !== after.textContent) {
      modifications.push({
        property: 'textContent',
        before: before.textContent,
        after: after.textContent,
        description: 'Text content changed'
      });
    }

    // Check attributes
    const beforeAttrs = before.attributes || {};
    const afterAttrs = after.attributes || {};

    // Find changed/removed attributes
    Object.keys(beforeAttrs).forEach(attr => {
      if (afterAttrs[attr] !== beforeAttrs[attr]) {
        modifications.push({
          property: `attribute.${attr}`,
          before: beforeAttrs[attr],
          after: afterAttrs[attr] || null,
          description: afterAttrs[attr]
            ? `Attribute '${attr}' changed`
            : `Attribute '${attr}' removed`
        });
      }
    });

    // Find new attributes
    Object.keys(afterAttrs).forEach(attr => {
      if (!(attr in beforeAttrs)) {
        modifications.push({
          property: `attribute.${attr}`,
          before: null,
          after: afterAttrs[attr],
          description: `Attribute '${attr}' added`
        });
      }
    });

    return modifications;
  }

  /**
   * Find moved elements between snapshots
   * @param {Map} beforeMap - Before elements map
   * @param {Map} afterMap - After elements map
   * @param {Array} changes - Changes array to populate
   * @private
   */
  findMovedElements(beforeMap, afterMap, changes) {
    // This is a simplified implementation
    // A more sophisticated approach would use tree edit distance algorithms

    const beforeByHash = new Map();
    const afterByHash = new Map();

    // Group elements by hash
    beforeMap.forEach((element, path) => {
      if (!beforeByHash.has(element.hash)) {
        beforeByHash.set(element.hash, []);
      }
      beforeByHash.get(element.hash).push({ element, path });
    });

    afterMap.forEach((element, path) => {
      if (!afterByHash.has(element.hash)) {
        afterByHash.set(element.hash, []);
      }
      afterByHash.get(element.hash).push({ element, path });
    });

    // Find potential moves
    beforeByHash.forEach((beforeElements, hash) => {
      const afterElements = afterByHash.get(hash);

      if (beforeElements.length === 1 && afterElements?.length === 1) {
        const beforePath = beforeElements[0].path;
        const afterPath = afterElements[0].path;

        if (beforePath !== afterPath) {
          // Check if this is actually a move (not already marked as addition/deletion)
          const hasAddition = changes.some(
            c => c.type === 'additions' && c.path === afterPath
          );
          const hasDeletion = changes.some(
            c => c.type === 'deletions' && c.path === beforePath
          );

          if (hasAddition && hasDeletion) {
            // Remove the addition and deletion, add a move
            changes.splice(
              changes.findIndex(
                c => c.type === 'additions' && c.path === afterPath
              ),
              1
            );
            changes.splice(
              changes.findIndex(
                c => c.type === 'deletions' && c.path === beforePath
              ),
              1
            );

            changes.push({
              type: 'moved',
              fromPath: beforePath,
              toPath: afterPath,
              element: beforeElements[0].element,
              description: `Moved ${beforeElements[0].element.tagName} from ${beforePath} to ${afterPath}`
            });
          }
        }
      }
    });
  }

  /**
   * Count total elements in a tree
   * @param {HTMLElement} element - Root element
   * @returns {number} Element count
   * @private
   */
  countElements(element) {
    let count = 1;

    Array.from(element.children).forEach(child => {
      count += this.countElements(child);
    });

    return count;
  }

  /**
   * Compute hash for an element
   * @param {Object} element - Serialized element
   * @returns {string} Element hash
   * @private
   */
  computeElementHash(element) {
    const hashData = {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      attributes: element.attributes,
      textContent: element.textContent,
      childHashes: element.children.map(child => child.hash)
    };

    return this.hashString(JSON.stringify(hashData));
  }

  /**
   * Generate hash for a string
   * @param {string} str - String to hash
   * @returns {string} Hash value
   * @private
   */
  hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString();
  }

  /**
   * Get all snapshots
   * @returns {Array} Array of snapshot metadata
   */
  getSnapshots() {
    return Array.from(this.snapshots.values()).map(snapshot => ({
      id: snapshot.id,
      label: snapshot.label,
      timestamp: snapshot.timestamp,
      elementCount: snapshot.elementCount,
      metadata: snapshot.metadata
    }));
  }

  /**
   * Get a specific snapshot
   * @param {string} snapshotId - Snapshot ID
   * @returns {Object|null} Snapshot data
   */
  getSnapshot(snapshotId) {
    return this.snapshots.get(snapshotId) || null;
  }

  /**
   * Delete a snapshot
   * @param {string} snapshotId - Snapshot ID to delete
   * @returns {boolean} Success status
   */
  deleteSnapshot(snapshotId) {
    const success = this.snapshots.delete(snapshotId);

    if (this.currentSnapshot === snapshotId) {
      this.currentSnapshot = null;
    }

    console.log(
      `🗑️ Snapshot ${snapshotId} ${success ? 'deleted' : 'not found'}`
    );
    return success;
  }

  /**
   * Clear all snapshots
   */
  clearSnapshots() {
    this.snapshots.clear();
    this.currentSnapshot = null;
    this.snapshotCounter = 0;
    console.log('🧹 All snapshots cleared');
  }

  /**
   * Export diff results to various formats
   * @param {Object} diffResults - Results from compareSnapshots
   * @param {string} format - Export format ('json', 'html', 'text')
   * @returns {string} Exported data
   */
  exportDiff(diffResults, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(diffResults, null, 2);

      case 'html':
        return this.generateHTMLReport(diffResults);

      case 'text':
        return this.generateTextReport(diffResults);

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate HTML report for diff results
   * @param {Object} diffResults - Diff results
   * @returns {string} HTML report
   * @private
   */
  generateHTMLReport(diffResults) {
    const { before, after, changes, summary, performance } = diffResults;

    return `
<!DOCTYPE html>
<html>
<head>
    <title>DOM Diff Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .changes { margin: 20px 0; }
        .change { margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; }
        .addition { border-left-color: #4CAF50; background: #f1f8e9; }
        .deletion { border-left-color: #f44336; background: #ffebee; }
        .modification { border-left-color: #ff9800; background: #fff3e0; }
        .moved { border-left-color: #2196F3; background: #e3f2fd; }
        .code { font-family: monospace; background: #f5f5f5; padding: 2px 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>DOM Diff Report</h1>
        <p><strong>Before:</strong> ${before.label} (${new Date(before.timestamp).toLocaleString()})</p>
        <p><strong>After:</strong> ${after.label} (${new Date(after.timestamp).toLocaleString()})</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Changes</h3>
            <div>${summary.totalChanges}</div>
        </div>
        <div class="metric">
            <h3>Additions</h3>
            <div>${summary.additions}</div>
        </div>
        <div class="metric">
            <h3>Deletions</h3>
            <div>${summary.deletions}</div>
        </div>
        <div class="metric">
            <h3>Modifications</h3>
            <div>${summary.modifications}</div>
        </div>
        <div class="metric">
            <h3>Moved</h3>
            <div>${summary.moved}</div>
        </div>
    </div>

    <div class="changes">
        <h2>Changes Detail</h2>
        ${changes
          .map(
            change => `
            <div class="change ${change.type}">
                <strong>${change.type.toUpperCase()}:</strong>
                <span class="code">${change.path || change.fromPath}</span>
                ${change.toPath ? ` → <span class="code">${change.toPath}</span>` : ''}
                <br>
                <em>${change.description}</em>
                ${change.before !== undefined ? `<br><strong>Before:</strong> ${change.before}` : ''}
                ${change.after !== undefined ? `<br><strong>After:</strong> ${change.after}` : ''}
            </div>
        `
          )
          .join('')}
    </div>

    <div class="performance">
        <h2>Performance Metrics</h2>
        <p><strong>Diff Time:</strong> ${performance.diffTime.toFixed(2)}ms</p>
        <p><strong>Elements Compared:</strong> ${performance.elementsCompared}</p>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate text report for diff results
   * @param {Object} diffResults - Diff results
   * @returns {string} Text report
   * @private
   */
  generateTextReport(diffResults) {
    const { before, after, changes, summary, performance } = diffResults;

    let report = `DOM DIFF REPORT\n`;
    report += `===============\n\n`;
    report += `Before: ${before.label} (${new Date(before.timestamp).toLocaleString()})\n`;
    report += `After:  ${after.label} (${new Date(after.timestamp).toLocaleString()})\n\n`;

    report += `SUMMARY\n`;
    report += `-------\n`;
    report += `Total Changes: ${summary.totalChanges}\n`;
    report += `Additions:     ${summary.additions}\n`;
    report += `Deletions:     ${summary.deletions}\n`;
    report += `Modifications: ${summary.modifications}\n`;
    report += `Moved:         ${summary.moved}\n\n`;

    if (changes.length > 0) {
      report += `CHANGES DETAIL\n`;
      report += `--------------\n`;

      changes.forEach((change, index) => {
        report += `${index + 1}. ${change.type.toUpperCase()}: ${change.path || change.fromPath}`;
        if (change.toPath) {
          report += ` → ${change.toPath}`;
        }
        report += `\n   ${change.description}\n`;

        if (change.before !== undefined) {
          report += `   Before: ${change.before}\n`;
        }
        if (change.after !== undefined) {
          report += `   After:  ${change.after}\n`;
        }
        report += `\n`;
      });
    }

    report += `PERFORMANCE\n`;
    report += `-----------\n`;
    report += `Diff Time: ${performance.diffTime.toFixed(2)}ms\n`;
    report += `Elements Compared: ${performance.elementsCompared}\n`;

    return report;
  }

  /**
   * Start tracking live DOM changes
   * @param {HTMLElement} [root=document.body] - Root element to observe
   * @param {Object} [options] - MutationObserver options
   */
  startTracking(root = document.body, options = {}) {
    if (this.isTracking) {
      this.stopTracking();
    }

    const observerOptions = {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      attributeOldValue: true,
      characterDataOldValue: true,
      ...options
    };

    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        this.processMutation(mutation);
      });
    });

    this.mutationObserver.observe(root, observerOptions);
    this.isTracking = true;
    this.trackingRoot = root;

    console.log('🔍 DOM tracking started');
  }

  /**
   * Stop tracking DOM changes
   */
  stopTracking() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    this.isTracking = false;
    this.trackingRoot = null;
    console.log('⏹️ DOM tracking stopped');
  }

  /**
   * Process a mutation record
   * @param {MutationRecord} mutation - Mutation to process
   * @private
   */
  processMutation(mutation) {
    const change = {
      type: mutation.type,
      target: mutation.target,
      timestamp: Date.now(),
      details: {}
    };

    switch (mutation.type) {
      case 'childList':
        change.details = {
          addedNodes: Array.from(mutation.addedNodes),
          removedNodes: Array.from(mutation.removedNodes),
          nextSibling: mutation.nextSibling,
          previousSibling: mutation.previousSibling
        };
        break;

      case 'attributes':
        change.details = {
          attributeName: mutation.attributeName,
          oldValue: mutation.oldValue,
          newValue: mutation.target.getAttribute(mutation.attributeName)
        };
        break;

      case 'characterData':
        change.details = {
          oldValue: mutation.oldValue,
          newValue: mutation.target.textContent
        };
        break;
    }

    this.changeHistory.push(change);

    // Limit history size
    if (this.changeHistory.length > 1000) {
      this.changeHistory = this.changeHistory.slice(-500);
    }
  }

  /**
   * Get live change history
   * @returns {Array} Array of recorded changes
   */
  getChangeHistory() {
    return [...this.changeHistory];
  }

  /**
   * Clear change history
   */
  clearChangeHistory() {
    this.changeHistory = [];
    console.log('🧹 Change history cleared');
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      snapshotCount: this.snapshots.size,
      isTracking: this.isTracking,
      changeHistorySize: this.changeHistory.length
    };
  }

  /**
   * Reset the differ to initial state
   */
  reset() {
    this.stopTracking();
    this.clearSnapshots();
    this.clearChangeHistory();

    this.performanceMetrics = {
      snapshotTime: 0,
      diffTime: 0,
      totalElements: 0,
      changedElements: 0
    };

    console.log('🔄 DOMDiffer reset');
  }

  /**
   * Get component status for debugging
   * @returns {Object} Component status
   */
  getStatus() {
    return {
      isTracking: this.isTracking,
      snapshotCount: this.snapshots.size,
      currentSnapshot: this.currentSnapshot,
      changeHistorySize: this.changeHistory.length,
      performanceMetrics: this.performanceMetrics,
      options: { ...this.options }
    };
  }
}
