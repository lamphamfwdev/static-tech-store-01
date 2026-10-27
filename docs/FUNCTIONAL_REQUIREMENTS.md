# TỔNG HỢP CHỨC NĂNG WEBSITE LAM SHOP (WebShop100)

> **Nguồn phân tích:** Mã nguồn trong `WebShop100(1).zip` do người dùng cung cấp.  
> **Ngày tổng hợp:** 18/10/2026.  
> **Cập nhật chức năng:** 21/10/2026, theo bản WebShop100 **1.2.0**: thư viện tối đa 4 ảnh, liên kết riêng sản phẩm và thanh liên hệ nhanh.  
> **Phạm vi:** Các chức năng trong mã nguồn; kết quả kiểm tra của bản hiện tại được ghi riêng tại `FEATURES_AND_TESTS.md`. Các dịch vụ bên ngoài cần được xác minh trên tài khoản triển khai thật.

## 1. Tổng quan

**LAM SHOP** là website giới thiệu và bán sản phẩm theo hình thức **chọn hàng trên website, sau đó liên hệ shop qua một kênh mạng xã hội/nhắn tin để chốt đơn**.

Hệ thống gồm hai phần:

1. **Website khách hàng:** xem sản phẩm, tìm kiếm/lọc, xem chi tiết, quản lý giỏ hàng, sao chép nội dung đơn và mở kênh liên hệ với shop.
2. **Trang quản trị (Admin):** quản lý sản phẩm, hình ảnh, nội dung cửa hàng và bộ lọc giá; dữ liệu được lưu trong Google Sheets.

Website khách hàng hiện sử dụng HTML, CSS, JavaScript thuần; workflow đi kèm xuất bản demo lên GitHub Pages. Trang Admin và API công khai sử dụng Google Apps Script; ảnh tải lên khi dùng Admin Google được lưu tại Cloudinary. Admin local lưu dữ liệu thử trong trình duyệt.

## 2. Chức năng dành cho khách hàng

| Mã | Nhóm chức năng | Mô tả |
| --- | --- | --- |
| KH-01 | Trang chủ | Hiển thị logo, tên shop, slogan, khu vực giới thiệu (hero), ảnh đầu trang, thông tin nổi bật và danh sách sản phẩm. |
| KH-02 | Danh sách sản phẩm | Hiển thị ảnh đại diện, mã, tên, mô tả ngắn, danh mục, thẻ, giá bán, giá gốc, nhãn nổi bật/giảm giá và trạng thái hết hàng. |
| KH-03 | Tìm kiếm | Tìm theo mã, tên, mô tả, danh mục và thẻ sản phẩm; hỗ trợ chuẩn hóa từ khóa tiếng Việt. |
| KH-04 | Lọc sản phẩm | Lọc theo danh mục và các khoảng giá được cấu hình từ Admin. Có nút xóa bộ lọc. |
| KH-05 | Sắp xếp | Sắp xếp theo nổi bật, giá tăng dần, giá giảm dần hoặc tên A–Z. |
| KH-06 | Phân trang | Hiển thị số lượng kết quả; chuyển trang trước/sau và chọn số trang. Số sản phẩm/trang có thể cấu hình. |
| KH-07 | Xem chi tiết sản phẩm | Mở hộp thoại chi tiết gồm tên, mã, mô tả, danh mục, thẻ, giá, tồn kho và thư viện tối đa **4 ảnh**. Chuyển bằng ảnh thu nhỏ, nút trước/sau, phím mũi tên trong vùng ảnh hoặc vuốt ngang; có bộ đếm ảnh hiện tại. |
| KH-08 | Kiểm tra trạng thái hàng | Hiển thị số lượng còn lại nếu có khai báo; thông báo hết hàng và khóa nút thêm giỏ khi trạng thái là hết hàng hoặc tồn kho bằng 0. |
| KH-09 | Giỏ hàng | Thêm sản phẩm, tăng/giảm số lượng, xóa từng sản phẩm, xem số mặt hàng và tổng tiền tạm tính. Giỏ được lưu trong `localStorage` của trình duyệt. |
| KH-10 | Tạo nội dung đặt hàng | Tạo nội dung tin nhắn gồm mã đơn tạm tạo theo thời gian, tên/mã sản phẩm, số lượng, đơn giá và tổng tạm tính; có nút sao chép. |
| KH-11 | Liên hệ đặt hàng | Sau khi sao chép nội dung, mở kênh liên hệ được shop chọn: Messenger, Instagram, Zalo cá nhân, Zalo OA hoặc TikTok. Khách tự dán và gửi nội dung. |
| KH-12 | Thông tin liên hệ | Hiển thị địa chỉ, số điện thoại có thể bấm gọi, email có thể bấm gửi và liên kết kênh bán hàng. |
| KH-13 | Giao diện responsive | Thiết kế sử dụng được trên desktop và màn hình nhỏ, có nút mở/đóng bộ lọc trên giao diện phù hợp. |
| KH-14 | Dữ liệu dự phòng | Khi chưa cấu hình hoặc không tải được API, sử dụng file danh mục sản phẩm mẫu đi kèm dự án; hiển thị cảnh báo khi tải API lỗi. |
| KH-15 | Liên kết riêng sản phẩm | Sao chép URL có ID sản phẩm; mở liên kết sẽ mở đúng chi tiết; hỗ trợ Back/Forward và xử lý sản phẩm không còn hiển thị. |
| KH-16 | Thanh liên hệ nhanh | Zalo/Messenger/Gọi điện ở góc desktop hoặc dưới màn hình nhỏ; lấy thông tin từ Nội dung shop, tạm ẩn khi mở popup và giữ trạng thái xem thử khi bật demo. |

### Luồng đặt hàng của khách

**Xem sản phẩm → Tìm/lọc → Xem chi tiết → Thêm giỏ → Điều chỉnh số lượng → Sao chép nội dung đơn → Mở kênh liên hệ → Khách tự gửi tin nhắn cho shop.**

Lưu ý: tổng tiền trong giỏ là **tổng tạm tính**; chưa phải thanh toán hay xác nhận đơn hàng từ hệ thống.

## 3. Chức năng trang quản trị (Admin)

Trang Admin được chia thành **3 mục chính**: **Sản phẩm**, **Nội dung shop**, **Bộ lọc giá**.

### 3.1. Quản lý sản phẩm

| Mã | Chức năng | Mô tả |
| --- | --- | --- |
| QT-01 | Danh sách sản phẩm | Xem sản phẩm dạng bảng, tìm theo mã/tên/danh mục, phân trang; xem giá, trạng thái và thời điểm cập nhật. |
| QT-02 | Thống kê nhanh | Hiển thị tổng sản phẩm, số đang hiển thị và số đang tạm ẩn. |
| QT-03 | Thêm/sửa sản phẩm | Quản lý mã, tên, danh mục, mô tả, giá bán, giá gốc và thẻ sản phẩm. |
| QT-04 | Trạng thái sản phẩm | Đánh dấu nổi bật, bật/tắt hiển thị, chọn trạng thái **Đang bán / Hết hàng / Bản nháp**; nhập tồn kho (có thể để trống). |
| QT-05 | Nhân bản sản phẩm | Sao chép sản phẩm thành mã mới và tên có hậu tố “bản sao”; bản sao mặc định được ẩn, ở trạng thái nháp. |
| QT-06 | Lưu trữ sản phẩm | Lưu trữ (soft delete) thay vì xóa dòng khỏi Google Sheets; sản phẩm lưu trữ không xuất hiện trên website và danh sách quản trị mặc định. |
| QT-07 | Ảnh sản phẩm | Quản lý tối đa **4 ảnh/sản phẩm**, gồm 1 ảnh đại diện và 3 ảnh phụ; có 4 ô chọn/gỡ ảnh hoặc nhập URL và bộ đếm ảnh. Ô trống không được tính; ảnh đầu tiên sau khi lưu làm đại diện. |
| QT-08 | Chỉnh ảnh trước tải lên | Kéo, phóng to/thu nhỏ, xoay trái/phải, đặt lại và cắt ảnh vuông **1200 × 1200 px** trước khi tải lên Cloudinary. |
| QT-09 | Hỗ trợ định dạng ảnh | Hỗ trợ JPG, PNG, WebP, AVIF, HEIC/HEIF; có xử lý chuyển HEIC/HEIF sang JPEG trước khi dùng. |
| QT-10 | Mở dữ liệu gốc | Có nút mở Google Sheets chứa dữ liệu quản lý. |

### 3.2. Quản lý nội dung cửa hàng

| Mã | Nhóm cấu hình | Dữ liệu quản lý |
| --- | --- | --- |
| QT-11 | Nhận diện thương hiệu | Logo, tên shop, slogan hiển thị ở header. |
| QT-12 | Thông tin SEO cơ bản | Tiêu đề tab trình duyệt và mô tả trang (`meta description`). |
| QT-13 | Cấu hình hiển thị sản phẩm | Số lượng sản phẩm trên một trang. |
| QT-14 | Nội dung đầu trang | Nhãn nhỏ, tiêu đề lớn, mô tả, nhãn nổi bật, nội dung nổi bật và ảnh hero. |
| QT-15 | Footer/liên hệ | Giới thiệu ngắn, địa chỉ, điện thoại, email, tên Fanpage và username Fanpage. |
| QT-16 | Kênh nhận đơn | Chọn một kênh đặt hàng mặc định và cấu hình URL cho Facebook Messenger, Instagram, Zalo cá nhân, Zalo OA, TikTok. |
| QT-17 | Ảnh thương hiệu | Tải logo và ảnh hero lên Cloudinary từ máy tính. |

### 3.3. Quản lý bộ lọc giá

| Mã | Chức năng | Mô tả |
| --- | --- | --- |
| QT-18 | Thêm/sửa mức giá | Khai báo tên hiển thị, giá từ, giá đến của từng khoảng lọc. |
| QT-19 | Thứ tự mức giá | Thiết lập thứ tự hiển thị các mức giá. |
| QT-20 | Bật/tắt mức giá | Chỉ các khoảng giá đang bật mới hiển thị cho khách hàng. |
| QT-21 | Xóa mức giá | Xóa cấu hình khoảng lọc khỏi Google Sheets. |

## 4. Tổ chức dữ liệu và kết nối

| Thành phần | Công nghệ/cơ chế | Vai trò |
| --- | --- | --- |
| Website khách hàng | HTML + CSS + TypeScript | Hiển thị giao diện cửa hàng; chạy ở trình duyệt. |
| Hosting web | GitHub Pages (theo thiết kế dự án) | Triển khai website tĩnh bằng GitHub Actions. |
| Trang quản trị | Google Apps Script (Admin Web App) | Giao diện và các hàm quản lý dữ liệu. |
| Lưu trữ dữ liệu | Google Sheets | Ba sheet chính: `Products`, `Settings`, `PriceFilters`. |
| API khách hàng | Google Apps Script Public API | Chỉ đọc và trả danh sách sản phẩm, cấu hình shop, bộ lọc giá. Website tải dữ liệu bằng JSONP. |
| Kho ảnh | Cloudinary | Lưu ảnh sản phẩm, logo và ảnh đầu trang; Google Sheets chỉ lưu URL ảnh. |
| Giỏ hàng | Browser `localStorage` | Lưu danh sách mã sản phẩm và số lượng trên máy/trình duyệt khách hàng. |
| Dữ liệu mẫu | `data/products.xlsx` | Tạo dữ liệu sản phẩm dự phòng lúc build. |

**Đồng bộ dữ liệu:** Admin ghi vào Google Sheets → Public API đọc dữ liệu (có cache khoảng 30 giây) → website tải thông tin mới. Khi hệ thống đã triển khai đúng, thay đổi dữ liệu sản phẩm/nội dung shop thường không đòi hỏi build lại frontend.

**Phân quyền:** Admin có kiểm tra email được phép (`ADMIN_EMAIL`) và hướng dẫn triển khai Web App với giới hạn tài khoản; Public API được thiết kế cho phép đọc công khai và không cung cấp hàm ghi dữ liệu.

## 5. Phạm vi chưa có trong phiên bản mã nguồn này

Những nội dung sau **không thấy được triển khai** trong mã nguồn đã cung cấp:

- Đăng ký/đăng nhập tài khoản khách hàng, hồ sơ cá nhân, địa chỉ nhận hàng.
- Thanh toán trực tuyến, tích hợp cổng thanh toán, vận chuyển và tính phí giao hàng.
- Lưu đơn hàng vào cơ sở dữ liệu, màn hình quản lý đơn, trạng thái giao hàng hay lịch sử mua hàng.
- Tự động gửi đơn hàng qua Messenger/Zalo/Instagram/TikTok: hệ thống chỉ **sao chép nội dung và mở liên kết**.
- Đồng bộ trừ tồn kho khi khách bấm đặt hàng; trường tồn kho hiện dùng để hiển thị và ngăn thêm giỏ khi hết hàng.
- Trang quản trị danh mục độc lập (danh mục hiện nhập trên sản phẩm và được tổng hợp thành bộ lọc).
- Cấu hình chuyển đổi giữa nhiều layout giao diện; mã nguồn được kiểm tra thể hiện **một cấu trúc giao diện khách hàng**.

## 6. Các file mã nguồn chính để tra cứu

| File/thư mục | Chức năng |
| --- | --- |
| `index.html` | Cấu trúc trang bán hàng, giỏ hàng và popup chi tiết sản phẩm. |
| `src/ts/app.ts` | Tìm kiếm/lọc/sắp xếp/phân trang, render sản phẩm, tương tác giỏ hàng và đặt hàng qua kênh liên hệ. |
| `src/ts/ui/product-card.ts` | Giao diện thẻ sản phẩm, giá, giảm giá và tồn kho. |
| `src/ts/services/cart.service.ts` | Quản lý giỏ hàng, số lượng và lưu trình duyệt. |
| `src/ts/services/catalog.service.ts` | Tải danh mục từ Public API. |
| `src/ts/config/runtime.config.ts` | URL API và thời gian chờ tải. |
| `src/ts/config/shop.config.ts` | Thông số cửa hàng và phân trang dự phòng. |
| `apps-script/admin/Admin.html` | Toàn bộ giao diện quản trị. |
| `apps-script/admin/Code.gs` | Hàm quản trị dữ liệu Google Sheets, kiểm tra quyền, ký upload Cloudinary. |
| `apps-script/public-api/Code.gs` | API dữ liệu chỉ đọc cho website khách hàng. |
| `SETUP_ADMIN.md` | Hướng dẫn kết nối và triển khai Google Sheets, Apps Script, Cloudinary. |

---

**Kết luận:** WebShop100 hiện phù hợp mô hình **catalog bán hàng + giỏ hàng + chốt đơn qua tin nhắn**, với trang Admin để thay đổi dữ liệu và nội dung mà không phải sửa mã frontend. Đây **chưa phải** hệ thống thương mại điện tử xử lý đơn hàng, thanh toán và giao hàng tự động.
