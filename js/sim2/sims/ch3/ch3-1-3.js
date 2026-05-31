/**
 * ch3-1-3 — HQC quán tính vs phi quán tính. dalembertForce + equilibriumWithInertia.
 * Toa xe gia tốc a; con lắc trong toa lệch góc. Kéo gia tốc a → lực quán tính + góc lệch.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics;

  Reg.register('ch3-1-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -1, maxX: 5, maxY: 6 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 1, g = 9.81, VIS = 0.12;
    let aFrame = 3; // gia tốc toa xe (m/s²) theo +x

    // Toa xe (hộp) + trần treo con lắc
    svg.appendChild(render.poly(tf,
      [{ x: -3.5, y: 0 }, { x: 3.5, y: 0 }, { x: 3.5, y: 5 }, { x: -3.5, y: 5 }],
      { closed: true, fill: 'rgba(150,150,150,0.08)', stroke: '#999' }));
    const pivot = { x: 0, y: 5 };
    const bob = render.circle(tf, pivot, 7, { pixel: true, fill: '#368', stroke: '#368' }); svg.appendChild(bob);
    const cord = render.line(tf, pivot, pivot, { stroke: '#555', width: 2 }); svg.appendChild(cord);
    const aArrow = render.arrow(tf, svg, { x: -2.5, y: 2.5 }, { x: -2.5, y: 2.5 }, { stroke: '#a3a', width: 3 }); svg.appendChild(aArrow);
    const finArrow = render.arrow(tf, svg, pivot, pivot, { stroke: '#e63', width: 2.5 }); svg.appendChild(finArrow);

    const lblA = overlay.label('a (toa)', { x: -2.5, y: 2.5 }, { anchor: 'bottom', color: '#83a' });
    const lblF = overlay.label('F* qt', pivot, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function update() {
      // con lắc lệch góc θ: tan θ = a/g (lực quán tính ngang -m a, trọng lực -m g)
      const theta = Math.atan2(aFrame, g);
      const L = 3;
      const bobPt = { x: pivot.x + L * Math.sin(theta), y: pivot.y - L * Math.cos(theta) };
      const sp = tf.toScreen(pivot), sb = tf.toScreen(bobPt);
      cord.setAttribute('x1', sp.x); cord.setAttribute('y1', sp.y);
      cord.setAttribute('x2', sb.x); cord.setAttribute('y2', sb.y);
      bob.setAttribute('cx', sb.x); bob.setAttribute('cy', sb.y);
      set(aArrow, { x: -2.5, y: 2.5 }, { x: -2.5 + aFrame * VIS, y: 2.5 });
      // lực quán tính F* = -m·a (ngược chiều a, tại bob)
      const fIner = D.dalembertForce(m, aFrame, 0);
      set(finArrow, bobPt, { x: bobPt.x + fIner.fx * VIS, y: bobPt.y });
      overlay.moveLabel(lblA, { x: -2.5 + aFrame * VIS * 0.5, y: 2.9 });
      overlay.moveLabel(lblF, { x: bobPt.x + fIner.fx * VIS - 0.3, y: bobPt.y + 0.4 });
      card.__render([
        { label: 'a toa:', value: aFrame.toFixed(1) + ' m/s²' },
        { label: 'F* = -m·a:', value: fIner.fx.toFixed(1) + ' N' },
        { label: 'θ lệch:', value: (theta * 180 / Math.PI).toFixed(1) + '°' },
        { label: 'tanθ = a/g:', value: (aFrame / g).toFixed(3) }
      ]);
    }

    const handle = shell.addHandle({ x: -2.5 + aFrame * VIS, y: 2.5 }, {
      onDrag(wp) {
        aFrame = Math.min(8, Math.max(0, (wp.x - (-2.5)) / VIS));
        handle.move({ x: -2.5 + aFrame * VIS, y: 2.5 });
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
