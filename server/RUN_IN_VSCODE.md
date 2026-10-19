# NEXA Laptop Store — Chạy trong Visual Studio Code

## Yêu cầu môi trường

+ Node.js 20 trở lên.
+ pnpm 10 trở lên. Nếu máy chưa có pnpm, chạy `corepack enable` rồi `corepack prepare pnpm@10.4.1 --activate`.
+ Visual Studio Code.
+
## Mở dự án

+ Giải nén file ZIP.
+ Mở Visual Studio Code.
+ Chọn **File → Open Folder** và mở thư mục `nexa-laptop-store`.
+ Mở Terminal trong VS Code tại đúng thư mục dự án.
+
## Cài dependency

```bash
pnpm install
```

Có thể dùng `npm install` nếu không sử dụng pnpm, nhưng nên ưu tiên pnpm vì dự án có `pnpm-lock.yaml`.

## Chạy môi trường phát triển

```bash
pnpm dev
```

Sau đó mở địa chỉ được hiển thị trong terminal, thường là:

```text
http://localhost:3000
```

## Kiểm tra mã nguồn

```bash
pnpm run check
pnpm test
```

## Build bản production

```bash
pnpm run build
pnpm start
```

## Cơ sở dữ liệu

Dự án đã có cấu trúc Drizzle và MySQL trong thư mục `drizzle`. Khi chạy bản demo không có cấu hình cơ sở dữ liệu bên ngoài, ứng dụng sử dụng dữ liệu demo dùng chung trong `shared/catalog.ts` và trạng thái cục bộ theo thiết kế hiện tại.

Nếu kết nối MySQL, đặt biến `DATABASE_URL` trong môi trường chạy rồi dùng:

```bash
pnpm db:push
```

Không đưa khóa bí mật, chuỗi kết nối thật hoặc file `.env` có thông tin nhạy cảm vào Git hoặc file ZIP công khai.

## Các thư mục chính

+ `client/`: giao diện frontend.
+ `server/`: Node.js, tRPC và các xử lý backend.
+ `shared/`: dữ liệu và kiểu dùng chung giữa frontend và backend.
+ `drizzle/`: schema và migration cơ sở dữ liệu.
+ `package.json`: lệnh chạy và danh sách dependency.
+ `pnpm-lock.yaml`: phiên bản dependency đã khóa.
