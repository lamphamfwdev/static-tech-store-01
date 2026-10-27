# Chạy WebShop100 trên MacBook

## 1. Mở website

1. Tải và giải nén file ZIP. Đừng chạy các file khi chúng còn nằm bên trong trình xem ZIP.
2. Mở thư mục **WebShop100** đã giải nén.
3. Nhấp đúp **`CHAY_TREN_MAC.command`**.
4. Trình duyệt mặc định mở website. Terminal hiển thị địa chỉ, ví dụ `http://127.0.0.1:4173/`.

Giữ Terminal mở trong khi sử dụng. Để dừng, quay lại Terminal và nhấn **Ctrl+C**. Muốn chạy lần sau, nhấp đúp file `.command` lại.

## 2. File chạy thực hiện gì?

File chạy xác định đúng thư mục dự án, tìm Node có sẵn trên máy rồi chạy một server tĩnh nhỏ bằng thư viện chuẩn Node. Server chỉ nghe trên **127.0.0.1** của máy bạn. Khi cổng 4173 đã được chương trình khác dùng, nó chọn cổng khác; không dừng chương trình đang giữ cổng.

Node từ phiên bản **14** được hỗ trợ. Chương trình tìm Node trong PATH, Homebrew, `/usr/local/bin`, các bản Node đã cài bằng nvm và Volta. Việc tìm kiếm này không chạy `nvm use`, không cài package và không đổi cấu hình Node của máy.

Nếu không tìm được Node phù hợp, file chạy mở `index.html` trực tiếp. Vì frontend dùng JavaScript thường và dữ liệu mẫu có sẵn, bạn vẫn xem và thử giao diện mà không cần cài thêm công cụ. Trình duyệt có thể áp dụng giới hạn riêng với Clipboard API hoặc `localStorage` khi mở bằng `file://`; dùng localhost để thử những phần này ổn định hơn.

## 3. Mở quản trị mẫu

Sau khi website chạy, mở đường dẫn **`admin.html`** tại cùng địa chỉ:

```text
http://127.0.0.1:4173/admin.html
```

Nếu Terminal hiển thị cổng khác, thay `4173` bằng đúng cổng đó. Đây là dữ liệu quản trị thử trong trình duyệt, không phải dữ liệu chia sẻ giữa nhiều máy. Giữ nguyên một địa chỉ/cổng khi muốn dùng lại dữ liệu đã lưu.

## 4. Các trường hợp thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Nhấp đúp `.command` mở trình sửa văn bản | Trong Finder, bấm phải file → **Open With/Mở bằng → Terminal**. |
| Thông báo không có quyền thực thi | Cấp quyền cho đúng file theo bước phía dưới, rồi mở lại. |
| macOS yêu cầu xác nhận trước khi mở | Xem lại file trong thư mục đã giải nén, dùng **Open/Mở** trong menu bấm phải hoặc xác nhận mở nếu macOS cung cấp lựa chọn đó. Không cần tắt cơ chế bảo vệ của hệ điều hành. |
| Trình duyệt không tự mở | Sao chép địa chỉ `http://127.0.0.1:.../` Terminal đã in vào thanh địa chỉ trình duyệt. |
| Không tìm thấy `index.html` | Giải nén lại toàn bộ dự án; giữ `.command`, `index.html`, `assets/` và `scripts/` trong cùng cấu trúc thư mục. |
| Không thấy dữ liệu admin vừa sửa | Kiểm tra đang dùng cùng trình duyệt, cùng địa chỉ và cùng cổng. Dữ liệu localhost và mở file trực tiếp được lưu riêng. |
| Giỏ hàng bị mất sau khi đóng cửa sổ riêng tư | Chế độ riêng tư có thể xóa dữ liệu khi kết thúc phiên. Dùng cửa sổ trình duyệt thường để giữ dữ liệu. |
| Mở nhiều cửa sổ Terminal chạy cùng dự án | Mỗi cửa sổ có thể dùng một cổng khác nhau. Dừng cửa sổ bạn không dùng bằng Ctrl+C để tránh nhầm dữ liệu giữa các cổng. |

### Cấp quyền thực thi khi cần

File trong ZIP được đóng gói với quyền thực thi. Nếu công cụ giải nén trên máy làm mất quyền này:

1. Mở ứng dụng **Terminal**.
2. Gõ `chmod +x `, có một dấu cách ở cuối.
3. Kéo file `CHAY_TREN_MAC.command` từ Finder vào Terminal để điền đúng đường dẫn.
4. Nhấn Enter; sau đó nhấp đúp file từ Finder.

Ví dụ lệnh sau khi đã điền đường dẫn:

```bash
chmod +x "/Users/ten-ban/Downloads/WebShop100/CHAY_TREN_MAC.command"
```

### Chọn cổng cố định khác

Nếu bạn chủ động muốn dùng cổng 4300, mở Terminal tại thư mục dự án và chạy:

```bash
SHOP_PORT=4300 node scripts/local-server.cjs --open
```

Không cần sửa mã nguồn. Nếu 4300 đang bận, server tiếp tục tìm cổng trống.

## 5. Thay đổi nội dung và xem lại

Với dữ liệu mẫu, chỉnh các file trong dự án rồi tải lại trang. Với Admin mẫu, lưu thay đổi và tải lại website khách hàng ở cùng địa chỉ. Khi dùng Google Sheets thật, làm theo **[SETUP_ADMIN.md](SETUP_ADMIN.md)**.

Không cần build lại để xem local. Lệnh `node scripts/build-static.cjs` chỉ cần khi tạo thư mục `dist/` để tải lên hosting.

## 6. Thử liên kết sản phẩm và thanh liên hệ

Mở chi tiết một sản phẩm rồi chọn **Sao chép liên kết**. Dán vào tab mới trên cùng máy để xác nhận popup tự mở đúng sản phẩm. Liên kết local cần server còn chạy tại đúng cổng; nó không tự trở thành liên kết công khai khi gửi cho máy khác.

Thanh liên hệ xuất hiện ở góc dưới bên phải trên máy tính. Mặc định dự án đang ở chế độ demo nên các nút chưa mở liên hệ thật. Cách nhập số điện thoại, URL Zalo/Messenger và bật chế độ dùng thật được hướng dẫn tại **[SHARE_AND_CONTACT.md](SHARE_AND_CONTACT.md)**. Hai tính năng này không cần cài thêm package hoặc đổi phiên bản Node.

## 7. Thử thư viện tối đa 4 ảnh

Trong bản 1.2.0, mở sản phẩm **Apple iPhone 16** mẫu để xem 4 ảnh. Chuyển bằng ảnh thu nhỏ, nút trước/sau hoặc phím mũi tên khi focus đang ở vùng ảnh. Trên màn hình cảm ứng, vuốt ngang trên ảnh để chuyển; bộ đếm hiển thị dạng **Ảnh 1 / 4**.

Để thêm ảnh của bạn: **Quản trị → Sản phẩm → Sửa → Ảnh sản phẩm**. Có 4 ô gồm 1 ảnh đại diện và 3 ảnh phụ. Mỗi ô cho chọn file từ máy rồi cắt ảnh, hoặc **Nhập URL**; sau đó bấm **Lưu sản phẩm** và tải lại cửa hàng ở cùng địa chỉ.

Nếu Admin local đã có dữ liệu, bộ dữ liệu đó được ưu tiên và số ảnh cũ vẫn có thể xuất hiện. Thêm ảnh qua Admin thay vì xóa dữ liệu đang dùng chỉ để thử ảnh mẫu. Chi tiết và đường dẫn các ảnh mẫu: **[PRODUCT_GALLERY.md](PRODUCT_GALLERY.md)**.

Zalo, Messenger và Gọi điện được cấu hình ở **Quản trị → Nội dung shop**, trong các trường **URL Zalo cá nhân/URL Zalo OA**, **URL Messenger** và **Điện thoại**. Chế độ xem thử vẫn được bật mặc định như bản trước.
