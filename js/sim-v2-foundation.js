/**
 * Simulation V2 Foundation
 * Common utilities for simulation IDs, disposal, and SVG primitives.
 */

/**
 * ID Generator to prevent collisions in SVG markers/filters
 */
const SimV2ID = {
  /**
   * Generates a unique ID with an optional prefix.
   * @param {string} prefix 
   * @returns {string}
   */
  next(prefix = 'sim') {
    const random = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString(36).substring(4);
    return `${prefix}-${timestamp}-${random}`;
  }
};

/**
 * Disposal Helper to prevent memory leaks
 */
const SimV2Disposal = {
  /**
   * Disposes an object based on its type (Matter.js, Chart.js, etc.)
   * @param {any} target 
   */
  dispose(target) {
    if (!target) return;

    // Handle array of targets
    if (Array.isArray(target)) {
      target.forEach(t => this.dispose(t));
      return;
    }

    // Chart.js disposal
    if (typeof target.destroy === 'function') {
      target.destroy();
    }

    // Matter.js Engine disposal
    if (target.world && typeof Matter !== 'undefined' && Matter.World) {
      Matter.World.clear(target.world);
      Matter.Engine.clear(target);
    }

    // Custom disposal
    if (typeof target.dispose === 'function') {
      target.dispose();
    }
  }
};

/**
 * Base Primitives for SVG Mechanics
 */
const SimV2Primitives = {
  /**
   * Creates a reusable SVG arrow with a unique marker ID.
   * @param {SVGElement} svg 
   * @param {object} options 
   * @returns {object} { group, line, update(x1, y1, x2, y2) }
   */
  createArrow(svg, options = {}) {
    const color = options.color || '#ff4444';
    const strokeWidth = options.strokeWidth || 2;
    const markerId = SimV2ID.next('marker-arrow');

    // Create defs if not exists
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.prepend(defs);
    }

    // Create marker
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', color);
    marker.appendChild(path);
    defs.appendChild(marker);

    // Create line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', strokeWidth);
    line.setAttribute('marker-end', `url(#${markerId})`);
    
    if (options.className) line.classList.add(options.className);
    svg.appendChild(line);

    return {
      line,
      marker,
      update(x1, y1, x2, y2) {
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
      },
      dispose() {
        if (line.parentNode) line.parentNode.removeChild(line);
        if (marker.parentNode) marker.parentNode.removeChild(marker);
      }
    };
  },

  /**
   * Creates a rectangular block.
   */
  createBlock(svg, w, h, options = {}) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('x', -w / 2);
    rect.setAttribute('y', -h / 2);
    rect.setAttribute('fill', options.fill || '#3498db');
    rect.setAttribute('stroke', options.stroke || '#2980b9');
    rect.setAttribute('stroke-width', options.strokeWidth || 2);
    if (options.rx) rect.setAttribute('rx', options.rx);
    
    svg.appendChild(rect);
    return rect;
  },

  /**
   * Creates a spring path between two points.
   * @param {SVGElement} svg 
   * @param {object} options 
   * @returns {object} { path, update(x1, y1, x2, y2) }
   */
  createSpring(svg, options = {}) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', options.color || '#95a5a6');
    path.setAttribute('stroke-width', options.strokeWidth || 2);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    
    const coils = options.coils || 10;
    const width = options.width || 15;

    svg.appendChild(path);

    return {
      path,
      update(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        const px = -ny;
        const py = nx;

        let d = `M ${x1} ${y1}`;
        
        // Start straight section
        const startLen = 20;
        const endLen = 20;
        const springLen = dist - startLen - endLen;
        
        d += ` L ${x1 + nx * startLen} ${y1 + ny * startLen}`;

        for (let i = 0; i <= coils * 2; i++) {
          const t = i / (coils * 2);
          const segmentDist = startLen + t * springLen;
          const offset = (i % 2 === 0 ? 0 : (i % 4 === 1 ? 1 : -1)) * width;
          
          const x = x1 + nx * segmentDist + px * offset;
          const y = y1 + ny * segmentDist + py * offset;
          d += ` L ${x} ${y}`;
        }

        d += ` L ${x1 + nx * (dist - endLen)} ${y1 + ny * (dist - endLen)}`;
        d += ` L ${x2} ${y2}`;
        path.setAttribute('d', d);
      },
      dispose() {
        if (path.parentNode) path.parentNode.removeChild(path);
      }
    };
  }
};

// Export to window
window.SimV2ID = SimV2ID;
window.SimV2Disposal = SimV2Disposal;
window.SimV2Primitives = SimV2Primitives;
