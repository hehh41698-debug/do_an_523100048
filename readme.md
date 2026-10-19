# NEXA Laptop Store

> **Công cụ mạnh. Ý tưởng rộng.**
>
> NEXA Laptop Store là website thương mại điện tử chuyên về laptop và thiết bị công nghệ. Dự án tập trung vào một trải nghiệm mua sắm rõ ràng, hiện đại và có khả năng mở rộng: người dùng có thể tìm sản phẩm theo nhu cầu, đọc thông số, xây dựng cấu hình PC, quản lý giỏ hàng và theo dõi đơn hàng; quản trị viên có một không gian riêng để theo dõi sản phẩm, tồn kho, đơn hàng và người dùng.

## 1. Tổng quan dự án

NEXA được phát triển theo hướng storefront kết hợp khu vực quản trị. Giao diện sử dụng nhận diện riêng với nền sáng, chữ navy và điểm nhấn electric blue. Bố cục ưu tiên khả năng đọc thông số kỹ thuật, thao tác nhanh trên máy tính và khả năng sử dụng tốt trên màn hình nhỏ.

Dự án hiện đang ở **phiên bản demo có thể chạy được**. Catalog mẫu được tổ chức trong nguồn dữ liệu dùng chung. Giỏ hàng, đơn hàng và yêu thích trên giao diện vẫn lưu localStorage để kiểm tra nhanh; đồng thời schema MySQL, migration và tRPC favorites API đã được bổ sung làm nền tảng chuyển sang dữ liệu thật. Form đăng nhập hiện là mô phỏng giao diện, không được xem là cơ chế xác thực production.

## 2. Chức năng hiện có

### Khu vực khách hàng

+ Xem trang chủ, danh mục sản phẩm và sản phẩm nổi bật.
+ Tìm kiếm theo tên, thương hiệu hoặc cấu hình.
+ Trang chủ hiển thị sản phẩm theo từng khu vực thương hiệu; trang danh mục giữ công cụ sắp xếp và nhóm sản phẩm nhưng đã bỏ sidebar filter chiếm diện tích.
+ Sắp xếp theo mức độ nổi bật, giá thấp, giá cao hoặc đánh giá.
+ Mở trang chi tiết để xem giá, hình ảnh, cấu hình và thông tin bảo hành.
+ Thêm sản phẩm vào giỏ hàng, thay đổi số lượng và tạo đơn hàng demo.
+ Theo dõi lịch sử đơn hàng tại route `/orders`.
+ Sử dụng PC Builder để chọn CPU, GPU, RAM, SSD, ngân sách và nhận cảnh báo tương thích cơ bản.
+ Gửi yêu cầu tư vấn hoặc tin nhắn qua khu vực liên hệ.
+ Quản lý biến thể phần cứng theo SKU, CPU, GPU, RAM, SSD, màu sắc và tồn kho.
+ Giỏ hàng nghiệp vụ có kiểm tra sản phẩm, cấu hình, số lượng và giới hạn tồn kho trước khi thêm hoặc cập nhật.
+ Checkout tách rõ tạm tính, phí vận chuyển, giảm giá, phương thức thanh toán và trạng thái đơn.
+ Hỗ trợ vòng đời đơn hàng từ chờ xác nhận, đóng gói, giao hàng, đã giao đến hủy.
+ Đánh giá sản phẩm đi qua trạng thái chờ duyệt trước khi hiển thị công khai.
+ Hero banner có autoplay 5 giây, nút chuyển slide, hiệu ứng floating/parallax nhẹ và CTA chuyển màu khi hover.
+ Category card dùng ảnh sản phẩm thật, overlay khi hover, nút khám phá và liên kết đến nhóm Laptop, PC, Linh kiện, Phần mềm hoặc Thiết bị văn phòng.
+ Trang chi tiết có gallery thumbnail, bảng CPU, RAM, ổ cứng, GPU, màn hình, pin và trọng lượng.
+ Checkout có COD, chuyển khoản VietQR mô phỏng theo tổng tiền, MoMo/ZaloPay mô phỏng, mã giảm giá `NEXA10` và thông báo mã đơn sau khi đặt hàng.
### Khu vực quản trị

Khu vực `/admin` được tách riêng khỏi storefront bằng layout quản trị. Các nhóm chức năng hiện có gồm tổng quan, sản phẩm, danh mục, thương hiệu, tồn kho, đơn hàng, hộp thư liên hệ, người dùng, báo cáo và thông báo.

Backend đã có `adminProcedure` để kiểm tra `ctx.user.role`. Người dùng không có vai trò quản trị sẽ không được phép gọi các procedure dành riêng cho admin. Vai trò demo không còn được chuyển trực tiếp từ menu; storefront dẫn tới `/admin/login`, còn dashboard chỉ mở sau khi đăng nhập admin demo hợp lệ.

### Logic thương mại điện tử được chuẩn hóa theo mô hình ZAVY

ZAVY được dùng làm tài liệu tham khảo về cách tách controller/model cho sản phẩm, biến thể, giỏ hàng, đơn hàng, hóa đơn, đánh giá và liên hệ. NEXA không sao chép PHP hoặc giao diện ZAVY mà chuyển các nghiệp vụ đó sang Node.js, tRPC, Drizzle và mô hình sản phẩm máy tính.

+ Sản phẩm máy tính có thể có nhiều cấu hình, vì vậy NEXA dùng `product_variants` thay cho size/màu của sản phẩm thời trang. Mỗi biến thể có SKU, CPU, GPU, RAM, storage, điều chỉnh giá và tồn kho riêng.
+ Giỏ hàng thuộc về user và có các dòng hàng theo `productId` và `variantId`. Khi thêm hoặc tăng số lượng, backend kiểm tra cấu hình có hoạt động không và không cho vượt tồn kho.
+ Checkout chỉ tiếp nhận các dòng hàng thuộc giỏ của chính user. Đơn hàng lưu snapshot tên sản phẩm, biến thể, SKU, giá và số lượng để dữ liệu lịch sử không bị thay đổi khi catalog cập nhật.
+ Hóa đơn tách khỏi đơn hàng để quản lý COD, chuyển khoản, VNPay, MoMo, trạng thái chưa thanh toán, chờ xử lý, đã thanh toán và hoàn tiền.
+ Review mặc định ở trạng thái `pending`; chỉ review đã được duyệt mới được hiển thị công khai.
+ Tin nhắn liên hệ có người gửi, email, chủ đề, nội dung và trạng thái xử lý để Admin tiếp nhận như một yêu cầu hỗ trợ thật.

### Cập nhật theo prompt giao diện và vận hành mới

Homepage đã chuyển từ một hero tĩnh sang slider tự động với ba slide sản phẩm, hiệu ứng ảnh lơ lửng và chỉ báo slide. Logo NEXA hiện dùng biểu tượng sói xanh dạng SVG inline để không phụ thuộc file logo bên ngoài, đồng thời giữ chữ NEXA làm tên thương hiệu. Các category card có ảnh thật, lớp overlay, hiệu ứng scale và CTA khám phá.

Khu vực sản phẩm nổi bật trên trang chủ được chia theo thương hiệu. Mỗi hàng có tiêu đề thương hiệu, nút xem tất cả và tối đa bốn sản phẩm. Trang `/laptops` vẫn phục vụ danh mục tổng hợp nhưng không còn sidebar filter bên trái; người dùng dùng nhóm điều hướng và sắp xếp để giảm độ rối trên màn hình nhỏ.

Checkout đã tách thành một bước riêng thay vì tạo đơn ngay trong drawer. Người dùng nhập người nhận, số điện thoại, địa chỉ, mã giảm giá và phương thức thanh toán. Tổng tiền cập nhật tức thời gồm tiền hàng, phí vận chuyển và giảm giá. VietQR, MoMo và ZaloPay hiện là mô phỏng giao diện; khi triển khai thật cần thay bằng API thanh toán có chữ ký và webhook đối soát.

Order tracking có timeline bốn bước ở trang người dùng. Socket.io đã được gắn vào HTTP server; Admin có thể phát sự kiện đổi trạng thái, các client đang mở nhận `order:updated` và cập nhật mà không cần F5. Procedure production `orders.updateStatus` vẫn yêu cầu `adminProcedure`; sự kiện demo từ client cần được khóa thêm bằng session Admin khi đưa lên internet.

Hộp thư liên hệ đã có trong Admin với danh sách người gửi, chủ đề, nội dung, trạng thái chưa xem/đã xem/đã xử lý và thao tác phản hồi. Module thương hiệu độc lập cũng được thêm để dữ liệu sản phẩm có quan hệ logic Category → Brand → Product trong giao diện quản trị.

### Bản sửa luồng tồn kho, phản hồi, đơn hàng và thanh toán

Tồn kho trong Dashboard Admin chỉ còn ba cột Sản phẩm, SKU và Tồn kho. Ô số lượng tồn kho có thể chỉnh trực tiếp; mỗi thay đổi phát sự kiện `inventory:updated` qua Socket.io để các màn hình đang mở cập nhật mà không cần tải lại.

Hộp thư liên hệ hỗ trợ textarea phản hồi trực tiếp. Tin nhắn User được phát qua `contact:message`, phản hồi Admin qua `contact:reply`; cả hai phía lưu lịch sử hội thoại local cho bản demo và đồng bộ realtime giữa các client. Khi dùng database thật, các trường `adminReply`, `repliedBy` và `repliedAt` được lưu trong `contact_messages`.

Nút “Xem chi tiết” trong “Đơn hàng của bạn” mở modal hóa đơn đầy đủ gồm mã đơn, ngày đặt, trạng thái giao hàng, trạng thái thanh toán, số hóa đơn, danh sách sản phẩm, số lượng, đơn giá, tạm tính, phí vận chuyển, giảm giá, tổng thanh toán, người nhận, địa chỉ và phương thức thanh toán.

Luồng thanh toán được tách thành bước checkout và bước hiển thị hóa đơn. Đơn mới lưu `subtotal`, `shippingFee`, `discount`, `tax`, `total`, `paymentMethod`, `paymentStatus` và `invoiceNumber`. Admin có thể cập nhật trạng thái `unpaid`, `pending`, `paid`, `failed` hoặc `refunded`; sự kiện `payment:updated` đồng bộ trạng thái cho User. VietQR, MoMo và ZaloPay hiện là giao diện mô phỏng, cần thay bằng cổng thanh toán có webhook khi triển khai production.

### Kiểm thử nhanh các luồng mới

Mở `/admin/login` bằng tài khoản demo, vào Tồn kho và thay một số lượng: bảng chỉ hiển thị Sản phẩm, SKU, Tồn kho; mở thêm một client khác để kiểm tra số lượng cập nhật qua Socket.io. Vào Hộp thư, nhập phản hồi rồi chọn Gửi phản hồi; ở màn hình User mở Liên hệ để thấy nội dung trao đổi. Vào Đơn hàng của bạn, bấm Xem chi tiết để kiểm tra modal hóa đơn. Trong Admin mở Đơn hàng, đổi trạng thái Thanh toán và quan sát thông báo đồng bộ ở User.

### Luồng tài khoản và yêu thích sau đợt hiệu chỉnh

+ User dùng `/login` để đăng nhập, `/register` để tạo tài khoản và `/my-favorites` để xem sản phẩm đã lưu.
+ Admin dùng riêng `/admin/login`; không có form đăng ký admin công khai. Route `/admin/*` tự chuyển về `/admin/login` nếu chưa có trạng thái admin.
+ Admin demo của giao diện là `admin@nexa.store` với mật khẩu `admin123!`; thông tin này chỉ phục vụ trình diễn local và phải được thay bằng seed an toàn khi triển khai thật.
+ Nút tim trên catalog cập nhật optimistic theo trạng thái localStorage. Backend đã có `favorites.list`, `favorites.check`, `favorites.toggle` và `favorites.remove`, mỗi procedure đều dùng `protectedProcedure` và `ctx.user.id` để kiểm tra ownership.
+ Database đã có các bảng `password_reset_tokens`, `login_logs`, `admin_audit_logs`, `favorite_collections` và `favorites`, cùng các trường trạng thái đăng nhập mở rộng trên `users`.

## 3. Công nghệ và công cụ đang sử dụng

### Bổ sung catalog và tài nguyên ảnh

Catalog hiện có 53 sản phẩm, phân bổ không đều theo năm nhóm Laptop, PC, Linh kiện, Phần mềm và Thiết bị văn phòng. Mỗi sản phẩm có tên, giá, mô tả ngắn, thương hiệu, nhóm, danh mục, thông số, ảnh đại diện, tồn kho và trạng thái còn hàng/hết hàng. Storefront giữ dạng lưới phân trang để không phải render toàn bộ danh sách trong một lần.

Ảnh demo được lưu bằng đường dẫn tương đối trong `shared/catalog.ts`. Cấu trúc tài nguyên là:

```text
client/public/assets/
└── images/
    ├── banners/       # banner sự kiện và khuyến mãi
    └── products/      # ảnh đại diện sản phẩm
```

Trong mã nguồn catalog, đường dẫn có dạng `assets/images/products/product-01.svg`. Hàm `resolveAsset()` chỉ thêm dấu `/` khi trình duyệt cần phục vụ file từ thư mục public; vì vậy khi tải nguyên folder sang máy khác hoặc hosting, ảnh không phụ thuộc `C:/`, `localhost` hay URL ngoài. Ảnh sản phẩm trong lưới dùng `loading="lazy"`, còn banner đầu tiên được ưu tiên tải để giữ tốc độ hiển thị trang chủ.

Khu vực đầu trang chủ có năm banner sự kiện dạng slider tự động, có chỉ báo chuyển slide, tiêu đề, mô tả ngắn và CTA. Các file SVG nhẹ giúp bản demo không bị nặng khi tải catalog trên máy yếu.

### Tài khoản demo và hộp thư

Tài khoản User tạm để kiểm tra giao diện là `user@demo.com` với mật khẩu `123456`, tên hiển thị `Người Dùng Demo` và role `user`. Tài khoản Admin demo vẫn là `admin@nexa.store` với mật khẩu `admin123!`. Đây chỉ là dữ liệu trình diễn local, cần thay bằng cơ chế hash mật khẩu và seed an toàn trước khi triển khai thật.

Hệ thống liên hệ hiện có form gửi tin, hộp “Tin nhắn của tôi”, badge đỏ trên icon Tin nhắn, popup toast khi Admin gửi phản hồi, đánh dấu đã đọc khi User mở hộp thư và Socket.io cho cập nhật realtime. Database có thêm bảng `messages` gồm `conversationId`, `senderId`, `receiverId`, `content`, `isRead` và `createdAt`; backend cung cấp `messages.mine`, `messages.send`, `messages.markRead` và `messages.adminList`. Bảng `contact_messages` vẫn giữ vai trò lưu yêu cầu hỗ trợ tổng quát và bản tóm tắt phản hồi.

| Nhóm | Công nghệ hoặc công cụ | Vai trò trong dự án |
| --- | --- | --- |
| Giao diện | Vue 3, Vite, TypeScript | Xây dựng storefront, catalog, PC Builder và các màn hình tương tác |
| Styling | CSS, Tailwind CSS, responsive layout | Tạo nhận diện NEXA, bố cục responsive và animation |
| Realtime | Socket.io, Socket.io Client | Cập nhật trạng thái đơn hàng và tín hiệu thay đổi giữa Admin/User |
| Biểu tượng | Lucide | Hiển thị icon cho điều hướng và thao tác người dùng |
| Backend | Node.js | Chạy server và xử lý nghiệp vụ phía máy chủ |
| API | tRPC 11 | Kết nối frontend và backend với contract có kiểu dữ liệu |
| Dữ liệu demo | `shared/catalog.ts` | Catalog mẫu dùng chung giữa client và server |
| Commerce schema | `product_variants`, `carts`, `cart_items`, `orders`, `order_items`, `invoices` | Mô hình cấu hình, giỏ hàng, checkout, hóa đơn và tồn kho |
| Customer care | `product_reviews`, `contact_messages` | Review chờ duyệt và tin nhắn hỗ trợ |
| Cơ sở dữ liệu | Drizzle ORM, MySQL | Cấu trúc sẵn sàng cho dữ liệu production và migration |
| Lưu trữ demo | `localStorage` | Lưu giỏ hàng, trạng thái đơn, yêu thích và trạng thái auth mô phỏng trong bản demo |
| Kiểm thử | Vitest | Kiểm tra procedure xác thực, catalog và quyền admin |
| Quản lý gói | pnpm | Cài dependency và chạy các script của dự án |
| IDE | Visual Studio Code | Môi trường chỉnh sửa, chạy terminal và quản lý mã nguồn |
| Kiểm tra kiểu | TypeScript compiler | Phát hiện lỗi kiểu qua lệnh `pnpm run check` |
| Triển khai | WebDev runtime, Dockerfile | Chạy preview/server và hỗ trợ đóng gói môi trường triển khai |

## 4. Cách thức hệ thống đang vận hành

### Nguồn dữ liệu dùng chung

`shared/catalog.ts` là source of truth của bản demo. Frontend và backend cùng sử dụng cấu trúc sản phẩm, danh mục và người dùng mẫu nhằm hạn chế tình trạng giao diện hiển thị khác với dữ liệu API.

### Luồng tìm kiếm sản phẩm

Người dùng nhập từ khóa hoặc chọn bộ lọc trên storefront. Frontend gửi điều kiện lọc đến procedure catalog. Backend xử lý nhóm sản phẩm, thương hiệu, giá và trạng thái hàng rồi trả về danh sách để giao diện hiển thị theo dạng thẻ và phân trang.

### Luồng giỏ hàng và đơn hàng

Backend đã có các procedure `cart.list`, `cart.add`, `cart.update`, `cart.remove`, `orders.mine` và `orders.create`. Khi gọi qua tài khoản đã xác thực, hệ thống xác nhận user ownership, kiểm tra biến thể và tồn kho, tính phí vận chuyển miễn phí từ 5.000.000 ₫, tạo snapshot order items, tạo invoice và xóa các dòng đã đặt khỏi giỏ. Storefront hiện vẫn giữ localStorage cho bản demo trực quan; khi nối auth thật, UI cần chuyển các thao tác này sang tRPC để dữ liệu client và database đồng nhất.

### Luồng biến thể và tồn kho

`catalog.variants` trả về các cấu hình đang hoạt động của sản phẩm. Nếu database chưa có biến thể seed, procedure trả về một cấu hình tiêu chuẩn từ catalog demo để giao diện không bị trống. Khi thêm sản phẩm, backend dùng stock của biến thể nếu có, nếu không dùng stock cấp sản phẩm. Đây là quy tắc phù hợp với laptop/PC, nơi cùng một mẫu máy có thể khác RAM, SSD, GPU hoặc màu.

### Luồng đánh giá và liên hệ

Khách có thể xem review đã được publish qua `reviews.list`; user đã xác thực gửi review qua `reviews.submit`, review mới được lưu ở trạng thái pending. Form liên hệ đi qua `contact.send`, lưu họ tên, email, chủ đề và nội dung để Admin xử lý theo các trạng thái new, in_progress và resolved.

### Luồng realtime đơn hàng

Server khởi tạo Socket.io trên cùng HTTP server với tRPC. Client Vue kết nối qua `/socket.io`, đăng ký room `orders` và lắng nghe sự kiện `order:updated`. Khi procedure `orders.updateStatus` cập nhật thành công, server phát mã đơn, trạng thái mới và thời điểm cập nhật tới các client. Bản demo còn có sự kiện relay phục vụ thao tác trong dashboard local; production phải kiểm tra session và quyền Admin ở tầng socket trước khi cho phát sự kiện.

### Luồng phân quyền

Tài khoản demo được phân thành `user` và `admin`. Các procedure công khai phục vụ catalog; các procedure quản trị yêu cầu xác thực và vai trò admin. Cơ chế hiện tại phù hợp cho demo và kiểm thử. Khi đưa vào production cần thay bằng hệ thống xác thực, session và phân quyền hoàn chỉnh.

### Luồng PC Builder

Người dùng chọn linh kiện theo từng nhóm. Hệ thống kiểm tra các điều kiện tương thích cơ bản như socket, chuẩn RAM, công suất nguồn và ngân sách. Kết quả có thể được thêm vào giỏ hoặc gửi yêu cầu tư vấn. Các quy tắc nâng cao như kích thước case, số cổng và khả năng tản nhiệt có thể bổ sung sau.

## 5. Cây cấu trúc tạm thời

Cấu trúc dưới đây phản ánh cách dự án đang được tổ chức. Một số file `.tsx` thuộc scaffold và lớp tích hợp WebDev có sẵn; các file Vue, CSS và dữ liệu dùng chung phục vụ phần storefront NEXA.

```text
nexa-laptop-store/
├── client/
│   ├── index.html                 # HTML entry của frontend
│   └── src/
│       ├── App.vue                # Khung giao diện Vue của storefront
│       ├── App.tsx                # Shell/integration có sẵn của scaffold
│       ├── main.ts                # Entry Vue
│       ├── main.tsx               # Entry scaffold React/TSX
│       ├── index.css              # Design tokens, layout và animation
│       ├── components/            # Component dùng lại và UI primitives
│       ├── contexts/              # Context giao diện và theme
│       ├── hooks/                 # Hook responsive, persistence và tiện ích
│       ├── lib/
│       │   ├── trpc.ts            # Kết nối client với tRPC
│       │   └── utils.ts            # Hàm tiện ích cho UI
│       └── pages/                 # Các trang và màn hình cấp route
│
├── server/
│   ├── _core/                     # Hạ tầng server, auth, Vite và runtime WebDev
│   ├── db.ts                      # Helper truy vấn database
│   ├── routers.ts                 # Router tRPC và procedure nghiệp vụ
│   ├── storage.ts                 # Xử lý lưu trữ
│   ├── auth.logout.test.ts         # Test đăng xuất
│   └── catalog-admin.test.ts       # Test catalog và quyền admin
│
├── shared/
│   ├── catalog.ts                 # Catalog và dữ liệu demo dùng chung
│   ├── types.ts                   # Kiểu dữ liệu dùng chung
│   └── const.ts                   # Hằng số dùng chung
│
├── drizzle/
│   ├── schema.ts                  # Schema ORM
│   ├── relations.ts               # Quan hệ giữa các bảng
│   ├── migrations/                # Migration database
│   ├── 0001_even_pete_wisdom.sql  # Auth, logs và favorites schema
│   ├── 0002_blue_kang.sql          # Commerce schema theo logic bán máy tính
│
├── .vscode/
│   ├── extensions.json             # Extension khuyến nghị
│   └── settings.json               # Cấu hình workspace
├── package.json                   # Scripts và dependency
├── pnpm-lock.yaml                 # Phiên bản dependency đã khóa
├── vite.config.ts                 # Cấu hình Vite
├── tsconfig.json                  # Cấu hình TypeScript
├── vitest.config.ts               # Cấu hình Vitest
├── drizzle.config.ts              # Cấu hình Drizzle
├── RUN_IN_VSCODE.md               # Hướng dẫn mở và chạy bằng VS Code
└── README.md                      # Tài liệu dự án
```

> `node_modules`, `.git`, log runtime và thư mục build không nằm trong gói ZIP phát hành để giảm dung lượng. Chúng sẽ được tạo lại hoặc sinh ra trong quá trình cài đặt và chạy dự án.

## 6. Cài đặt và chạy trong Visual Studio Code

### Yêu cầu

+ Node.js 20 trở lên.
+ pnpm 10 trở lên.
+ Visual Studio Code.
+
### Cài dependency

```bash
pnpm install
```

### Chạy trên Windows trong thư mục hiện tại

Nếu thư mục bạn mở trong Visual Studio Code có dạng dưới đây thì đó đã là thư mục gốc của dự án:

```text
do_an_523100048/
├── client/
├── drizzle/
├── server/
├── shared/
├── package.json
├── pnpm-lock.yaml
└── README.md
```

Không chạy `cd nexa-laptop-store` trong trường hợp này. Mở Terminal tại thư mục đang chứa `package.json` rồi chạy trực tiếp:

```powershell
npx --yes pnpm@10.4.1 install
npx --yes pnpm@10.4.1 dev
```

Không bắt buộc chạy `corepack enable`. Nếu Corepack báo lỗi `EPERM` khi mở file trong `C:\Program Files\nodejs\yarn`, hãy tiếp tục dùng lệnh `npx --yes pnpm@10.4.1` như trên. Cách này không yêu cầu ghi thêm file vào thư mục cài Node.js.

Nếu Terminal chưa đứng ở đúng thư mục, dùng đường dẫn tương ứng trên máy của bạn:

```powershell
cd "C:\Users\Admin\Downloads\do_an_523100048"
npx --yes pnpm@10.4.1 install
npx --yes pnpm@10.4.1 dev
```

Có thể xác nhận đang ở đúng thư mục bằng lệnh:

```powershell
dir package.json
```

Nếu lệnh này hiển thị `package.json`, bạn có thể chạy dự án ngay.

Nếu máy chưa có pnpm, có thể bật Corepack rồi cài phiên bản phù hợp:

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
```

### Chạy môi trường phát triển

```bash
pnpm dev
```

Mở địa chỉ được hiển thị trong terminal, thông thường là `http://localhost:3000`.

### Các lệnh thường dùng

| Lệnh | Mục đích |
| --- | --- |
| `pnpm dev` | Chạy server phát triển và hot reload |
| `pnpm run check` | Kiểm tra TypeScript |
| `pnpm test -- --run` | Chạy toàn bộ test một lần |
| `pnpm run build` | Build frontend và bundle backend |
| `pnpm start` | Chạy bản production sau khi build |
| `pnpm db:push` | Sinh và áp dụng migration Drizzle |
| `pnpm format` | Format mã nguồn bằng Prettier |

## 7. Kiểm thử hiện tại

Các kiểm tra gần nhất đã hoàn tất thành công:

+ TypeScript compiler không phát hiện lỗi qua `pnpm run check`.
+ Vitest đạt 4/4 test trong 2 test file.
+ Quyền admin, procedure catalog và luồng đăng xuất đã có test backend.
+ Schema TypeScript, migration MySQL và favorites procedures đã được kiểm tra qua TypeScript và build.
+ Commerce migration, helper và procedure cho biến thể, giỏ hàng, checkout, review, contact đã được kiểm tra qua TypeScript, build và test hiện có.
+ Giao diện đã được kiểm tra ở desktop và mobile theo các luồng storefront, danh mục, PC Builder, liên hệ, chi tiết sản phẩm và admin.
+
## 8. Biến môi trường và dữ liệu nhạy cảm

Môi trường WebDev cung cấp các biến hệ thống như `DATABASE_URL`, `JWT_SECRET`, thông tin OAuth và các biến runtime liên quan. Khi chạy độc lập trong Visual Studio Code, chỉ thêm các biến cần thiết vào môi trường local hoặc file `.env` riêng.

Không commit các nội dung sau vào Git hoặc chia sẻ công khai:

+ Chuỗi kết nối MySQL thật.
+ JWT secret, OAuth secret hoặc API key.
+ Thông tin tài khoản production.
+ File `.env` chứa dữ liệu nhạy cảm.

## 9. Hướng phát triển tiếp theo

+ Chuyển toàn bộ dữ liệu demo và localStorage sang MySQL thông qua Drizzle ORM; ưu tiên cart, orders và contact trước.
+ Hoàn thiện AuthController/UserAuth/AdminAuth với session cookie, bcrypt hoặc argon2id, rate limit, CSRF, reset password và 2FA admin.
+ Bổ sung test integration cho auth và favorites, sau đó nâng coverage tối thiểu lên 80% trước khi production.
+ Mở rộng PC Builder với kiểm tra kích thước, cổng kết nối, nguồn và tản nhiệt.
+ Bổ sung thanh toán, vận chuyển, mã giảm giá và email xác nhận đơn hàng.
+ Tách storefront, admin và các feature lớn thành module riêng khi hệ thống phát triển thêm.

---

**NEXA Laptop Store** — tài liệu kỹ thuật tạm thời cho quá trình phát triển và triển khai.
