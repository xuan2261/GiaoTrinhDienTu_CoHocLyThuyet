---
phase: 4
title: "Verification & Testing"
status: pending       
priority: P1          
effort: "2h"            
dependencies: [1, 2, 3]      
---

# Phase 4: Verification & Testing

## Overview
Xác nhận chất lượng, tính năng, và độ ổn định của toàn bộ 58+ routes mô phỏng sau khi thay đổi Rendering Engine và Interactions.

## Requirements
- **Functional**: Không phá vỡ bất kỳ kịch bản Tĩnh học, Động học, Động lực học nào đã có.
- **Non-functional**: 100% Tests hiện tại phải passing.

## Architecture
- Chạy hệ thống Test Scripts tự động (`npm run test:sim:*`).
- Thực hiện Visual Regression QA (kiểm thử thủ công và tự động) để đảm bảo UI hiển thị chính xác ở các theme.

## Related Code Files
- N/A (Run scripts)

## Implementation Steps
1. Chạy `npm run test:sim:unit`
2. Chạy `npm run test:sim:quality`
3. Chạy `npm run test:sim:semantic`
4. Chạy `npm run test:sim:renderer-contract`
5. Khởi động server nội bộ và test trực tiếp nghiệm thu từng bài học trong Chương 1, 2, 3 (Manual Verification).

## Success Criteria
- [ ] Tất cả commands test trong CI trả về thành công.
- [ ] Đạt chuẩn Visual Aesthetics mới, Dark Mode mượt mà.

## Verification & Testing
- *Visual Checklist*:
  - Chuyển theme Sáng/Tối.
  - Phóng to/Thu nhỏ font chữ.
  - Di chuyển nhanh các Handle.
  - Test trên giả lập thiết bị Mobile.

## Risk Assessment
- *Rủi ro*: Cập nhật có thể vô tình làm một route nào đó không khởi tạo được.
- *Giảm thiểu*: Chạy QA checklist toàn diện cho từng sub-chapter trước khi deploy.
