/**
 * Simulation UI Layer V2
 * Standardized controls and Chart.js integration.
 */

class SimUI {
  /**
   * @param {HTMLElement} container The element to append controls to.
   */
  constructor(container) {
    this.container = container;
    this.container.classList.add('sim-controls-v2');
  }

  /**
   * Add a native range slider control.
   */
  addSlider(label, min, max, step, onChange, initialValue) {
    const group = document.createElement('div');
    group.className = 'sim-slider-group-v2';

    const labelEl = document.createElement('label');
    const titleSpan = document.createElement('span');
    titleSpan.textContent = label;
    const valueSpan = document.createElement('span');
    valueSpan.textContent = initialValue || min;
    labelEl.appendChild(titleSpan);
    labelEl.appendChild(valueSpan);

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'sim-slider-v2';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = initialValue !== undefined ? initialValue : min;

    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      valueSpan.textContent = val;
      onChange(val);
    });

    group.appendChild(labelEl);
    group.appendChild(input);
    this.container.appendChild(group);

    return input;
  }

  /**
   * Add a button.
   */
  addButton(label, onClick, isPrimary = false) {
    const btn = document.createElement('button');
    btn.className = 'sim-btn-v2' + (isPrimary ? ' primary' : '');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    this.container.appendChild(btn);
    return btn;
  }
}

class SimChart {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {string} title 
   * @param {string} yLabel 
   */
  constructor(canvas, title, yLabel) {
    this.canvas = canvas;
    this.maxPoints = 200;
    this.data = {
      labels: [],
      datasets: [{
        label: yLabel,
        data: [],
        borderColor: '#c9963a',
        backgroundColor: 'rgba(201, 150, 58, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0
      }]
    };

    this.instance = new Chart(canvas, {
      type: 'line',
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Disable for performance
        plugins: {
          legend: { display: false },
          title: { display: true, text: title, color: '#8ea0b8' }
        },
        scales: {
          x: { 
            display: true, 
            title: { display: true, text: 'Time (s)', color: '#8ea0b8' },
            grid: { color: 'rgba(232, 236, 241, 0.05)' }
          },
          y: { 
            display: true, 
            grid: { color: 'rgba(232, 236, 241, 0.05)' }
          }
        }
      }
    });
  }

  /**
   * Add a data point and update the chart.
   */
  updateData(time, value) {
    this.data.labels.push(time.toFixed(2));
    this.data.datasets[0].data.push(value);

    if (this.data.labels.length > this.maxPoints) {
      this.data.labels.shift();
      this.data.datasets[0].data.shift();
    }

    this.instance.update('none'); // Update without animation
  }

  /**
   * Clear chart data.
   */
  clear() {
    this.data.labels = [];
    this.data.datasets[0].data = [];
    this.instance.update('none');
  }
}

window.SimUI = SimUI;
window.SimChart = SimChart;
