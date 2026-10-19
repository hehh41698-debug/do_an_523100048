export type CatalogProduct = {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  image: string;
  badge: string;
  category: string;
  specs: string[];
  stock: number;
  tone: string;
  group?: string;
};

export type DemoOrder = {
  id: string;
  createdAt: string;
  items: Array<{ id: number; name: string; quantity: number; price: number }>;
  total: number;
  status: string;
};

export const catalogGroups = ["Laptop", "PC", "Linh kiện", "Phần mềm", "Thiết bị văn phòng"] as const;
export const catalogCategories = ["Văn phòng", "Sinh viên", "Gaming", "Đồ họa"] as const;
export const catalogBrands = ["Nexa", "Lenovo", "Acer"] as const;

export const catalogProducts: CatalogProduct[] = [
  { id: 1, name: "Lumen Air 14 Pro", brand: "Nexa", price: 24990000, oldPrice: 26990000, rating: 4.9, image: "/manus-storage/ultra-01_c6203536.png", badge: "Mới về", category: "Văn phòng", specs: ["Core Ultra 7", "32GB RAM", "1TB SSD", "14” 2.8K"], stock: 12, tone: "ice", group: "Laptop" },
  { id: 2, name: "Forge 16 Studio", brand: "Nexa", price: 34990000, oldPrice: 37990000, rating: 4.8, image: "/manus-storage/gaming-01_fcf5102a.jpg", badge: "Bán chạy", category: "Đồ họa", specs: ["Core i9", "32GB RAM", "RTX 4070", "16” 240Hz"], stock: 7, tone: "blue", group: "Laptop" },
  { id: 3, name: "Nova Slim 15", brand: "Lenovo", price: 18990000, rating: 4.7, image: "/manus-storage/editor-01_0411805d.jpg", badge: "Giá tốt", category: "Sinh viên", specs: ["Ryzen 7", "16GB RAM", "512GB SSD", "15.6” FHD"], stock: 24, tone: "sand", group: "Laptop" },
  { id: 4, name: "Apex Battle 17", brand: "Acer", price: 28990000, oldPrice: 30990000, rating: 4.8, image: "/manus-storage/gaming-02_a2f2846b.jpg", badge: "Gaming", category: "Gaming", specs: ["Core i7", "16GB RAM", "RTX 4060", "17.3” 165Hz"], stock: 9, tone: "night", group: "Laptop" },
  { id: 5, name: "Orbit Creator 16", brand: "Lenovo", price: 31990000, rating: 4.6, image: "/manus-storage/loq-01_65bdadbf.jpg", badge: "Creator", category: "Đồ họa", specs: ["Core Ultra 9", "32GB RAM", "RTX 4060", "16” 3.2K"], stock: 5, tone: "violet", group: "Laptop" },
  { id: 6, name: "Nexa Work 14", brand: "Nexa", price: 15990000, rating: 4.5, image: "/manus-storage/ultra-01_c6203536.png", badge: "Văn phòng", category: "Văn phòng", specs: ["Core i5", "16GB RAM", "512GB SSD", "14” FHD"], stock: 18, tone: "ice", group: "Laptop" },
  { id: 7, name: "Nexa Orion G7", brand: "Nexa", price: 42990000, rating: 4.8, image: "/manus-storage/gaming-02_a2f2846b.jpg", badge: "PC mới", category: "PC Gaming", specs: ["Core i7", "32GB RAM", "RTX 4070", "1TB SSD"], stock: 6, tone: "night", group: "PC" },
  { id: 8, name: "Nexa Creator Tower", brand: "Nexa", price: 38990000, rating: 4.7, image: "/manus-storage/loq-01_65bdadbf.jpg", badge: "PC đồ họa", category: "PC Đồ họa", specs: ["Ryzen 7", "64GB RAM", "RTX 4060", "2TB SSD"], stock: 4, tone: "violet", group: "PC" },
  { id: 9, name: "RTX 4070 Super", brand: "NVIDIA", price: 15990000, rating: 4.8, image: "/manus-storage/gaming-01_fcf5102a.jpg", badge: "Linh kiện", category: "VGA", specs: ["12GB GDDR6X", "Ray Tracing", "3 Fan", "PCIe 4.0"], stock: 8, tone: "blue", group: "Linh kiện" },
  { id: 10, name: "Office Suite Pro", brand: "Nexa Cloud", price: 2990000, rating: 4.6, image: "/manus-storage/editor-01_0411805d.jpg", badge: "Bản quyền", category: "Phần mềm", specs: ["1 thiết bị", "12 tháng", "Cloud 1TB", "Hỗ trợ 24/7"], stock: 20, tone: "ice", group: "Phần mềm" },
  { id: 11, name: "Vision 27 QHD", brand: "Nexa", price: 7490000, rating: 4.5, image: "/manus-storage/ultra-01_c6203536.png", badge: "Màn hình", category: "Thiết bị văn phòng", specs: ["27 inch", "QHD", "100Hz", "USB-C"], stock: 11, tone: "sand", group: "Thiết bị văn phòng" },
];

export const demoCart = [{ ...catalogProducts[0], quantity: 1 }];
export const demoOrders: DemoOrder[] = [
  {
    id: "NX-DEMO-01",
    createdAt: "14/09/2026",
    items: [{ id: catalogProducts[0].id, name: catalogProducts[0].name, quantity: 1, price: catalogProducts[0].price }],
    total: catalogProducts[0].price,
    status: "Đang xử lý",
  },
];

export const demoUsers = [
  { id: "user-demo", name: "Người dùng demo", email: "user@nexa.store", role: "user" as const },
  { id: "admin-demo", name: "Alex Designer", email: "admin@nexa.store", role: "admin" as const },
];
