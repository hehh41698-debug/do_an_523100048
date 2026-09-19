# NEXA Laptop Store

> **Công cụ mạnh. Ý tưởng rộng.**
>
> NEXA Laptop Store là website thương mại điện tử chuyên về laptop và thiết bị công nghệ. Dự án tập trung vào một trải nghiệm mua sắm rõ ràng, hiện đại và có khả năng mở rộng: người dùng có thể tìm sản phẩm theo nhu cầu, đọc thông số, xây dựng cấu hình PC, quản lý giỏ hàng và theo dõi đơn hàng; quản trị viên có một không gian riêng để theo dõi sản phẩm, tồn kho, đơn hàng và người dùng.

## 1. Tổng quan dự án

NEXA được phát triển theo hướng storefront kết hợp khu vực quản trị. Giao diện sử dụng nhận diện riêng với nền sáng, chữ navy và điểm nhấn electric blue. Bố cục ưu tiên khả năng đọc thông số kỹ thuật, thao tác nhanh trên máy tính và khả năng sử dụng tốt trên màn hình nhỏ.

Dự án hiện đang ở **phiên bản demo có thể chạy được**. Catalog mẫu được tổ chức trong nguồn dữ liệu dùng chung. Một số luồng như giỏ hàng, đơn hàng và chuyển đổi vai trò tài khoản được mô phỏng ở phía trình duyệt để phục vụ việc kiểm tra giao diện và nghiệp vụ. Kiến trúc backend, tRPC và Drizzle đã được chuẩn bị cho bước chuyển sang cơ sở dữ liệu thực tế.

## 2. Chức năng hiện có

### Khu vực khách hàng

+ Xem trang chủ, danh mục sản phẩm và sản phẩm nổi bật.
+ Tìm kiếm theo tên, thương hiệu hoặc cấu hình.
+ Lọc theo nhóm sản phẩm, thương hiệu và khoảng giá.
+ Sắp xếp theo mức độ nổi bật, giá thấp, giá cao hoặc đánh giá.
+ Mở trang chi tiết để xem giá, hình ảnh, cấu hình và thông tin bảo hành.
+ Thêm sản phẩm vào giỏ hàng, thay đổi số lượng và tạo đơn hàng demo.
+ Theo dõi lịch sử đơn hàng tại route `/orders`.
+ Sử dụng PC Builder để chọn CPU, GPU, RAM, SSD, ngân sách và nhận cảnh báo tương thích cơ bản.
+ Gửi yêu cầu tư vấn hoặc tin nhắn qua khu vực liên hệ.
+
### Khu vực quản trị

Khu vực `/admin` được tách riêng khỏi storefront bằng layout quản trị. Các nhóm chức năng hiện có gồm tổng quan, sản phẩm, danh mục, tồn kho, đơn hàng, người dùng, báo cáo và thông báo.

Backend đã có `adminProcedure` để kiểm tra `ctx.user.role`. Người dùng không có vai trò quản trị sẽ không được phép gọi các procedure dành riêng cho admin. Vai trò demo có thể được chuyển trong menu tài khoản để kiểm tra các trạng thái giao diện.

## 3. Công nghệ và công cụ đang sử dụng

| Nhóm | Công nghệ hoặc công cụ | Vai trò trong dự án |
| --- | --- | --- |
| Giao diện | Vue 3, Vite, TypeScript | Xây dựng storefront, catalog, PC Builder và các màn hình tương tác |
| Styling | CSS, Tailwind CSS, responsive layout | Tạo nhận diện NEXA, bố cục responsive và animation |
| Biểu tượng | Lucide | Hiển thị icon cho điều hướng và thao tác người dùng |
| Backend | Node.js | Chạy server và xử lý nghiệp vụ phía máy chủ |
| API | tRPC 11 | Kết nối frontend và backend với contract có kiểu dữ liệu |
| Dữ liệu | `shared/catalog.ts` | Nguồn dữ liệu mẫu dùng chung giữa client và server |
| Cơ sở dữ liệu | Drizzle ORM, MySQL | Cấu trúc sẵn sàng cho dữ liệu production và migration |
| Lưu trữ demo | `localStorage` | Lưu giỏ hàng, trạng thái đơn và một số trạng thái giao diện trong bản demo |
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

Người dùng thêm sản phẩm vào giỏ, thay đổi số lượng và tiến hành đặt hàng demo. Trạng thái hiện được lưu ở localStorage để có thể kiểm tra ngay trên trình duyệt. Khi kết nối database thật, các bước này sẽ được chuyển sang procedure backend và lưu vào các bảng giỏ hàng, đơn hàng và chi tiết đơn hàng.

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
│   └── migrations/                # Migration database
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

+ Chuyển dữ liệu demo và localStorage sang MySQL thông qua Drizzle ORM.
+ Hoàn thiện xác thực tài khoản và phân quyền production.
+ Mở rộng PC Builder với kiểm tra kích thước, cổng kết nối, nguồn và tản nhiệt.
+ Bổ sung thanh toán, vận chuyển, mã giảm giá và email xác nhận đơn hàng.
+ Tách storefront, admin và các feature lớn thành module riêng khi hệ thống phát triển thêm.

---

**NEXA Laptop Store** — tài liệu kỹ thuật tạm thời cho quá trình phát triển và triển khai.
