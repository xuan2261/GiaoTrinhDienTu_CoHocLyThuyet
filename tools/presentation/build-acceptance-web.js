'use strict';

const fs = require('fs');
const path = require('path');
const { meta, slides } = require('./acceptance-deck-content');

const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = path.join(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu');
const htmlEscape = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');
const relAsset = (asset, outDir) => path.relative(outDir, path.resolve(ROOT, asset)).replaceAll('\\', '/');
const stripTrailingWhitespace = content => content.replace(/[ \t]+$/gm, '');

function collectVisualItems(slide) {
  const items = [];
  for (const key of [
    'outcomes', 'chapters', 'steps', 'layers', 'conditions', 'decisionCards',
    'questions', 'rows', 'hashes', 'features', 'problems', 'solutions',
    'actions', 'metrics', 'criteria', 'evidence', 'boundaries', 'requirements',
    'checklist', 'statuses', 'scope', 'assessment', 'nodes', 'results',
    'quizExamples', 'failedRows', 'derivatives', 'cards',
  ]) {
    if (!slide[key]) continue;
    for (const value of slide[key]) {
      const parts = Array.isArray(value) ? value : [value];
      items.push((key === 'rows' || key === 'failedRows' ? parts.slice(0, 3) : parts).filter(Boolean).join(' · '));
    }
  }
  if (slide.notice) items.push(slide.notice);
  if (slide.samples) {
    for (const sample of slide.samples) items.push(`${sample.chapter} · ${sample.title} · ${sample.formula} · ${sample.check}`);
  }
  if (slide.sample) {
    items.push(`${slide.sample.chapter} · ${slide.sample.title} · ${slide.sample.formula}${slide.sample.magnitudeFormula ? ` · ${slide.sample.magnitudeFormula}` : ''} · ${slide.sample.check}`);
    if (slide.reviewBoundary) items.push(slide.reviewBoundary);
  }
  if (slide.gates) {
    for (const gate of slide.gates) items.push(gate.join(' · '));
  }
  if (slide.facts) items.push(...slide.facts);
  if (slide.limitations) items.push(...slide.limitations);
  if (slide.failureQualification) items.push(slide.failureQualification);
  if (slide.minuteText) items.push(slide.minuteText);
  return items;
}

function collectImages(slide) {
  if (slide.illustrations) return [
    ...(slide.image ? [{ src: slide.image, caption: slide.title, label: 'Ảnh giao diện minh họa' }] : []),
    ...slide.illustrations.map(illustration => ({ src: illustration.image, caption: illustration.label, label: 'Sơ đồ nguyên lý minh họa' })),
  ];
  if (slide.sample) return [
    { src: slide.diagram, caption: `${slide.sample.chapter} · sơ đồ nguyên lý` },
    { src: slide.sample.image, caption: `${slide.sample.route} · ảnh chụp khi mô phỏng đang chạy` },
  ];
  if (slide.samples) return slide.samples.map(sample => ({ src: sample.image, caption: `${sample.chapter} · ${sample.route}` }));
  if (slide.qrImage) return [{ src: slide.qrImage, caption: 'Mã QR trải nghiệm trực tuyến' }];
  if (slide.image) return [{ src: slide.image, caption: slide.title }];
  return [];
}

const text = value => htmlEscape(value);

function sourceNote(slide) {
  return `<p class="source-note"><strong>Nguồn kiểm tra:</strong> ${text(slide.sources.join(' · '))}</p>`;
}

function qualification(slide) {
  return slide.script?.[1] ? `<p class="qualification"><strong>Giới hạn diễn giải:</strong> ${text(slide.script[1])}</p>` : '';
}

function visualBody(slide) {
  switch (slide.type) {
    case 'methodology':
      return `<div class="visual methodology" aria-label="Phương pháp: năm bước và bốn nội dung đối chiếu">
        <ol class="methodology-flow" aria-label="Quy trình năm bước">${slide.nodes.map((node, index) => `<li class="methodology-node"><span class="step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${text(node)}</span>${index < slide.nodes.length - 1 ? '<span class="methodology-arrow" aria-hidden="true">→</span>' : ''}</li>`).join('')}</ol>
        <div class="methodology-cards">${slide.cards.map(card => `<section class="methodology-card"><h3>${text(card[0])}</h3><p>${text(card[1])}</p></section>`).join('')}</div>
        <aside class="methodology-notice" aria-label="Giới hạn trạng thái">${text(slide.notice)}</aside>
      </div>${qualification(slide)}${sourceNote(slide)}`;
    case 'problemSolution':
      return `<div class="visual paired" aria-label="Đối chiếu nhu cầu và cách đáp ứng">
        <div class="pair-head"><span>Nhu cầu quan sát được</span><span>Đáp ứng trong thiết kế</span></div>
        ${slide.problems.map((problem, index) => {
          const solution = slide.solutions[index];
          return `<div class="pair-row"><div class="pair-cell"><span class="step-number">${String(index + 1).padStart(2, '0')}</span><div><h3>${text(problem[0])}</h3><p>${text(problem[1])}</p></div></div><span class="pair-arrow" aria-hidden="true">→</span><div class="pair-cell answer"><div><h3>${text(solution[0])}</h3><p>${text(solution[1])}</p></div></div></div>`;
        }).join('')}
      </div>${qualification(slide)}${sourceNote(slide)}`;
    case 'journey':
      return `<div class="visual journey" aria-label="Vòng học năm bước">
        <div class="journey-flow">${slide.steps.map(step => `<div class="journey-node"><span class="step-number">${text(step[0])}</span><h3>${text(step[1])}</h3><p>${text(step[2])}</p></div>`).join('')}</div>
        <div class="return-link"><span aria-hidden="true">↶</span><span>Từ điều chỉnh quay lại nội dung để xem lại kiến thức liên quan</span></div>
      </div>${qualification(slide)}${sourceNote(slide)}`;
    case 'evidence': {
      const sourceLabels = ['Danh mục nội dung · nguồn DOCX', 'Bản đồ công thức · đặc tả mô phỏng', 'Ngân hàng câu hỏi · phản hồi', 'Ảnh, tài liệu · hồ sơ ký xác nhận'];
      return `<div class="visual evidence" aria-label="Bốn tuyến truy vết và số liệu phạm vi">
        <div class="trace-lines">${slide.evidence.map((entry, index) => `<div class="trace-row"><span class="step-number">${String(index + 1).padStart(2, '0')}</span><div><h3>${text(entry[0])}</h3><small>${text(sourceLabels[index])}</small></div><span class="trace-connector" aria-hidden="true">→</span><p>${text(entry[1])}</p></div>`).join('')}</div>
        <p>Mũi tên chỉ đường truy vết, không biểu thị thẩm định hoặc ký duyệt.</p>
        <div class="metrics-strip" aria-label="Số liệu phạm vi, không phải điểm chất lượng">${slide.metrics.map(metric => `<div class="metric"><strong>${text(metric[0])}</strong><span>${text(metric[1])}</span></div>`).join('')}</div>
      </div>${qualification(slide)}${sourceNote(slide)}`;
    }
    case 'validation':
      return `<div class="visual validation" aria-label="Bốn bước đối chiếu khoa học và giới hạn">
        <div class="validation-steps">${slide.layers.map(layer => `<div class="validation-step"><span class="step-number">${text(layer[0])}</span><div><h3>${text(layer[1])}</h3><p>${text(layer[2])}</p></div></div>`).join('')}</div>
        <aside class="validation-limits"><h3>Giới hạn không được suy rộng</h3><ul>${slide.limitations.map(limit => `<li>${text(limit)}</li>`).join('')}</ul></aside>
      </div>${qualification(slide)}${sourceNote(slide)}`;
    case 'gateDetails':
      return `<div class="visual academic-review" aria-label="Tình trạng hồ sơ và luồng xử lý đề xuất">
        <div class="review-statuses">${slide.rows.map(row => `<div class="review-status"><h3>${text(row[0])}</h3><strong>${text(row[1])}</strong><p>${text(row[2])}</p></div>`).join('')}</div>
        <div class="review-flow"><h3>Luồng xử lý hồ sơ đề xuất · chưa phải kết quả đã hoàn tất</h3>
          <div class="review-path"><span>Hồ sơ</span><span aria-hidden="true">→</span><span>Thẩm định</span><span aria-hidden="true">→</span><span>Đủ căn cứ?</span></div>
          <div class="review-branches"><p><strong>Có →</strong> Ghi nhận có thẩm quyền</p><p><strong>Chưa →</strong> Bổ sung / chỉnh sửa → thẩm định lại</p></div>
        </div>
      </div>${qualification(slide)}${sourceNote(slide)}`;
    default:
      return null;
  }
}

function slideArticle(slide, outDir) {
  const items = collectVisualItems(slide);
  const images = collectImages(slide);
  const visual = visualBody(slide);
  return `
    <article class="slide type-${htmlEscape(slide.type)}${slide.backup ? ' backup' : ''}" data-id="${slide.id}" data-title="${htmlEscape(slide.title)}" data-time="${htmlEscape(slide.time)}" data-backup="${slide.backup ? 'true' : 'false'}">
      <header><span>${slide.backup ? 'PHỤ LỤC' : 'BÁO CÁO KẾT QUẢ'}</span><b>${String(slide.id).padStart(2, '0')}</b></header>
      <h2 tabindex="-1">${htmlEscape(slide.title)}</h2>
      <p class="takeaway">${htmlEscape(slide.takeaway)}</p>
      <div class="body ${images.length ? 'has-image' : ''}${visual ? ' visual-body' : ''}">
        ${visual || (items.length ? `<ul class="${items.length > 6 ? 'compact' : ''}">${items.map(item => `<li>${htmlEscape(item)}</li>`).join('')}</ul>` : '')}
        ${images.length ? `<div class="images">${images.map(image => `<figure><img src="${htmlEscape(relAsset(image.src, outDir))}" alt="${htmlEscape(image.caption)}"><figcaption><strong>${htmlEscape(image.label || 'Ảnh minh họa')}:</strong> ${htmlEscape(image.caption)}</figcaption></figure>`).join('')}</div>` : ''}
      </div>
      <footer><span>Nguồn/truy vết: ${htmlEscape(slide.sourceId || '')}</span><span>${htmlEscape(slide.speaker)} · ${htmlEscape(slide.time)}</span></footer>
    </article>`;
}

function presentationHtml(outDir) {
  const releaseSlide = slides.find(slide => slide.releaseVersion || slide.packageSha256) || {};
  const mainSlides = slides.filter(slide => !slide.backup);
  const backupSlides = slides.filter(slide => slide.backup);
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="release-version" content="${htmlEscape(releaseSlide.releaseVersion || '')}"><meta name="package-sha256" content="${htmlEscape(releaseSlide.packageSha256 || '')}"><title>${htmlEscape(meta.title)}</title>
<style>
:root{--navy:#071b33;--blue:#1f3864;--gold:#c9963a;--paper:#f7f5ef;--ink:#202020;--line:#d7dde5}
*{box-sizing:border-box}body{margin:0;background:#111827;color:var(--ink);font-family:Arial,Helvetica,sans-serif}button{font:inherit}[hidden]{display:none!important}
.deck{display:grid;gap:32px;padding:32px}.section-heading{width:min(1280px,calc(100vw - 64px));margin:12px auto 0;color:white;font-family:Georgia,serif;font-size:28px;border-bottom:3px solid var(--gold);padding-bottom:10px}
.deck-controls{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;background:var(--navy);color:white;padding:9px 16px;box-shadow:0 4px 15px #0005}.deck-controls button{border:1px solid #f7dba7;border-radius:5px;background:var(--blue);color:white;padding:8px 12px;cursor:pointer}.deck-controls button:hover,.deck-controls button:focus-visible{background:#385782}.deck-controls button:focus-visible{outline:3px solid var(--gold);outline-offset:2px}.deck-controls button:disabled{opacity:.5;cursor:not-allowed}.deck-position{min-width:190px;text-align:center;font-size:14px;font-weight:700}
.slide{width:min(1280px,calc(100vw - 64px));min-height:720px;display:flex;flex-direction:column;margin:auto;background:var(--paper);padding:34px 56px 26px;box-shadow:0 16px 60px #0008;overflow:visible}.slide header,.slide footer{display:flex;justify-content:space-between;gap:14px;color:#59616b;font-weight:700;font-size:14px;letter-spacing:.04em}.slide header{border-bottom:3px solid var(--gold);padding-bottom:8px}.slide h2{font-family:Georgia,serif;color:var(--navy);font-size:clamp(27px,2.7vw,43px);margin:16px 0 10px}.slide h2:focus{outline:none}.takeaway{background:#e8edf4;color:var(--blue);font-size:clamp(17px,1.55vw,23px);font-weight:700;padding:11px 17px;margin:0 0 14px}.body{display:grid;align-items:start;min-width:0}.body.has-image{grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:22px}.body ul{font-size:clamp(16px,1.3vw,20px);line-height:1.3;margin:0;padding-left:23px}.body ul.compact{columns:2;column-gap:28px;font-size:clamp(14px,1.05vw,17px);line-height:1.24}.body li{margin:0 0 9px;break-inside:avoid}.images{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr));gap:12px;min-width:0}.images figure{min-width:0;margin:0;background:#fff;border:1px solid var(--line);padding:8px}.images img{display:block;width:100%;height:215px;object-fit:contain}.images figcaption{font-size:12px;color:#59616b;text-align:center;overflow-wrap:anywhere}.type-scientificSample .body.has-image{grid-template-columns:minmax(0,.72fr) minmax(0,1.55fr);gap:20px}.type-scientificSample .images{grid-template-columns:1fr 1.65fr}.type-scientificSample .images img{height:245px}.type-scientificSample .body ul{font-size:16px;line-height:1.28}.type-releaseGates .body ul{columns:2;font-size:14px;line-height:1.2}.type-releaseGates .takeaway{font-size:18px}.type-releaseGates h2{font-size:34px}.slide footer{margin-top:auto;padding-top:14px;overflow-wrap:anywhere}.backup{outline:5px solid #6b7280}.slide[data-id="1"],.slide[data-id="13"]{background:var(--navy);color:white}.slide[data-id="1"] h2,.slide[data-id="13"] h2{color:white;text-align:center;margin-top:70px}.slide[data-id="1"] .takeaway,.slide[data-id="13"] .takeaway{background:#1f3864;color:#f7dba7;text-align:center}.slide[data-id="1"] footer,.slide[data-id="13"] footer{color:#f7dba7}
.body{margin-bottom:16px;overflow-wrap:anywhere}
.body.visual-body{display:block}.visual h3{margin:0;color:var(--navy);font-size:17px}.visual p{margin:4px 0 0;font-size:14px;line-height:1.3}.step-number{flex:none;color:var(--gold);font-weight:800;font-size:20px}.qualification{margin:12px 0 0;padding:8px 12px;background:#fff5de;border-left:4px solid var(--gold);font-size:13px;line-height:1.3}.source-note{margin:9px 0 0;color:#4b5563;font-size:11px;line-height:1.35;overflow-wrap:anywhere}.paired{display:grid;gap:5px}.pair-head{display:grid;grid-template-columns:1fr 1fr;gap:38px;color:var(--blue);font-size:13px;font-weight:700;text-transform:uppercase}.pair-row{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr);align-items:stretch;gap:8px}.pair-cell{display:flex;gap:10px;align-items:center;min-width:0;background:white;border-left:4px solid #8ca7c8;padding:8px 12px}.pair-cell.answer{border-left-color:var(--gold)}.pair-arrow{align-self:center;text-align:center;color:var(--blue);font-size:20px;font-weight:700}
.journey-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:17px}.journey-node{position:relative;min-width:0;border-top:4px solid var(--gold);background:#fff;padding:9px 10px;min-height:132px}.journey-node:not(:last-child):after{content:'→';position:absolute;right:-16px;top:43%;font-size:18px;color:var(--blue)}.journey-node h3{margin-top:3px}.return-link{display:flex;align-items:center;gap:12px;margin:10px 0 0;padding:6px 12px;border:2px dashed var(--blue);border-radius:20px;color:var(--blue);font-size:13px;font-weight:700}.return-link span:first-child{font-size:22px;line-height:1}.type-journey .images{margin-top:8px;grid-template-columns:minmax(0,1fr)}.type-journey .images figure{display:flex;align-items:center;gap:16px}.type-journey .images img{width:min(190px,40%);height:92px}.type-journey .images figcaption{text-align:left}
.trace-lines{display:grid;grid-template-columns:1fr 1fr;gap:7px}.trace-row{display:grid;grid-template-columns:28px minmax(80px,.55fr) 20px minmax(0,1.45fr);align-items:center;gap:7px;background:#fff;border-left:4px solid var(--gold);padding:9px}.trace-row .step-number{font-size:15px}.trace-connector{color:var(--blue);font-weight:700}.trace-row h3{font-size:16px}.trace-row p{margin:0}.metrics-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:10px}.metric{min-width:0;background:var(--blue);color:white;padding:9px 12px}.metric strong{display:block;color:#f7dba7;font-size:21px}.metric span{font-size:12px;line-height:1.2}
.validation-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.validation-step{position:relative;display:flex;gap:8px;align-items:start;min-width:0;background:white;border-top:4px solid var(--gold);padding:12px 10px;min-height:117px}.validation-step:not(:last-child):after{content:'→';position:absolute;right:-15px;top:43%;color:var(--blue);font-size:18px}.validation-limits{margin-top:12px;padding:10px 14px;background:#fff5de;border-left:5px solid var(--gold)}.validation-limits h3{font-size:16px}.validation-limits ul{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:8px 0 0;padding-left:20px;font-size:13px;line-height:1.3}.validation-limits li{margin:0}
.type-cover .body.has-image{display:block}.type-cover .images{grid-template-columns:1.8fr repeat(3,minmax(0,1fr))}.type-cover .images img{height:170px}.type-cover .images figcaption{font-size:11px}.review-statuses{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.review-status{min-width:0;background:white;border-left:4px solid var(--gold);padding:9px 12px}.review-status strong{display:block;color:var(--blue);margin-top:4px;font-size:14px}.review-flow{margin-top:12px;padding:11px 13px;border:2px solid var(--blue);background:#eef2f7}.review-flow h3{font-size:16px}.review-path{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin-top:10px}.review-path span:nth-child(odd){background:white;border:1px solid var(--line);padding:7px 11px;font-weight:700;color:var(--navy)}.review-path span:nth-child(even){color:var(--blue);font-weight:700}.review-branches{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.review-branches p{background:white;padding:7px 9px;margin:0}
.methodology-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:22px;list-style:none;margin:0 0 18px;padding:0!important}.methodology-flow .methodology-node{position:relative;display:flex;align-items:center;gap:8px;min-width:0;margin:0;padding:12px 10px;min-height:68px;border:1px solid var(--blue);background:white;color:var(--navy);font-size:16px;font-weight:700;line-height:1.25}.methodology-node:last-child{background:var(--navy);color:white}.methodology-node .step-number{font-size:16px}.methodology-arrow{position:absolute;right:-21px;top:50%;transform:translateY(-50%);width:20px;text-align:center;color:var(--blue);font-size:20px}.methodology-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.methodology-card{min-width:0;background:white;border-left:4px solid var(--gold);padding:14px 16px;break-inside:avoid}.methodology-card h3{font-size:19px}.methodology-card p{margin-top:8px;font-size:16px;line-height:1.4}.methodology-notice{margin-top:16px;padding:10px 14px;border-left:4px solid var(--gold);background:#fff5de;color:var(--navy);font-size:15px;font-weight:700;line-height:1.35;break-inside:avoid}
body.presenting .section-heading{display:none}body.presenting .deck{padding-top:18px}body.presenting .slide{display:none}body.presenting .slide.is-current{display:flex}
@media(max-width:1100px){.slide{min-height:0;padding:26px 32px}.deck{gap:20px}.body.has-image,.type-scientificSample .body.has-image{grid-template-columns:1fr}.slide footer{margin-top:24px}.type-scientificSample .images img{height:auto;max-height:245px}}
@media(max-width:740px){.deck{padding:12px}.section-heading,.slide{width:100%}.section-heading{font-size:22px}.slide{padding:20px 16px}.slide h2{font-size:26px}.takeaway{font-size:17px}.body ul.compact,.type-releaseGates .body ul{columns:1}.images img{height:auto;max-height:240px}.pair-head{display:none}.pair-row{grid-template-columns:1fr;gap:3px}.pair-arrow{text-align:left;padding-left:18px;line-height:1}.journey-flow,.validation-steps{grid-template-columns:1fr}.journey-node,.validation-step{min-height:0}.journey-node:not(:last-child):after,.validation-step:not(:last-child):after{content:'↓';top:auto;bottom:-18px;right:50%;z-index:1}.journey-flow,.validation-steps{gap:19px}.trace-lines,.metrics-strip,.validation-limits ul{grid-template-columns:1fr 1fr}.trace-row{grid-template-columns:22px 1fr 18px 1.5fr}.type-journey .images img{width:min(140px,40%)}.slide footer{flex-wrap:wrap;font-size:12px}}
@media(max-width:440px){.trace-lines,.metrics-strip,.validation-limits ul{grid-template-columns:1fr}.trace-row{grid-template-columns:22px minmax(65px,.7fr) 16px minmax(0,1.3fr)}.trace-row h3{font-size:14px}.trace-row p{font-size:12px}.type-journey .images figure{display:block}.type-journey .images img{width:100%}.type-journey .images figcaption{text-align:center}}
@media(max-width:740px){body:not(.presenting) .deck-controls{position:static}.type-cover .images{grid-template-columns:repeat(2,minmax(0,1fr))}.type-cover .images img{height:auto;max-height:170px}.review-statuses,.review-branches{grid-template-columns:1fr}}
@media(max-width:440px){.type-cover .images{grid-template-columns:1fr}.review-path{display:grid;grid-template-columns:1fr}.review-path span:nth-child(even){padding-left:12px;transform:rotate(90deg);width:28px;text-align:center}}
@media(max-width:740px){.methodology-flow,.methodology-cards{grid-template-columns:1fr}.methodology-flow{gap:22px}.methodology-flow .methodology-node{min-height:0}.methodology-arrow{right:auto;left:50%;top:auto;bottom:-22px;transform:translateX(-50%) rotate(90deg);height:22px;line-height:22px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
@media print{body{background:white}.deck-controls{display:none!important}.deck{display:block;padding:0}.section-heading,body.presenting .section-heading{display:block;page-break-before:always;color:var(--navy)}.slide,body.presenting .slide,body.presenting .slide[hidden]{display:flex!important;width:100%;min-height:0;page-break-after:always;break-after:page;box-shadow:none;outline:none}.slide footer{margin-top:24px}}
@media print{.methodology-flow{grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}.methodology-flow .methodology-node{padding:8px;font-size:11pt}.methodology-arrow{left:auto;right:-18px;top:50%;bottom:auto;width:17px;transform:translateY(-50%)}.methodology-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.methodology-card{padding:10px 12px}.methodology-card h3{font-size:13pt}.methodology-card p{font-size:11pt;line-height:1.3}.methodology-notice{font-size:10pt}}
</style></head><body><nav class="deck-controls" aria-label="Điều khiển trình chiếu"><button type="button" id="deck-mode" aria-pressed="false">Bắt đầu trình chiếu</button><button type="button" id="deck-prev" hidden aria-label="Slide trước">← Trước</button><span class="deck-position" id="deck-position" role="status" aria-live="polite">${slides.length} slide · ${mainSlides.length} báo cáo + ${backupSlides.length} phụ lục</span><button type="button" id="deck-next" hidden aria-label="Slide tiếp theo">Tiếp →</button></nav><main class="deck"><h1 class="section-heading">Báo cáo kết quả xây dựng giáo trình điện tử</h1>${mainSlides.map(slide => slideArticle(slide, outDir)).join('')}<h1 class="section-heading">Phụ lục tra cứu khi Hội đồng yêu cầu</h1>${backupSlides.map(slide => slideArticle(slide, outDir)).join('')}</main>
<script>
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const modeButton = document.getElementById('deck-mode');
  const previousButton = document.getElementById('deck-prev');
  const nextButton = document.getElementById('deck-next');
  const position = document.getElementById('deck-position');
  let presenting = false;
  let index = 0;
  function render(focusSlide = false) {
    document.body.classList.toggle('presenting', presenting);
    modeButton.setAttribute('aria-pressed', String(presenting));
    modeButton.textContent = presenting ? 'Về tổng quan' : 'Bắt đầu trình chiếu';
    previousButton.hidden = nextButton.hidden = !presenting;
    previousButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1;
    position.textContent = presenting ? 'Slide ' + String(index + 1).padStart(2, '0') + '/' + slides.length + ' · ' + slides[index].dataset.title : '${slides.length} slide · ${mainSlides.length} báo cáo + ${backupSlides.length} phụ lục';
    slides.forEach((slide, slideIndex) => {
      slide.hidden = presenting && slideIndex !== index;
      slide.classList.toggle('is-current', presenting && slideIndex === index);
    });
    if (focusSlide && presenting) slides[index].querySelector('h2').focus({ preventScroll: true });
    if (presenting) window.scrollTo(0, 0);
  }
  modeButton.addEventListener('click', () => { presenting = !presenting; render(presenting); });
  previousButton.addEventListener('click', () => { if (index > 0) { index--; render(true); } });
  nextButton.addEventListener('click', () => { if (index < slides.length - 1) { index++; render(true); } });
  document.addEventListener('keydown', event => {
    if (!presenting || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable], [role="textbox"]')) return;
    if (event.key === 'Escape') { event.preventDefault(); presenting = false; render(); modeButton.focus(); return; }
    if (event.target.closest('button, a, summary')) return;
    const next = event.key === 'ArrowRight' ? Math.min(index + 1, slides.length - 1)
      : event.key === 'ArrowLeft' ? Math.max(index - 1, 0)
      : event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    if (next !== index) { index = next; render(true); }
  });
})();
</script></body></html>`;
}

function handoutHtml() {
  const releaseSlide = slides.find(slide => slide.releaseVersion || slide.packageSha256) || {};
  const mainSlides = slides.filter(slide => !slide.backup);
  const backupSlides = slides.filter(slide => slide.backup);
  const cards = list => list.map(slide => {
    const items = collectVisualItems(slide);
    return `<section class="card${slide.backup ? ' appendix' : ''}" data-id="${slide.id}"><h2>SLIDE ${String(slide.id).padStart(2, '0')} · ${htmlEscape(slide.title)}</h2><p><b>${htmlEscape(slide.takeaway)}</b></p>${items.length ? `<ul>${items.map(item => `<li>${htmlEscape(item)}</li>`).join('')}</ul>` : ''}<p class="source">${htmlEscape(slide.sourceId || '')} · ${htmlEscape(slide.speaker)} · ${htmlEscape(slide.time)}</p><div class="notes">Ghi chú chuyên môn:</div></section>`;
  }).join('');
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>HỒ SƠ PHÁT TAY · ${htmlEscape(meta.title)}</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#202020;max-width:1100px;margin:0 auto;padding:32px}h1,h2{font-family:Georgia,serif;color:#071b33}header{border-bottom:4px solid #c9963a;padding-bottom:16px}.meta{display:flex;justify-content:space-between;font-weight:700;color:#1f3864}.summary{background:#eef2f7;border-left:6px solid #c9963a;padding:14px 18px;margin:20px 0;font-size:18px}.section-title{margin-top:30px;border-bottom:2px solid #c9963a;padding-bottom:8px}.cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}.card{border:1px solid #d7dde5;padding:14px;break-inside:avoid}.card.appendix{border-left:5px solid #6b7280}.card h2{font-size:18px;margin:0 0 7px}.card p{margin:5px 0}.card ul{margin:7px 0 5px;padding-left:19px;font-size:13px;line-height:1.3}.card li{margin-bottom:4px}.source{font-size:11px;color:#59616b}.notes{height:64px;border:1px dashed #aab2bd;margin-top:10px;padding:7px;color:#7a828c}@media print{body{padding:10mm}.card{page-break-inside:avoid}.cards{gap:5mm}.notes{height:24mm}.section-title.appendix{page-break-before:always}}
</style></head><body>
<header><p>BÁO CÁO KẾT QUẢ XÂY DỰNG GIÁO TRÌNH ĐIỆN TỬ</p><h1>TÓM TẮT KẾT QUẢ & TÀI LIỆU PHÁT TAY</h1><div class="meta"><span>${htmlEscape(meta.title)}</span><span>${meta.totalTime} + Dự phòng ${meta.bufferTime}</span></div></header>
<section class="summary"><b>ĐỀ NGHỊ:</b> ${htmlEscape(meta.request)}<br>Đề nghị Hội đồng ghi nhận việc đã xây dựng hiện vật và cho ý kiến hoàn thiện; không đề nghị chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành.</section>
<h2 class="section-title">${mainSlides.length} slide báo cáo kết quả</h2><main class="cards">${cards(mainSlides)}</main>
<h2 class="section-title appendix">${backupSlides.length} slide phụ lục tra cứu</h2><section class="cards">${cards(backupSlides)}</section>
<footer><h2>Ý KIẾN GÓP Ý CỦA HỘI ĐỒNG</h2><div class="notes">Nhận xét về kết quả, giá trị khoa học–sư phạm và nội dung cần hoàn thiện:</div></footer>
</body></html>`;
}

function buildWebArtifacts(outDir = OUT_DIR) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'presentation-slides.html'), stripTrailingWhitespace(presentationHtml(outDir)), 'utf8');
  fs.writeFileSync(path.join(outDir, 'handout-in-an-hoi-dong.html'), stripTrailingWhitespace(handoutHtml()), 'utf8');
}

if (require.main === module) buildWebArtifacts();

module.exports = { buildWebArtifacts, collectVisualItems };
