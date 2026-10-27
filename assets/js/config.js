/* Cấu hình triển khai. Không đặt mật khẩu, token hoặc Cloudinary API secret ở đây. */
window.SHOP_CONFIG = {
  apiUrl: '', // URL /exec của Apps Script public-api. Để trống để dùng dữ liệu có sẵn.
  apiTimeout: 10000,
  adminUrl: '', // URL /exec của Apps Script Admin; để trống để mở Admin thử nghiệm.
  demoMode: true, // Đổi false khi đã cấu hình shop và triển khai trên hosting phù hợp.
  useLocalAdminData: true,
  localDataKey: 'webshop100.catalog.v1',
  cartKey: 'webshop100.cart.v1',
  maxOrderQuantity: 99
};
