# Đối chiếu chức năng và kiểm tra WebShop100

Bản gốc: 19/10/2026. Bản hiện tại: **1.2.0 — 21/10/2026**, bổ sung thư viện tối đa 4 ảnh với các cách chuyển ảnh; giữ liên kết riêng sản phẩm và thanh liên hệ nhanh của bản 1.1.0. Chức năng nền đối chiếu với `FUNCTIONAL_REQUIREMENTS.md` và `mockup-reference.png`; hướng dẫn sử dụng nằm trong `PRODUCT_GALLERY.md` và `SHARE_AND_CONTACT.md`.

## 1. Cấu trúc giao diện

Trang khách hàng được viết lại bằng HTML/CSS/JavaScript thuần, dùng script thông thường để chạy cả localhost lẫn mở trực tiếp `index.html`. Không cần cài package, TypeScript compiler hoặc công cụ build để dùng bản giao.

- Menu đen bên trái, nhận diện Nike theo ảnh tham chiếu, nhấn vàng.
- Hero ảnh công nghệ rộng, tiêu đề hai dòng, ô tìm kiếm, ba thông tin nổi bật và điều hướng ảnh.
- Bộ lọc ở cột trái, một sản phẩm lớn và bốn sản phẩm nhỏ ở vùng danh sách.
- Bố cục responsive: menu chuyển thành thanh đầu trang, bộ lọc mở thành bảng bên; sản phẩm tự chuyển cột.
- Giữ phong cách card của mockup; mã sản phẩm, tags, giá gốc và tồn kho đầy đủ trong popup chi tiết. Tồn kho, trạng thái và giá vẫn được áp dụng cho mọi thao tác giỏ.
- Chín ảnh JPEG nằm sẵn trong dự án, gồm ba ảnh bổ sung cho bộ 4 ảnh của Apple iPhone 16 mẫu. Đây là ảnh minh họa, không phải ảnh chính thức của từng model và không bảo đảm trùng từng pixel. Không hotlink ảnh; có font Inter và giấy phép trong dự án.

## 2. Website khách hàng

| Mã | Kết quả triển khai | Vị trí/cách kiểm tra |
| --- | --- | --- |
| KH-01 | Logo, tên shop, slogan, hero, ảnh và nội dung nổi bật | Trang chủ; chỉnh trong Admin → Nội dung shop |
| KH-02 | Ảnh/tên/mô tả/danh mục/giá, giá gốc/giảm giá, bán chạy/hết hàng | Danh sách; mã và tags trong popup chi tiết |
| KH-03 | Tìm theo mã/tên/mô tả/danh mục/tags, không phân biệt hoa thường, có/không dấu | Thử `ban phim`, `dien thoai`, `HP-FB3` |
| KH-04 | Nhiều danh mục, một khoảng giá, reset bộ lọc | Cột Bộ lọc; điều kiện danh mục kết hợp OR, nhóm điều kiện kết hợp AND |
| KH-05 | Nổi bật, giá tăng/giảm, tên A–Z; thêm lựa chọn mới nhất như mockup | Nhóm Sắp xếp |
| KH-06 | Đếm kết quả, trang trước/sau/số trang; pageSize 1–100 | Cuối danh sách; mặc định 5 sản phẩm/trang |
| KH-07 | Popup chi tiết, tối đa 4 ảnh; ảnh thu nhỏ, trước/sau, bộ đếm, phím mũi tên trong vùng ảnh và vuốt ngang | Apple iPhone 16 mẫu có 4 ảnh; khi mở sản phẩm khác bắt đầu từ ảnh đại diện; 0/1 ảnh không hiện điều khiển chuyển ảnh |
| KH-08 | Còn hàng, hết hàng, khóa thêm giỏ, chặn vượt tồn kho | Tai nghe thể thao Pro ở trang 2 là mẫu hết hàng |
| KH-09 | Thêm/tăng/giảm/xóa, số lượng và tổng, lưu localStorage | Menu Giỏ hàng; giá tính lại từ danh mục hiện tại |
| KH-10 | Nội dung đơn, mã tham chiếu theo giờ Việt Nam, đơn giá/tổng và sao chép | Giỏ → Xem nội dung/Sao chép |
| KH-11 | Mở Messenger/Instagram/Zalo cá nhân/Zalo OA/TikTok theo kênh mặc định | Cần cấu hình URL và `demoMode:false` trên hosting phù hợp; người dùng tự dán/gửi |
| KH-12 | Địa chỉ, gọi điện, gửi email và các kênh xã hội | Footer; chỉ hiện thông tin đã cấu hình |
| KH-13 | CSS responsive, bộ lọc đóng/mở, popup/drawer co theo màn hình | Breakpoint chính 1350/1080/760/380px; cần kiểm tra thực tế trên thiết bị |
| KH-14 | Dữ liệu mẫu khi API chưa có/lỗi, thông báo rõ khi API lỗi | `config.js`, `data.js`; giỏ mẫu dùng khóa riêng khi API lỗi |
| KH-15 | Liên kết riêng của từng sản phẩm, nút Sao chép liên kết, mở đúng popup từ URL | Popup chi tiết; URL có dạng `#product=p003`; thử tab mới, quay lại/tiến tới, sản phẩm ẩn/hết hàng |
| KH-16 | Thanh Zalo/Messenger/Gọi điện ở góc máy tính hoặc dưới điện thoại | Dùng Điện thoại/URL trong Nội dung shop; trạng thái demo/fallback và kênh chưa cấu hình được xử lý riêng |

Ảnh và giá mặc định chỉ để xem thử. Chưa có dữ liệu liên hệ của chủ shop, nên cấu hình mặc định không bịa số điện thoại, địa chỉ cụ thể hoặc URL tài khoản nhận đơn.

## 3. Quản trị

| Mã | Kết quả triển khai |
| --- | --- |
| QT-01, QT-02 | Bảng sản phẩm, tìm kiếm, phân trang, thống kê tổng/hiển thị/ẩn |
| QT-03, QT-04 | Thêm/sửa mọi trường, featured/visible, đang bán/hết hàng/nháp, tồn kho tùy chọn |
| QT-05 | Nhân bản ID và mã mới, tên hậu tố bản sao, mặc định nháp và ẩn |
| QT-06 | Lưu trữ mềm; có thêm xem và khôi phục dữ liệu lưu trữ |
| QT-07 | Tối đa 4 ảnh: một ảnh đại diện và ba ảnh phụ; 4 ô chọn/gỡ/nhập URL, có bộ đếm; bỏ ô trống trước khi lưu |
| QT-08 | Canvas crop ảnh sản phẩm 1200 × 1200, kéo, zoom, xoay trái/phải, reset |
| QT-09 | JPG/PNG/WebP/AVIF và HEIC/HEIF; decoder HEIC đi kèm bản local; lỗi biến thể ảnh được báo rõ |
| QT-10 | Mở Google Sheets trong bản Admin Apps Script sau cấu hình |
| QT-11–QT-17 | Nhận diện, SEO, pageSize, hero, footer/liên hệ, kênh nhận đơn, logo/ảnh hero |
| QT-18–QT-21 | Thêm/sửa khoảng giá, thứ tự, bật/tắt, xóa rồi lưu |
| Bổ sung | Xuất/nhập JSON, xuất data.js công khai, phục hồi sản phẩm đã lưu trữ |

Admin local lưu trên máy/trình duyệt hiện tại. Bản Apps Script dùng dữ liệu Google Sheets của chủ shop và phải được triển khai, cấp quyền trước. Hướng dẫn: `SETUP_ADMIN.md`.

## 4. Kiểm tra bản cập nhật

### Bộ kiểm tra nền

Bản gốc đã có các kết quả dưới đây vào ngày 19/10/2026. Đây là mốc đối chiếu lịch sử; kết quả của source 1.2.0 được ghi riêng bên dưới.

| Nhóm | Kết quả bản gốc | Phạm vi |
| --- | ---: | --- |
| Nghiệp vụ frontend | 43/43 PASS | Chuẩn hóa tiếng Việt; tìm/lọc/sắp xếp; phân trang; stock; giỏ cũ/bị sửa; giá hiện tại; nội dung đơn và thời gian Việt Nam |
| Server local | 35/35 PASS | Request giả lập, đường dẫn và MIME; chặn traversal/symlink; chỉ localhost; chọn cổng bận; không mở socket thật |
| Backend Apps Script | 20/20 PASS | Google services giả lập; CRUD/clone/archive; email allowlist; cập nhật cũ; callback JSONP; cache Unicode; chữ ký Cloudinary; giá trống; công thức Sheets |
| Tích hợp DOM storefront | 45/45 PASS | Khởi tạo năm card; tìm/lọc/phân trang; popup ảnh; giỏ và clipboard giả lập; localStorage; lỗi API, danh mục live rỗng; bảo toàn giỏ remote; tách giỏ fallback |

### Mốc 1.1.0 — liên kết sản phẩm và thanh liên hệ

Bản 1.1.0 ngày 21/10/2026 đã đạt **131/131 kiểm tra Node** và **130/130 kiểm tra DOM mô phỏng**; bản build có 24 file public và ZIP có 53 file nguồn. Chrome đã được dùng để thử mở liên kết ở tab mới, Back/Forward, popup, thanh liên hệ desktop và khung màn hình nhỏ. Đây là kết quả của bản trước, không được tính như một lần kiểm tra riêng trên bản 1.2.0.

### Xác minh bản 1.2.0 — thư viện tối đa 4 ảnh

| Phần | Trạng thái | Phạm vi |
| --- | --- | --- |
| Bộ kiểm tra Node trên source hiện tại | **144/144 PASS** | 43 nghiệp vụ frontend + 35 server local + 25 backend Apps Script + 10 liên kết sản phẩm + 23 thanh liên hệ + 8 thư viện ảnh |
| Tích hợp DOM storefront | **215/215 PASS** | Giữ 130 kiểm tra của bản trước và thêm 85 kiểm tra cho bản thư viện ảnh hiện tại; đây là mô phỏng DOM |
| Thư viện 4 ảnh — logic và mô phỏng DOM | **PASS** | Giới hạn ảnh, thứ tự, thumbnail, trước/sau quay vòng, bộ đếm, phím mũi tên trong vùng ảnh, thao tác vuốt, 0/1 ảnh và chuyển sang sản phẩm khác |
| Ảnh trong Admin và Apps Script | **25/25 backend PASS** | Gồm 20 kiểm tra cũ và 5 kiểm tra mới: bỏ ô trống, tối đa 4 ảnh khi nhập/lưu/đọc, thứ tự ảnh, Public API, đọc dữ liệu cũ không tự ghi lại cell |
| Liên kết sản phẩm và thanh liên hệ | **PASS trong bộ DOM hồi quy** | Các kiểm tra trước về URL/history/API/fallback/clipboard và trạng thái kênh liên hệ được giữ lại |
| Build frontend tĩnh — bản thường | **PASS — 28 file** | Bản build chứa tài nguyên thư viện ảnh và 9 file JPEG trong dự án |
| Build demo | **PASS — 28 file** | Có đủ 9 JPEG và tài nguyên thư viện ảnh; giữ chế độ demo, không chứa Admin hoặc trang kiểm tra tạm |
| Bản public và ZIP | **PASS — 59 file nguồn** | Giữ đủ 53 file của bản trước, thêm 6 file cho thư viện ảnh; ZIP toàn vẹn, launcher Mac có quyền `0755`; không kèm thư mục build, dependency QA hoặc cấu hình preview tạm |
| Chrome — thư viện ảnh desktop | **PASS trong phạm vi đã thử** | Mở trực tiếp `#product=p002`, tải đủ 4 JPEG và 4 thumbnail; nút sau chuyển tới ảnh 2, thumbnail chuyển tới ảnh 4, ArrowRight từ ảnh 4 quay về ảnh 1; nguồn ảnh và bộ đếm đúng, số lượng 2 và URL chia sẻ không đổi khi chuyển ảnh |
| Chrome — khung màn hình nhỏ | **PASS trong phạm vi đã thử** | Khung rộng 390px hiển thị đủ 4 thumbnail, nút trước/sau 44px, ảnh 3 được chọn và bộ đếm 3/4; không tràn ngang |
| Chrome — Admin | **PASS trong phạm vi đã thử** | Popup sửa Apple iPhone 16 có 4 ô ảnh và bộ đếm 4/4; Nội dung shop có đúng các trường Điện thoại, URL Messenger, URL Zalo cá nhân và URL Zalo OA |

Các kiểm tra tự động xác minh hành vi và hợp đồng dữ liệu trong phạm vi môi trường chạy. Kết quả mô phỏng không tự xác nhận thao tác Finder/macOS, clipboard hệ điều hành, gửi tin nhắn, gọi điện hoặc dịch vụ thật.

Kiểm tra giao diện bản 1.2.0 dùng Chrome desktop và khung responsive 390px, chưa chạy trên Safari hoặc thiết bị cảm ứng thật. Thao tác vuốt được kiểm tra trong bộ mô phỏng DOM; API Google/Cloudinary thật không nằm trong lần thử trình duyệt này.

Ở lần kiểm tra Chrome của bản 1.1.0, nút **Sao chép liên kết** hiển thị thành công nhưng môi trường không phản chiếu dữ liệu từ `document.execCommand('copy')` vào clipboard ảo. Vì vậy, kết quả đó không xác nhận byte thực tế trong clipboard hệ điều hành. Payload và phương án sao chép thủ công được kiểm tra riêng bằng DOM. Khung mobile trên Chrome cũng không thay cho thử Safari hoặc thiết bị Mac/iPhone thật.

### Chạy lại các bộ kiểm tra có trong source

```bash
npm test
# Hoặc riêng từng nhóm:
node tests/core.test.cjs
node tests/server.test.cjs
node apps-script/test-backend.cjs
node tests/share.test.cjs
node tests/contact-bar.test.cjs
node tests/gallery.test.cjs
```

Các bộ này không cần `npm install`. Công cụ tích hợp DOM được dùng khi bàn giao không phải dependency của sản phẩm.

### Phần cần xác minh trên thiết bị và tài khoản thật

- Safari và thao tác Finder/macOS, gồm mở `CHAY_TREN_MAC.command` bằng nhấp đúp.
- Đăng nhập Admin, phân quyền Google, đọc/ghi Google Sheets và tải ảnh Cloudinary của tài khoản cụ thể.
- Cắt ảnh bằng chuột/cảm ứng và các biến thể HEIC/HEIF trên trình duyệt của người dùng.
- Sao chép vào ứng dụng khác và mở ứng dụng gọi điện/Zalo/Messenger trên thiết bị thật.
- Triển khai trong repository/hosting của người dùng; bản cập nhật chỉ chuẩn bị source, workflow và hướng dẫn.

## 5. Cơ chế triển khai và giới hạn chức năng

Google Apps Script được tách hai project: Admin kiểm tra quyền ghi; Public API chỉ có đọc JSON/JSONP. Google Sheets có Products/Settings/PriceFilters. Cloudinary lưu ảnh; API secret chỉ ở Script Properties của Admin. API cache khoảng 30 giây; khách cần tải lại trang để nhận cập nhật.

Luồng bán hàng là catalog → giỏ → nội dung tin nhắn → liên hệ. Chưa bao gồm tài khoản khách hàng, thanh toán, phí vận chuyển tự động, database đơn hàng, tự gửi tin nhắn, trừ kho hoặc nhiều layout. Những mục này cũng nằm ngoài phạm vi file chức năng nguồn.

GitHub Pages đi kèm phục vụ demo. Website dùng để kinh doanh thật cần hosting phù hợp; xem `GITHUB_PAGES.md`, phần điều khoản GitHub và phương án Cloudflare Pages. Có thể tiếp tục lưu toàn bộ mã nguồn ở GitHub dù chọn hosting khác.
