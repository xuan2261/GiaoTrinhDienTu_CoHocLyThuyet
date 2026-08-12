/**
 * Glossary / Từ điển thuật ngữ
 * Auto-highlight technical terms → hover tooltip
 * Terms stored inline, no server needed
 */
(function() {
  const TERMS = {
    'vật rắn tuyệt đối': 'Vật mà khoảng cách giữa hai điểm bất kỳ luôn không đổi (không biến dạng).',
    'hệ lực': 'Tập hợp các lực tác dụng lên một vật hoặc hệ vật.',
    'ngẫu lực': 'Hệ gồm 2 lực song song, ngược chiều, cùng cường độ, khác đường tác dụng.',
    'mô men': 'Đại lượng đo xu hướng quay mà lực gây ra đối với một điểm/trục.',
    'hợp lực': 'Một lực duy nhất tương đương (cùng tác dụng) với cả hệ lực.',
    'phản lực liên kết': 'Lực do liên kết tác dụng lên vật khi giải phóng liên kết.',
    'lực hoạt động': 'Lực đã biết trước (trọng lực, lực kéo…), phân biệt với phản lực.',
    'tiên đề': 'Mệnh đề thừa nhận mà không chứng minh, dùng làm nền tảng lý thuyết.',
    'trọng tâm': 'Điểm đặt hợp lực của hệ trọng lực phân bố trên vật.',
    'ma sát': 'Lực cản trở chuyển động hoặc xu hướng chuyển động giữa hai bề mặt tiếp xúc.',
    'véc tơ chính': 'Tổng véc tơ của tất cả các lực trong hệ: R⃗ = ΣF⃗ᵢ.',
    'mô men chính': 'Tổng mô men của tất cả các lực đối với một điểm: M⃗ₒ = Σm⃗ₒ(F⃗ᵢ).',
    'hệ quy chiếu': 'Hệ gồm vật mốc, hệ tọa độ gắn với vật mốc, và đồng hồ đo thời gian.',
    'quỹ đạo': 'Đường cong mà chất điểm vạch ra trong không gian khi chuyển động.',
    'vận tốc': 'Đạo hàm bậc nhất của véc tơ vị trí theo thời gian: v⃗ = dr⃗/dt.',
    'gia tốc': 'Đạo hàm bậc nhất của véc tơ vận tốc theo thời gian: a⃗ = dv⃗/dt.',
    'gia tốc tiếp tuyến': 'Thành phần gia tốc dọc theo phương tiếp tuyến quỹ đạo, đo sự thay đổi trị số vận tốc.',
    'gia tốc pháp tuyến': 'Thành phần gia tốc hướng vào tâm cong, đo sự thay đổi phương vận tốc.',
    'chuyển động tịnh tiến': 'Chuyển động mà mọi đoạn thẳng gắn với vật luôn song song vị trí ban đầu.',
    'tâm vận tốc tức thời': 'Điểm có vận tốc bằng 0 tại một thời điểm trong c/đ song phẳng.',
    'gia tốc coriolis': 'Gia tốc bổ sung do chuyển động tương đối trong hệ quy chiếu quay: a⃗ₖ = 2ω⃗ × v⃗ᵣ.',
    'động lượng': 'Tích khối lượng và vận tốc: p⃗ = mv⃗.',
    'động năng': 'Năng lượng do chuyển động: T = ½mv².',
    'mô men quán tính': 'Đại lượng đo quán tính quay: J = Σmᵢrᵢ².',
    'lực quán tính': 'Lực ảo trong nguyên lý D\'Alembert: F⃗ᵢₙ = −ma⃗.',
    'va chạm': 'Tương tác trong thời gian cực ngắn với lực cực lớn (xung lực).',
    'hệ số hồi phục': 'Tỷ số vận tốc tương đối sau/trước va chạm: k = |v₂\' − v₁\'|/|v₁ − v₂|.',
    'định lý varignon': 'Mô men hợp lực = tổng mô men các lực thành phần.',
  };

  let tooltip = null;

  function createTooltip() {
    if (tooltip) return;
    tooltip = document.createElement('div');
    tooltip.className = 'glossary-tip';
    document.body.appendChild(tooltip);
  }

  function wrapTerms(container) {
    if (!container) return;
    // Walk text nodes
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: node => {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (['SCRIPT','STYLE','CODE','PRE','SPAN'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (p.classList.contains('glossary-term')) return NodeFilter.FILTER_REJECT;
        if (p.closest('.katex')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) textNodes.push(node);

    // Build regex from terms (sorted by length desc for greedy match)
    const sorted = Object.keys(TERMS).sort((a, b) => b.length - a.length);
    const re = new RegExp('(' + sorted.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');

    textNodes.forEach(tn => {
      if (!re.test(tn.textContent)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0;
      const text = tn.textContent;
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const span = document.createElement('span');
        span.className = 'glossary-term';
        span.textContent = m[0];
        span.dataset.def = TERMS[m[0].toLowerCase()] || '';
        frag.appendChild(span);
        last = re.lastIndex;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      if (frag.childNodes.length) tn.parentNode.replaceChild(frag, tn);
    });
  }

  function showTip(e) {
    const term = e.target.closest('.glossary-term');
    if (!term) return;
    createTooltip();
    tooltip.textContent = term.dataset.def;
    tooltip.classList.add('show');
    const r = term.getBoundingClientRect();
    tooltip.style.left = Math.min(r.left, window.innerWidth - 320) + 'px';
    tooltip.style.top = (r.bottom + 6) + 'px';
  }

  function hideTip() {
    if (tooltip) tooltip.classList.remove('show');
  }

  // Apply on content load
  const obs = new MutationObserver(() => {
    const ca = document.getElementById('content-area');
    if (ca) setTimeout(() => wrapTerms(ca), 400);
  });

  function init() {
    const ca = document.getElementById('content-area');
    if (ca) {
      obs.observe(ca, { childList: true });
      wrapTerms(ca);
    }
    document.addEventListener('mouseover', showTip);
    document.addEventListener('mouseout', e => {
      if (e.target.closest('.glossary-term')) hideTip();
    });
    // Touch support
    document.addEventListener('touchstart', e => {
      if (e.target.closest('.glossary-term')) showTip(e);
      else hideTip();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
