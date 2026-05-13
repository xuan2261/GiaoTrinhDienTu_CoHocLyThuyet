---
type: brainstorm
date: 2026-05-13
topic: layout-simulation-responsive
status: approved-recommendation
decision: "Huong B - noi rieng simulation, giu reading layout hien tai, chinh nhe topbar responsive"
---

# Brainstorm Layout Simulation Responsive

## Summary

Da review layout hien tai tu `README.md`, `index.html`, `css/style.css`, `docs/design-guidelines.md`, `docs/system-architecture.md`, va `layout_hientai.md`.

Ket luan: layout hien tai tot cho doc giao trinh, chua toi uu cho hoc tuong tac. Chot huong B: **noi rieng simulation, giu reading layout hien tai, chinh nhe topbar responsive**.

## Problem Statement

Giao trinh dang dung cung mot khung `content-area` cho:

- Doc text/math/figure dai.
- Tuong tac simulation canvas + controls + readouts.

Hai nhu cau nay khac nhau:

- Reading can noi dung hep de de doc.
- Simulation can them chieu ngang de canvas, control, readout khong bi chat.

Neu noi toan bo `content-area`, text bi qua dai. Neu giu nguyen, simulation van dung duoc nhung chua thoang.

## Requirements

| Muc | Yeu cau |
|---|---|
| Expected output | Design decision/report lam co so cho plan cai tien layout |
| Acceptance criteria | Co huong chot, scope ro, risks ro, validation ro |
| Scope | Brainstorm/report only; khong implement trong buoc nay |
| Constraints | Giu static `HTML/CSS/JS`, offline `file://`, giu shared `.sim-lab`, khong doi canvas logical size `760x440` |
| Touchpoints neu implement | `css/style.css`, `index.html` neu can topbar markup nho, `docs/design-guidelines.md`, Playwright visual tests |

## Current Layout Findings

| Area | Current state |
|---|---|
| Topbar | Fixed, `52px`, chua menu, brand, search, theme, font zoom, breadcrumb |
| Sidebar | Fixed desktop, off-canvas mobile, width clamp `250-320px` |
| Main | Offset theo sidebar va topbar |
| Content | `max-width: clamp(680px, 55vw, 900px)`, tot cho doc |
| Simulation | Nam trong content, canvas logical `760x440`, scale CSS |
| Responsive | Da co breakpoints `<=768`, `<=560`, `<=480`, `<=380` |

## Evaluated Approaches

| Approach | Mo ta | Pros | Cons | Verdict |
|---|---|---|---|---|
| A. Giu nguyen | Chi tai lieu hoa hien trang | It rui ro, khong ton cong | Khong giai quyet simulation chat | Rejected |
| B. Noi rieng simulation | Text giu max 900px, simulation co width rieng lon hon | Dung van de, tac dong nho, giu architecture | Can QA overflow/screenshot | Selected |
| C. Redesign shell | Lam lai topbar/sidebar/content/simulation | Co the dep hon | Rui ro cao, de pha QA/offline, overkill | Rejected |

## Final Recommendation

Chon **Approach B**.

Thiet ke muc tieu:

- Giu `content-area` hien tai cho text/math/figure.
- Cho `.sim-container` hoac wrapper simulation duoc phep rong hon text area.
- Giu canvas logical `760x440`; chi thay layout shell/available width.
- Giu `.sim-lab` shared-first, khong tao layout variant theo route.
- Chinh nhe topbar responsive: giam chong lan o tablet/mobile, uu tien menu + brand + search/theme.

## Proposed Design Direction

### Reading Layout

Khong doi mac dinh:

- `content-area`: `max-width: clamp(680px, 55vw, 900px)`.
- Paragraph, figure, math block giu nhip doc hien tai.
- Sidebar va topbar giu architecture.

### Simulation Layout

Neu implement, nen them mot co che nho:

- Simulation container co max width rieng, vi du gan muc `min(1120px, 100%)`.
- Center align theo main area.
- Khong lam rong text content xung quanh.
- Mobile van `max-width: 100%`, khong horizontal page scroll.

Can tranh:

- Khong fullscreen/mac dinh modal neu chua co nhu cau.
- Khong tach `.sim-lab` thanh nhieu shell theo route.
- Khong thay canvas coordinate system.

### Topbar Responsive

Nen tinh gon theo uu tien:

1. Menu button.
2. Brand ngan.
3. Search.
4. Theme.
5. Font zoom va breadcrumb co the an/sap lai o viewport hep.

Muc tieu la khong overlap o `768px` va `390px`.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Simulation width moi gay horizontal scroll | UX xau mobile/tablet | Playwright screenshot + overflow check |
| Ap dung selector qua rong lam text page bi keo dai | Giam kha nang doc | Scope chi vao `.sim-container` / `.sim-lab` |
| Topbar responsive an qua nhieu chuc nang | Mat discoverability | Chi an thu cap; giu search/theme de truy cap |
| Thay doi CSS pha visual gate | Regression simulation | Chay `npm run test:sim:visual-quality` va browser smoke |
| Nhoi them mode fullscreen | Tang complexity | Khong lam trong vong nay |

## Validation Criteria

Can dat neu chuyen sang plan/implementation:

- Text pages van de doc, khong bi keo rong qua muc.
- Simulation desktop rong hon hien tai, controls/readouts thoang hon.
- Khong horizontal page scroll o `1366px`, `768px`, `390px`.
- Topbar khong overlap o `768px` va `390px`.
- Canvas/readout/control van render dung cho route dai/nhieu control.
- `npm run test:sim:visual-quality` pass.
- Browser smoke voi it nhat 3 route dai dien: 1 Ch1, 1 Ch2, 1 Ch3.
- Screenshot evidence truoc/sau cho desktop/tablet/mobile.

## Suggested Implementation Scope For Future Plan

1. Audit screenshots baseline:
   - Home page.
   - One long text page.
   - One math-heavy page.
   - Three simulation routes Ch1/Ch2/Ch3.
2. Add scoped CSS for simulation max-width.
3. Adjust topbar responsive rules only where overlap occurs.
4. Run QA gates.
5. Update `docs/design-guidelines.md` and changelog if implementation lands.

## Decision

Approved direction:

> Huong B: noi rieng simulation, giu reading layout hien tai, chinh nhe topbar responsive.

No implementation done in this brainstorm session.

## Next Actions

- Neu muon lam tiep: tao `/ck:plan` tu report nay.
- Recommended planning mode: `/ck:plan --tdd`, vi day la UI layout refactor co nguy co regression visual/responsive.

## Unresolved Questions

- Simulation target max-width chinh xac nen la `1040px`, `1120px`, hay theo cong thuc phu thuoc viewport/main width.
- Co can them screenshot evidence vao `plans/visuals/` hay chi dung Playwright reports.
