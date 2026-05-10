/**
 * SimulationEngine V2
 * Wraps headless Matter.js and synchronizes to SVG/DOM rendering.
 */
class SimulationEngine {
  constructor(options = {}) {
    this.matterEngine = Matter.Engine.create();
    this.world = this.matterEngine.world;
    this.bodies = []; // Array of { matterBody, domElement, syncFn }
    this.isRunning = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDelta = 1000 / 60; // 60 FPS fixed step
    
    // Default gravity (standard Mechanics Y-up vs Matter.js Y-down)
    this.world.gravity.y = options.gravity !== undefined ? options.gravity : 1;
    
    // Viewport options for coordinate transformation
    this.viewHeight = options.viewHeight || 600;
    this.flipY = options.flipY || false;
    this.originX = options.originX || 0;
    this.originY = options.originY || 0;
    
    this.tick = this.tick.bind(this);
  }

  /**
   * Add a body to the engine and map it to a DOM/SVG element.
   * @param {Matter.Body} body 
   * @param {HTMLElement|SVGElement} element 
   * @param {Function} syncFn Optional custom sync function (body, element)
   */
  addBody(body, element, syncFn = null) {
    if (typeof Matter === 'undefined') {
      console.error('Matter.js is NOT found in global scope!');
      return;
    }
    Matter.Composite.add(this.world, body);
    this.bodies.push({
      matterBody: body,
      domElement: element,
      syncFn: syncFn || this.defaultSync.bind(this)
    });
  }

  /**
   * Default sync: applies transform to element.
   * Respects flipY and origin offsets.
   */
  defaultSync(body, element) {
    let { x, y } = body.position;
    let angle = body.angle;

    // Apply coordinate transformations
    x += this.originX;
    
    if (this.flipY) {
      y = this.viewHeight - y - this.originY;
      angle = -angle; // Rotate in opposite direction if Y is flipped
    } else {
      y += this.originY;
    }

    const deg = (angle * 180) / Math.PI;
    element.setAttribute('transform', `translate(${x}, ${y}) rotate(${deg})`);
  }

  /**
   * Start the simulation loop.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  /**
   * Stop the simulation loop.
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Main simulation tick.
   */
  tick(time) {
    if (!this.isRunning) return;

    let delta = time - this.lastTime;
    this.lastTime = time;

    // Limit delta to prevent "spiral of death" if tab is inactive
    if (delta > 100) delta = 100;

    this.accumulator += delta;

    // Update Matter.js engine with fixed time steps
    while (this.accumulator >= this.fixedDelta) {
      Matter.Engine.update(this.matterEngine, this.fixedDelta);
      this.accumulator -= this.fixedDelta;
    }

    // Sync bodies to DOM
    for (let i = 0; i < this.bodies.length; i++) {
      const { matterBody, domElement, syncFn } = this.bodies[i];
      syncFn(matterBody, domElement);
    }

    requestAnimationFrame(this.tick);
  }
}

// Export to window
window.SimulationEngine = SimulationEngine;
