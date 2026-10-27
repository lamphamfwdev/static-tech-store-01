# WebShop100 — website theo mockup

Bản **1.2.0**, cập nhật ngày **21/10/2026**, bổ sung thư viện **tối đa 4 ảnh cho mỗi sản phẩm** với ảnh thu nhỏ, nút trước/sau, bộ đếm và thao tác vuốt. Các tính năng **chia sẻ liên kết sản phẩm** và **thanh liên hệ nhanh Zalo/Messenger/Gọi điện** của bản trước tiếp tục được sử dụng.

## Chạy ngay trên MacBook

1. Giải nén toàn bộ file ZIP.
2. Mở thư mục **WebShop100**.
3. Nhấp đúp **`CHAY_TREN_MAC.command`**. Trình duyệt sẽ tự mở website.

Khi máy có Node từ phiên bản 14, website chạy tại `http://127.0.0.1:4173/`. Nếu cổng đó đang được sử dụng, chương trình tự chọn cổng khác và in địa chỉ trong Terminal. Giữ cửa sổ Terminal mở trong lúc dùng; nhấn **Ctrl+C** để dừng.

Nếu máy chưa có Node, file chạy sẽ mở trực tiếp **`index.html`**. Bạn cũng có thể nhấp đúp `index.html` để xem giao diện mẫu. Chế độ localhost phù hợp hơn khi cần lưu dữ liệu quản trị và thử kết nối API.

**Không cần chạy `npm install`.** Frontend sử dụng HTML, CSS và JavaScript thuần. File chạy tận dụng Node hiện có, tương thích Node 14 và không thay đổi phiên bản Node của các dự án khác.

Hướng dẫn xử lý các trường hợp trên macOS: [docs/CHAY_TREN_MAC.md](docs/CHAY_TREN_MAC.md).

## Những gì có trong bản giao

- Giao diện cửa hàng theo bố cục mockup: menu đen bên trái, hero công nghệ rộng, màu nhấn vàng, bộ lọc bên trái, một thẻ sản phẩm lớn cạnh bốn thẻ nhỏ; có bố cục riêng cho màn hình nhỏ.
- Tìm kiếm tiếng Việt, lọc danh mục/giá, sắp xếp, phân trang, xem chi tiết và thư viện tối đa 4 ảnh; quản lý 1 ảnh đại diện + 3 ảnh phụ trong Admin.
- Liên kết riêng cho từng sản phẩm; mở liên kết sẽ vào popup chi tiết, có nút **Sao chép liên kết**.
- Thanh liên hệ nhanh ở góc màn hình máy tính và dưới màn hình điện thoại, lấy số điện thoại/URL từ nội dung shop.
- Giỏ hàng lưu trong trình duyệt, kiểm tra tồn kho, điều chỉnh số lượng và tạo nội dung đơn để sao chép.
- Trang **`admin.html`** để thử quản trị trên máy: sản phẩm, nội dung shop, bộ lọc giá. Dữ liệu thử được lưu trong trình duyệt đang dùng.
- Mã nguồn Google Apps Script cho quản trị dữ liệu bằng Google Sheets và Public API; có phần cấu hình ảnh Cloudinary.
- File chạy trên Mac, script tạo thư mục website công khai và workflow GitHub Pages.

Tên thương hiệu, sản phẩm, giá và thông tin liên hệ mặc định là dữ liệu trình diễn. Có thể thay bằng thông tin cửa hàng của bạn trong phần cấu hình/quản trị. Bản này không xác nhận thanh toán, không tự gửi tin nhắn và không tự trừ tồn kho.

Chín ảnh công nghệ đã có sẵn dưới dạng **JPEG thật** trong `assets/images/`, gồm ba ảnh bổ sung cho sản phẩm Apple iPhone 16 mẫu; font Inter cũng nằm trong dự án. Ảnh được tạo riêng theo bố cục mockup, không phải ảnh sản phẩm chính thức và không khẳng định trùng từng pixel với ảnh gốc. Xem [nguồn ảnh](docs/IMAGE_CREDITS.md). Mã và thẻ sản phẩm được trình bày đầy đủ trong popup chi tiết để thẻ danh sách giữ gần thiết kế mẫu.

## Dùng thư viện ảnh, chia sẻ và liên hệ nhanh

**Xem nhiều ảnh:** mở sản phẩm **Apple iPhone 16** mẫu để thử 4 ảnh. Bấm ảnh thu nhỏ hoặc nút trước/sau, dùng phím mũi tên khi đang ở vùng ảnh, hoặc vuốt ngang trên ảnh. Bộ đếm cho biết ảnh đang xem, ví dụ **Ảnh 1 / 4**. Mở sản phẩm khác sẽ trở về ảnh đại diện của sản phẩm đó.

**Quản lý ảnh:** vào **Quản trị → Sản phẩm → Sửa**, chọn ảnh hoặc nhập URL vào tối đa **4 ô**, rồi bấm **Lưu sản phẩm**. Ảnh đầu tiên còn lại sau khi bỏ các ô trống làm ảnh đại diện; thứ tự các ảnh được giữ nguyên. Xem đầy đủ tại **[docs/PRODUCT_GALLERY.md](docs/PRODUCT_GALLERY.md)**.

Nếu bạn đã lưu dữ liệu trong Admin local, website ưu tiên danh mục đó nên Apple iPhone 16 có thể vẫn chỉ có ảnh bạn đã lưu. Có thể thêm ảnh qua Admin; không cần xóa dữ liệu hiện có để dùng bản cập nhật.

**Chia sẻ sản phẩm:** nhấp vào ảnh hoặc tên sản phẩm, chọn **Sao chép liên kết** trong popup rồi gửi liên kết đó. Khi mở liên kết, website tự tìm sản phẩm và mở chi tiết. Ví dụ định dạng: `https://TEN_TAI_KHOAN.github.io/TEN_REPOSITORY/#product=p003`. Liên kết dựa vào ID sản phẩm nên việc đổi tên hay giá không làm đổi ID của liên kết.

**Liên hệ nhanh:** mở **Quản trị → Nội dung shop**, điền **Điện thoại**, **URL Messenger**, **URL Zalo cá nhân** hoặc **URL Zalo OA**, rồi **Lưu thay đổi**. Thanh liên hệ sử dụng các thông tin này. Zalo cá nhân được ưu tiên; nếu không có URL hợp lệ, thanh dùng Zalo OA. Trong chế độ dùng thật, kênh chưa cấu hình hợp lệ sẽ không xuất hiện.

Bản giao mặc định bật `demoMode: true`, nên các nút liên hệ nhanh hiển thị ở trạng thái xem thử và chưa mở liên hệ thật. Để dùng các URL/số điện thoại đã điền trên bản local hoặc hosting phù hợp, đặt `demoMode: false` trong `assets/js/config.js` rồi tải lại trang. Thanh cũng tạm khóa khi đang tải API hoặc đang dùng dữ liệu mẫu dự phòng.

Liên kết bắt đầu bằng `http://127.0.0.1:...` hoặc `file://...` chỉ phục vụ bản đang chạy trên máy của bạn. Để người khác mở được sản phẩm qua Internet, hãy sao chép liên kết từ địa chỉ website đã xuất bản. Hướng dẫn, cách thử và xử lý các trường hợp thường gặp: **[docs/SHARE_AND_CONTACT.md](docs/SHARE_AND_CONTACT.md)**.

## Dữ liệu demo và dữ liệu dùng thật

| Nội dung | Mở bản giao ngay | Khi kết nối dịch vụ của bạn |
| --- | --- | --- |
| Danh mục sản phẩm | Dữ liệu mẫu trong `assets/js/data.js` | Tải từ Public API của Google Apps Script |
| Giỏ hàng | Lưu trên trình duyệt của người xem | Vẫn lưu trên trình duyệt; không phải cơ sở dữ liệu đơn hàng |
| Quản trị | `admin.html`, dữ liệu thử lưu cục bộ | Web App Admin riêng, được giới hạn tài khoản Google và ghi Google Sheets |
| Ảnh sản phẩm/thương hiệu | Ảnh có sẵn trong dự án hoặc ảnh thử cục bộ | Upload Cloudinary sau khi cấu hình tài khoản |
| Liên hệ nhận đơn | Chế độ demo cho xem/sao chép nội dung; không mở kênh nhận đơn thật | Bật chế độ dùng thật và cấu hình URL liên hệ trên hosting phù hợp |
| Liên kết sản phẩm | Mở đúng sản phẩm trong cùng bản local; có thể sao chép liên kết | Sao chép từ địa chỉ website công khai để gửi cho người khác |
| Thanh liên hệ nhanh | Hiển thị các nút ở trạng thái xem thử | Hiện các kênh hợp lệ đã cấu hình; Zalo/Messenger mở tab liên hệ, Gọi điện dùng số của shop |

`admin.html` phục vụ thử thao tác trên máy. Nó không phải cổng quản trị bảo mật để đưa lên Internet và không thay thế bản Admin Google Apps Script. Thay đổi cục bộ chỉ xuất hiện trong trình duyệt và địa chỉ website đang sử dụng; đổi từ `file://` sang localhost, đổi cổng hoặc đổi trình duyệt sẽ có vùng lưu dữ liệu khác.

Khi API chưa tải được, dữ liệu mẫu và giỏ thử được dùng riêng. Giỏ hàng đã lưu của danh mục thật không bị ghi đè bởi dữ liệu mẫu. Trang hiện thông báo dự phòng và chưa mở kênh nhận đơn thật cho các sản phẩm mẫu.

## Cấu hình chính

Mở **`assets/js/config.js`** để chỉnh cấu hình runtime:

| Thuộc tính trong `window.SHOP_CONFIG` | Ý nghĩa |
| --- | --- |
| `demoMode` | `true`: chạy bản trình diễn. `false`: cho phép dùng kênh nhận đơn đã cấu hình trên hosting phù hợp. |
| `apiUrl` | URL triển khai Public API của Google Apps Script. Mặc định để trống để dùng dữ liệu mẫu. |
| `adminUrl` | URL Admin Google Apps Script riêng của shop; không phải API công khai. |

Chỉ URL công khai nằm trong frontend. Các giá trị bí mật của Cloudinary và thông tin kiểm soát quyền quản trị được cấu hình ở phía Google Apps Script. Không dán khóa bí mật vào `config.js` hoặc commit chúng lên GitHub.

Hướng dẫn tạo Google Sheets, triển khai hai Web App và cấu hình Cloudinary: **[docs/SETUP_ADMIN.md](docs/SETUP_ADMIN.md)**.

## Đưa lên GitHub và dùng địa chỉ miễn phí

Bạn có thể lưu toàn bộ mã nguồn trên GitHub. Dự án đã có workflow để đưa **bản demo** lên địa chỉ dạng:

```text
https://TEN_TAI_KHOAN.github.io/TEN_REPOSITORY/
```

**GitHub Pages chỉ dùng cho bản demo của dự án này.** Theo [giới hạn sử dụng GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), dịch vụ không cho phép dùng làm hosting miễn phí cho hoạt động kinh doanh trực tuyến, website thương mại điện tử hoặc website chủ yếu phục vụ giao dịch thương mại. Mô hình chốt đơn bằng tin nhắn vẫn cần xét theo mục đích bán hàng của website.

Workflow đi kèm chạy `node scripts/build-static.cjs --demo`, bắt buộc bản xuất ở chế độ trình diễn, vô hiệu hóa kết nối API/Admin cùng dữ liệu quản trị cục bộ và chỉ triển khai thư mục `dist/`. Các file `admin.html`, tài liệu, script máy tính và mã Google Apps Script không được xuất thành trang web công khai.

Xem từng bước trong **[docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md)**. Tài liệu cũng có phương án dùng Cloudflare Pages với tên miền `pages.dev` nếu sau này bạn muốn chọn hosting khác. Mã nguồn vẫn có thể để trên GitHub.

## Các lệnh tùy chọn

Chạy tại thư mục `WebShop100` bằng Node hiện có:

```bash
# Chạy trên localhost.
node scripts/local-server.cjs --open

# Tạo bản frontend theo config nguồn cho hosting tĩnh phù hợp.
node scripts/build-static.cjs

# Tạo bản demo dành cho GitHub Pages.
node scripts/build-static.cjs --demo

# Kiểm tra bộ xử lý request local và chọn cổng, không mở socket.
node tests/server.test.cjs
```

Các lệnh tương ứng cũng có trong `package.json`: `npm start`, `npm run build`, `npm run build:demo`, `npm run test:server`.

Chạy `npm test` để kiểm tra nghiệp vụ giỏ hàng/tìm kiếm, server local, backend Google giả lập, liên kết sản phẩm và thanh liên hệ nhanh. Không cần cài package cho các bài kiểm tra được đóng gói.

## File cần biết

| File/thư mục | Vai trò |
| --- | --- |
| `CHAY_TREN_MAC.command` | File nhấp đúp để mở website trên Mac |
| `index.html` | Giao diện khách hàng |
| `admin.html` | Giao diện quản trị thử trên máy |
| `assets/css/` | CSS của giao diện |
| `assets/js/config.js` | Cấu hình kết nối và chế độ demo |
| `assets/js/data.js` | Dữ liệu mẫu |
| `assets/js/core.js` | Logic dữ liệu, tìm kiếm, lọc, giỏ hàng |
| `assets/js/app.js` | Tương tác và hiển thị giao diện khách hàng |
| `assets/js/contact-bar.js` | Hiển thị thanh Zalo/Messenger/Gọi điện từ cấu hình shop |
| `assets/css/contact-bar.css` | Bố cục thanh liên hệ trên máy tính và điện thoại |
| `assets/` | Ảnh, font và tài nguyên frontend |
| `apps-script/` | Mã Admin và Public API để triển khai trên tài khoản Google của bạn |
| `scripts/` | Server chạy local và script tạo bản public |
| `.github/workflows/pages.yml` | Tự đưa bản demo lên GitHub Pages khi push nhánh `main` |
| `docs/` | Hướng dẫn chạy máy và triển khai |
| `docs/SHARE_AND_CONTACT.md` | Cách dùng liên kết sản phẩm và cấu hình thanh liên hệ nhanh |
| `docs/PRODUCT_GALLERY.md` | Cách xem tối đa 4 ảnh, quản lý ảnh trong Admin và thử bộ ảnh mẫu |

## Phạm vi kiểm tra

Các kiểm tra tự động của bộ chạy local dùng request giả lập để xác minh đường dẫn, MIME type, phương thức HTTP, chặn truy cập ngoài các file public và chọn cổng khi bận. Chúng không thay cho kiểm tra trực tiếp bằng Finder/macOS hoặc kiểm tra tài khoản Google Sheets/Cloudinary thực của bạn.

Source 1.2.0 đã vượt qua **144/144 kiểm tra bằng Node** và **215/215 kiểm tra tích hợp DOM mô phỏng**, gồm các hành vi cũ, liên kết sản phẩm, thanh liên hệ và thư viện 4 ảnh. Chi tiết phạm vi và giới hạn kiểm tra: [docs/FEATURES_AND_TESTS.md](docs/FEATURES_AND_TESTS.md). Công cụ kiểm tra DOM được dùng riêng khi bàn giao, không nằm trong các dependency hay bộ kiểm tra cần cài của dự án.

Tham chiếu hosting được đối chiếu ngày **19/10/2026**; kiểm tra lại điều khoản và hạn mức dịch vụ trước khi đưa website dùng thật vào hoạt động.
