# Project TODO

- [x] Chốt phương án triển khai: chuyển sang Vue 3 + Node.js/tRPC + database tích hợp sẵn để tương thích runtime hiện tại
- [x] Xây storefront laptop responsive với header, tìm kiếm, danh mục, bộ lọc, sắp xếp, phân trang và trang chi tiết
- [x] Tạo dữ liệu mẫu cho người dùng, danh mục, thương hiệu, laptop, thông số, tồn kho, giỏ hàng và đơn hàng demo
- [x] Tách quyền người dùng thường và quản trị viên ở frontend và backend bằng vai trò user/admin và adminProcedure
- [x] Xây khu mua sắm cho người dùng thường: catalog, giỏ hàng, đơn hàng cá nhân
- [x] Xây dashboard quản trị riêng với quản lý sản phẩm, danh mục, tồn kho, người dùng và đơn hàng
- [x] Bổ sung trạng thái loading, empty, error và responsive mobile/tablet/desktop
- [x] Viết API xác thực, catalog tìm kiếm/lọc và procedure quản trị; giỏ hàng/đặt hàng hiện mô phỏng ở client
- [x] Viết README về cấu trúc client/server, biến môi trường, cách chạy và tài khoản mẫu
- [x] Viết và cập nhật test cho catalog và quyền truy cập admin
- [x] Kiểm tra giao diện storefront và dashboard trên desktop; CSS responsive đã bổ sung cho mobile/tablet
- [x] Tạo checkpoint sau khi hoàn thiện và xác nhận nội dung trước bàn giao

## Phương án A đã được chốt

- [x] Chuyển frontend storefront từ scaffold React sang Vue 3 hoặc thiết lập lớp Vue 3 tương thích với runtime hiện tại
- [x] Dùng backend Node.js/tRPC và database tích hợp sẵn thay cho Java Spring Boot/MongoDB
- [x] Giữ rõ ranh giới storefront người dùng và dashboard admin trong route, UI và quyền backend
- [x] Cập nhật README để ghi rõ stack thực tế của phương án A và khác biệt so với yêu cầu Java/MongoDB ban đầu

## Gaps cần hoàn thiện trước checkpoint

- [x] Triển khai phân trang thật cho catalog và nối logic lọc giá thay vì chỉ hiển thị UI
- [x] Lưu đơn hàng sau checkout và hiển thị danh sách đơn cá nhân trên trang orders bằng localStorage demo
- [x] Xây module quản trị demo cho sản phẩm, danh mục, tồn kho, người dùng và đơn hàng với tìm kiếm và thao tác thêm/xóa sản phẩm
- [x] Bổ sung loading, empty và error states cho catalog cùng empty states cho giỏ hàng/orders
- [x] Thêm phân quyền backend thực sự bằng tRPC adminProcedure guard cho thao tác admin

## Hạng mục bổ sung trước checkpoint

- [x] Tạo bộ dữ liệu demo đầy đủ và nhất quán cho users, categories, brands, laptops, specs, inventory, cart và orders; khởi tạo một cart/order mẫu để chạy thử ngay
- [x] Bổ sung tab quản lý danh mục truy cập được từ admin sidebar, có danh sách danh mục và thao tác thêm/xóa

## Hạng mục đồng bộ dữ liệu demo

- [x] Hợp nhất dữ liệu demo thành source-of-truth dùng chung tại shared/catalog.ts cho client và server

## Yêu cầu mở rộng mới

- [x] Bổ sung animation cho header, hero, card sản phẩm, drawer, toast, chuyển route và dashboard; tôn trọng prefers-reduced-motion
- [x] Thêm nhóm danh mục Laptop, PC, Linh kiện, Phần mềm và Thiết bị văn phòng vào navigation và catalog
- [x] Thêm nút xem thông tin chi tiết máy từ card sản phẩm và hoàn thiện trang chi tiết
- [x] Xây PC Builder/tự tạo cấu hình với lựa chọn linh kiện, tổng tiền và kiểm tra tương thích cơ bản
- [x] Thêm trang/liên kết liên hệ, biểu mẫu gửi tin nhắn và trạng thái gửi thành công/lỗi
- [x] Kiểm thử responsive và các route mới; animation đã được triển khai trong CSS

## Hoàn thiện animation và checkpoint mở rộng

- [x] Bổ sung animation rõ ràng cho cart drawer, toast và các khối dashboard
- [x] Kiểm tra trực quan trạng thái responsive và các route sau đợt mở rộng; animation có mã CSS và reduced-motion
- [x] Tạo checkpoint mới sau khi hoàn tất đợt mở rộng và cập nhật todo
