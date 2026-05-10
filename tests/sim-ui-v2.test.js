const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const context = {
  console,
  window: {},
  document: {
    createElement(tag) {
      const doc = this;
      const el = {
        tagName: tag.toUpperCase(),
        style: {},
        ownerDocument: doc,
        classList: {
          add(cls) { this.className += ' ' + cls; },
          remove(cls) { this.className = this.className.replace(cls, ''); }
        },
        className: '',
        appendChild(child) { 
          if (!this.children) this.children = [];
          this.children.push(child);
          child.parentNode = this;
        },
        addEventListener(event, cb) {
          if (!this.listeners) this.listeners = {};
          this.listeners[event] = cb;
        },
        setAttribute(name, val) { this[name] = val; },
        getAttribute(name) { return this[name]; },
        removeAttribute(name) { delete this[name]; },
        parentNode: null,
        offsetWidth: 400,
        offsetHeight: 300,
        getContext() {
          return {
            canvas: this,
            clearRect() {},
            fillRect() {},
            save() {},
            restore() {},
            measureText() { return { width: 10 }; },
            beginPath() {},
            moveTo() {},
            lineTo() {},
            stroke() {},
            fill() {},
            arc() {},
            setTransform() {},
            resetTransform() {},
            transform() {},
            scale() {},
            rotate() {},
            translate() {},
            createLinearGradient() {
              return { addColorStop() {} };
            },
          };
        }
      };
      return el;
    },
    defaultView: {
      getComputedStyle() {
        return {
          getPropertyValue() { return '0px'; }
        };
      }
    }
  },
  requestAnimationFrame(cb) {
    setTimeout(cb, 16);
  },
  MutationObserver: class {
    constructor() {}
    observe() {}
    disconnect() {}
  },
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);

// Load Chart.js (UMD)
const chartCode = fs.readFileSync(path.join(ROOT, 'lib/chart.umd.js'), 'utf8');
vm.runInContext(chartCode, context);

// Test Instantiation (will fail because js/sim-ui-v2.js doesn't exist yet)
try {
  const uiCode = fs.readFileSync(path.join(ROOT, 'js/sim-ui-v2.js'), 'utf8');
  vm.runInContext(uiCode, context);
} catch (e) {
  console.log('EXPECTED FAILURE: js/sim-ui-v2.js not found');
}

if (context.window.SimUI) {
  const container = context.document.createElement('div');
  const ui = new context.window.SimUI(container);
  
  // Test addSlider
  let sliderVal = 0;
  ui.addSlider('Mass', 1, 10, 0.1, (v) => { sliderVal = v; });
  
  const sliderGroup = container.children[0];
  const input = sliderGroup.children[1];
  assert.strictEqual(input.tagName, 'INPUT');
  assert.strictEqual(input.type, 'range');
  
  // Simulate change
  input.value = 5;
  input.listeners['input']({ target: input });
  assert.strictEqual(sliderVal, 5);
  console.log('✓ SimUI.addSlider passed');

  // Test SimChart
  const canvas = context.document.createElement('canvas');
  const chart = new context.window.SimChart(canvas, 'Test Chart', 'Value');
  assert.ok(chart.instance, 'Chart.js instance should be initialized');
  chart.updateData(1.0, 100);
  console.log('✓ SimChart passed');

  console.log('ALL Phase 03 functional tests passed');
} else {
  console.error('SimUI NOT found in window');
  process.exit(1);
}
