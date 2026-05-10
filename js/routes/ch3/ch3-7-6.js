/**
 * ch3-7-6: Dynamics Exercise
 * An interactive solver for dynamics problems.
 * Allows users to input values and check results for various dynamics scenarios.
 */
(function() {
  'use strict';

  function init(host) {
    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '1fr 320px';
    layout.style.gap = '20px';
    layout.style.width = '100%';
    host.appendChild(layout);

    const viewport = document.createElement('div');
    viewport.className = 'sim-viewport-v2';
    viewport.style.display = 'flex';
    viewport.style.flexDirection = 'column';
    viewport.style.justifyContent = 'center';
    viewport.style.alignItems = 'center';
    viewport.style.background = '#091a33';
    viewport.style.color = '#fff';
    viewport.style.padding = '40px';
    layout.appendChild(viewport);

    const sidebar = document.createElement('div');
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.gap = '15px';
    layout.appendChild(sidebar);

    const uiContainer = document.createElement('div');
    sidebar.appendChild(uiContainer);
    const ui = new SimUI(uiContainer);

    // Problem State
    const problems = [
      { id: 1, text: "Vật m = 4 kg, vận tốc v = 5 m/s. Tính động năng K?", formula: "K = 1/2 * m * v²", solve: (p) => 0.5 * p.m * p.v**2, inputs: { m: 4, v: 5 }, unit: "J" },
      { id: 2, text: "Lực F = 20 N tác dụng đoạn đường d = 3 m. Tính công W?", formula: "W = F * d", solve: (p) => p.F * p.d, inputs: { F: 20, d: 3 }, unit: "J" },
      { id: 3, text: "Vật m = 2 kg ở độ cao h = 10 m. Tính thế năng PE? (g=9.8)", formula: "PE = m * g * h", solve: (p) => p.m * 9.8 * p.h, inputs: { m: 2, h: 10 }, unit: "J" },
      { id: 4, text: "Momen quán tính I = 2 kg.m², ω = 3 rad/s. Tính momen động lượng L?", formula: "L = I * ω", solve: (p) => p.I * p.w, inputs: { I: 2, w: 3 }, unit: "kg.m²/s" }
    ];

    let currentIdx = 0;
    let userVal = "";
    let resultStatus = null; // null, true, false

    const qTitle = document.createElement('h2');
    qTitle.style.color = '#c9963a';
    viewport.appendChild(qTitle);

    const qText = document.createElement('p');
    qText.style.fontSize = '1.2em';
    qText.style.textAlign = 'center';
    qText.style.margin = '20px 0';
    viewport.appendChild(qText);

    const inputArea = document.createElement('div');
    inputArea.style.display = 'flex';
    inputArea.style.gap = '10px';
    inputArea.style.alignItems = 'center';
    
    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'Kết quả...';
    input.style.padding = '8px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #c9963a';
    input.style.background = '#1a3a5c';
    input.style.color = '#fff';
    inputArea.appendChild(input);

    const checkBtn = document.createElement('button');
    checkBtn.textContent = 'Kiểm tra';
    checkBtn.className = 'sim-btn-v2';
    inputArea.appendChild(checkBtn);
    viewport.appendChild(inputArea);

    const feedback = document.createElement('div');
    feedback.style.marginTop = '20px';
    feedback.style.fontSize = '1.1em';
    feedback.style.fontWeight = 'bold';
    viewport.appendChild(feedback);

    const hint = document.createElement('div');
    hint.style.marginTop = '10px';
    hint.style.color = '#27ae60';
    hint.style.fontStyle = 'italic';
    viewport.appendChild(hint);

    function updateProblem() {
      const p = problems[currentIdx];
      qTitle.textContent = `Bài tập ${p.id}`;
      qText.textContent = p.text;
      input.value = "";
      feedback.textContent = "";
      hint.textContent = "";
      resultStatus = null;
    }

    checkBtn.onclick = () => {
      const p = problems[currentIdx];
      const ans = p.solve(p.inputs);
      const val = parseFloat(input.value);
      
      if (Math.abs(val - ans) < 0.1) {
        feedback.textContent = "Chính xác! ✓";
        feedback.style.color = "#27ae60";
      } else {
        feedback.textContent = `Chưa đúng. Đáp án là ${ans} ${p.unit}`;
        feedback.style.color = "#e74c3c";
      }
    };

    ui.addButton('Bài tiếp theo', () => {
      currentIdx = (currentIdx + 1) % problems.length;
      updateProblem();
    });

    ui.addButton('Hiện gợi ý', () => {
      hint.textContent = `Công thức: ${problems[currentIdx].formula}`;
    });

    updateProblem();

    return {
      dispose: () => {
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-7-6', {
      chapter: 3,
      type: 'dynamics',
      title: 'Kiem tra bai tap',
      hint: 'Select problem, enter answer'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-7-6'] = init;
})();
