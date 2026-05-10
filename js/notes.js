/**
 * Student Notes — Highlight + Personal Notes
 * Select text → popup → highlight + add note
 * Stored in localStorage per page
 */
(function() {
  const STORE = 'chlyt_notes';
  let popup = null;
  let currentSelection = null;

  function getNotes() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; }
  }
  function saveNotes(n) { localStorage.setItem(STORE, JSON.stringify(n)); }
  function getPageId() { return location.hash.slice(1) || 'home'; }

  // Create selection popup
  function createPopup() {
    if (popup) return;
    popup = document.createElement('div');
    popup.className = 'note-popup';
    popup.innerHTML = `
      <button class="np-hl" title="Highlight">🖍️</button>
      <button class="np-note" title="Thêm ghi chú">📝</button>
      <button class="np-close" title="Đóng">✕</button>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.np-hl').addEventListener('click', () => doHighlight(null));
    popup.querySelector('.np-note').addEventListener('click', doNote);
    popup.querySelector('.np-close').addEventListener('click', hidePopup);
  }

  function showPopup(x, y) {
    createPopup();
    popup.style.left = Math.min(x, window.innerWidth - 160) + 'px';
    popup.style.top = (y - 45) + 'px';
    popup.classList.add('show');
  }

  function hidePopup() {
    if (popup) popup.classList.remove('show');
    currentSelection = null;
  }

  function doHighlight(noteText) {
    if (!currentSelection) return;
    const pid = getPageId();
    const notes = getNotes();
    if (!notes[pid]) notes[pid] = [];

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const text = range.toString().trim();
    if (!text) return;

    // Wrap in highlight span
    const hl = document.createElement('span');
    hl.className = 'stu-highlight';
    if (noteText) {
      hl.dataset.note = noteText;
      hl.title = noteText;
    }
    try {
      range.surroundContents(hl);
    } catch {
      // If crossing element boundaries, just save without visual
    }

    notes[pid].push({
      text: text.slice(0, 200),
      note: noteText || '',
      ts: Date.now()
    });
    saveNotes(notes);
    sel.removeAllRanges();
    hidePopup();
  }

  function doNote() {
    const noteText = prompt('Ghi chú của bạn:');
    if (noteText !== null) doHighlight(noteText);
  }

  // Restore highlights from localStorage (visual indicator)
  function restoreHighlights() {
    const pid = getPageId();
    const notes = getNotes();
    const pageNotes = notes[pid];
    if (!pageNotes || !pageNotes.length) return;

    // Show notes count indicator
    let indicator = document.querySelector('.notes-indicator');
    if (!indicator) {
      indicator = document.createElement('button');
      indicator.className = 'notes-indicator';
      indicator.title = 'Xem ghi chú';
      indicator.addEventListener('click', showNotesPanel);
      const bc = document.querySelector('.bc');
      if (bc && bc.parentElement) bc.parentElement.insertBefore(indicator, bc);
    }
    indicator.textContent = `📝 ${pageNotes.length}`;
  }

  // Show notes panel
  function showNotesPanel() {
    const pid = getPageId();
    const notes = getNotes();
    const pageNotes = notes[pid] || [];

    let panel = document.querySelector('.notes-panel');
    if (panel) { panel.remove(); return; }

    panel = document.createElement('div');
    panel.className = 'notes-panel';

    let html = '<div class="np-header"><span>📝 Ghi chú của bạn</span><button onclick="this.closest(\'.notes-panel\').remove()">✕</button></div>';
    if (!pageNotes.length) {
      html += '<div class="np-empty">Chưa có ghi chú. Bôi đen text để tạo.</div>';
    } else {
      pageNotes.forEach((n, i) => {
        html += `<div class="np-item">
          <div class="np-text">"${n.text.slice(0, 80)}${n.text.length > 80 ? '…' : ''}"</div>
          ${n.note ? `<div class="np-comment">${n.note}</div>` : ''}
          <button class="np-del" data-idx="${i}" title="Xóa">🗑️</button>
        </div>`;
      });
    }
    panel.innerHTML = html;
    document.body.appendChild(panel);

    // Delete handler
    panel.querySelectorAll('.np-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const notes2 = getNotes();
        if (notes2[pid]) { notes2[pid].splice(idx, 1); saveNotes(notes2); }
        panel.remove();
        showNotesPanel();
        restoreHighlights();
      });
    });
  }

  // Text selection handler
  function onMouseUp(e) {
    if (e.target.closest('.note-popup') || e.target.closest('.notes-panel')) return;
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (text.length > 2 && e.target.closest('#content-area')) {
      currentSelection = { text };
      showPopup(e.pageX, e.pageY);
    } else {
      hidePopup();
    }
  }

  // Init on content change
  const obs = new MutationObserver(() => {
    setTimeout(restoreHighlights, 500);
  });

  function init() {
    const ca = document.getElementById('content-area');
    if (ca) obs.observe(ca, { childList: true });
    document.addEventListener('mouseup', onMouseUp);
    restoreHighlights();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
