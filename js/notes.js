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
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || '{}');
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
      return Object.fromEntries(Object.entries(raw).filter(([, value]) => Array.isArray(value)).map(([id, value]) => [
        id, value.filter(n => n && typeof n.text === 'string').map(n => ({
          text: n.text, note: typeof n.note === 'string' ? n.note : '', ts: n.ts
        }))
      ]));
    } catch { return {}; }
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

  // Cập nhật badge đếm số ghi chú của trang hiện tại (đọc từ localStorage).
  // KHÔNG vẽ lại vùng highlight: dữ liệu lưu không có anchor để re-wrap đáng tin.
  // Danh sách note đầy đủ xem qua panel (showNotesPanel).
  function refreshNotesIndicator() {
    const pid = getPageId();
    const notes = getNotes();
    const pageNotes = notes[pid];
    if (!pageNotes || !pageNotes.length) {
      const stale = document.querySelector('.notes-indicator');
      if (stale) stale.remove();
      return;
    }

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

    // Persisted notes are untrusted text, never HTML (including quoted text).
    const header = document.createElement('div');
    header.className = 'np-header';
    const title = document.createElement('span');
    title.textContent = '📝 Ghi chú của bạn';
    const close = document.createElement('button');
    close.textContent = '✕';
    close.type = 'button';
    close.setAttribute('aria-label', 'Đóng ghi chú');
    close.addEventListener('click', () => panel.remove());
    header.appendChild(title);
    header.appendChild(close);
    panel.appendChild(header);
    if (!pageNotes.length) {
      const empty = document.createElement('div');
      empty.className = 'np-empty';
      empty.textContent = 'Chưa có ghi chú. Bôi đen text để tạo.';
      panel.appendChild(empty);
    } else {
      pageNotes.forEach((n, i) => {
        const item = document.createElement('div');
        item.className = 'np-item';
        const quote = document.createElement('div');
        quote.className = 'np-text';
        quote.textContent = `"${n.text.slice(0, 80)}${n.text.length > 80 ? '…' : ''}"`;
        item.appendChild(quote);
        if (n.note) {
          const comment = document.createElement('div');
          comment.className = 'np-comment';
          comment.textContent = n.note;
          item.appendChild(comment);
        }
        const del = document.createElement('button');
        del.className = 'np-del';
        del.type = 'button';
        del.dataset.idx = String(i);
        del.title = 'Xóa';
        del.setAttribute('aria-label', 'Xóa ghi chú');
        del.textContent = '🗑️';
        item.appendChild(del);
        panel.appendChild(item);
      });
    }
    document.body.appendChild(panel);

    // Delete handler
    panel.querySelectorAll('.np-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const notes2 = getNotes();
        if (notes2[pid]) { notes2[pid].splice(idx, 1); saveNotes(notes2); }
        panel.remove();
        showNotesPanel();
        refreshNotesIndicator();
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
    setTimeout(refreshNotesIndicator, 500);
  });

  function init() {
    const ca = document.getElementById('content-area');
    if (ca) obs.observe(ca, { childList: true });
    document.addEventListener('mouseup', onMouseUp);
    refreshNotesIndicator();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
