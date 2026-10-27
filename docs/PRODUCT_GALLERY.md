# Thư viện tối đa 4 ảnh sản phẩm

Bản **WebShop100 1.2.0**, cập nhật ngày **21/10/2026**, cho mỗi sản phẩm sử dụng tối đa **4 ảnh tổng cộng: 1 ảnh đại diện và 3 ảnh phụ**. Thư viện nằm ngay trong popup chi tiết sản phẩm, cùng vị trí ảnh của giao diện hiện có.

## 1. Khách xem các ảnh như thế nào?

Nhấp vào ảnh hoặc tên sản phẩm để mở chi tiết. Khi sản phẩm có từ 2 đến 4 ảnh, khách có thể dùng:

| Cách thao tác | Kết quả |
| --- | --- |
| Bấm một ảnh thu nhỏ | Chuyển ảnh lớn tới đúng ảnh đã chọn; ảnh thu nhỏ đang chọn được đánh dấu |
| Bấm nút ảnh trước/ảnh sau | Chuyển lần lượt theo thứ tự ảnh; từ ảnh cuối chuyển tiếp sẽ về ảnh đầu, và ngược lại |
| Phím mũi tên trái/phải khi focus đang trong vùng ảnh | Chuyển ảnh; thao tác này không áp dụng cho ô nhập số lượng ở ngoài vùng ảnh |
| Vuốt ngang trên ảnh | Chuyển ảnh trên màn hình cảm ứng; vẫn có thể cuộn trang theo chiều dọc |

Bộ đếm hiển thị vị trí hiện tại, ví dụ **Ảnh 1 / 4**, **Ảnh 2 / 4**. Khi mở một sản phẩm khác, thư viện bắt đầu từ ảnh đại diện của sản phẩm đó.

Nếu chỉ có **1 ảnh**, website hiển thị ảnh đó và ẩn các điều khiển chuyển ảnh. Nếu chưa có ảnh, website dùng ảnh dự phòng; không tạo thêm các ảnh phụ giả. Giới hạn 4 ảnh áp dụng cả khi mở sản phẩm từ danh sách lẫn từ liên kết `#product=...`.

## 2. Thêm hoặc thay ảnh trong Admin

1. Chạy dự án rồi mở **Quản trị** ở cùng địa chỉ với website. Với cổng mặc định, trang quản trị local là `http://127.0.0.1:4173/admin.html`.
2. Vào **Sản phẩm**, bấm **Sửa** tại sản phẩm cần cập nhật. Có thể dùng **Thêm sản phẩm** để tạo mới.
3. Tìm phần **Ảnh sản phẩm**. Có **4 ô** và bộ đếm số ảnh đã chọn.
4. Tại mỗi ô, chọn một trong hai cách:
   - **Chọn ảnh:** chọn file trên máy, kéo/zoom/xoay trong khung cắt rồi bấm **Dùng ảnh này**.
   - **Nhập URL:** điền URL ảnh bắt đầu bằng `https://` hoặc đường dẫn ảnh trong dự án, chẳng hạn `assets/images/iphone-detail-1.jpg`.
5. Dùng nút **Gỡ ảnh** tại ô nếu muốn bỏ ảnh đó khỏi sản phẩm.
6. Bấm **Lưu sản phẩm**. Quay lại website và tải lại trang để xem kết quả.

Chọn hoặc cắt xong ảnh chưa phải là lưu sản phẩm. Cần bấm **Lưu sản phẩm** để dữ liệu được áp dụng.

### Thứ tự và ảnh đại diện

Các ảnh giữ thứ tự từ trái sang phải trong Admin. Khi lưu, các ô trống được bỏ; **ảnh đầu tiên còn lại là ảnh đại diện** trên danh sách sản phẩm và là ảnh đầu tiên trong popup.

Ví dụ: nếu ô đầu trống, ô thứ hai và thứ tư có ảnh, sau khi lưu sản phẩm có 2 ảnh. Ảnh ở ô thứ hai trước đó trở thành ảnh đại diện; ảnh ở ô thứ tư trở thành ảnh phụ tiếp theo.

Admin cung cấp đúng 4 ô. Dữ liệu nhập hoặc dữ liệu cũ có nhiều hơn 4 ảnh được giới hạn ở 4 ảnh đầu tiên còn lại sau khi bỏ ô trống. Đọc dữ liệu Google Sheets không tự ghi lại ô dữ liệu; khi lưu sản phẩm hoặc nhập dữ liệu, giới hạn mới được áp dụng trong dữ liệu lưu.

### Chọn file, cắt ảnh và nơi lưu

| Nội dung | Quy tắc hiện có |
| --- | --- |
| Số ảnh mỗi sản phẩm | Tối đa 4 ảnh tổng cộng |
| File chọn từ máy | JPG, PNG, WebP, AVIF, HEIC/HEIF |
| Dung lượng file gốc | Tối đa 25 MB/ảnh |
| Ảnh qua khung cắt | Xuất JPEG vuông 1200 × 1200 px |
| Admin local | Ảnh và dữ liệu thử được lưu trong trình duyệt đang dùng |
| Admin Google Apps Script | Ảnh tải lên Cloudinary sau khi cấu hình; Google Sheets lưu URL |

Gỡ ảnh khỏi một sản phẩm chỉ bỏ tham chiếu tới ảnh. Thao tác đó không tự xóa file đã tải lên Cloudinary. Hướng dẫn thiết lập và các trường hợp HEIC/HEIF nằm trong **[SETUP_ADMIN.md](SETUP_ADMIN.md)**.

## 3. Bộ 4 ảnh mẫu để thử ngay

Sản phẩm **Apple iPhone 16**, ID **`p002`**, trong dữ liệu mẫu có 4 ảnh:

| Thứ tự | File |
| --- | --- |
| 1 — ảnh đại diện | `assets/images/iphone.jpg` |
| 2 | `assets/images/iphone-detail-1.jpg` |
| 3 | `assets/images/iphone-detail-2.jpg` |
| 4 | `assets/images/iphone-detail-3.jpg` |

Các file ảnh nằm sẵn trong dự án. Chúng là ảnh minh họa để thử giao diện, không phải ảnh sản phẩm chính thức. Toàn bộ dự án hiện có 9 file JPEG; nguồn và phạm vi sử dụng ảnh được ghi ở **[IMAGE_CREDITS.md](IMAGE_CREDITS.md)**.

Nếu bạn đã lưu danh mục bằng **Admin local**, website ưu tiên danh mục đã lưu đó, nên sản phẩm có thể vẫn giữ số ảnh cũ. Khi đã cấu hình API, website lấy ảnh từ dữ liệu API. Cập nhật ảnh qua đúng Admin đang dùng; **không cần xóa dữ liệu đã lưu để áp dụng tính năng mới**.

Muốn thêm bộ ảnh mẫu vào sản phẩm đang có, có thể dùng **Nhập URL** tại ba ô phụ với các đường dẫn trong bảng rồi lưu. Muốn đưa dữ liệu đã chỉnh bằng Admin local lên website tĩnh, bấm **Sản phẩm → Xuất data.js cho website**, thay `assets/js/data.js` và tạo lại bản public theo hướng dẫn hiện có.

## 4. Zalo, Messenger và Gọi điện cấu hình ở đâu?

Các thông tin này đã có tại **Quản trị → Nội dung shop**:

| Nút ngoài cửa hàng | Trường cần điền trong Admin |
| --- | --- |
| Gọi điện | **Điện thoại** |
| Messenger | **URL Messenger** |
| Zalo cá nhân | **URL Zalo cá nhân** |
| Zalo OA | **URL Zalo OA** — dùng cho nút Zalo khi chưa có URL cá nhân hợp lệ |

Nhập thông tin rồi bấm **Lưu thay đổi** và tải lại cửa hàng. URL cần bắt đầu bằng `https://`; số điện thoại cần có định dạng hợp lệ. Kênh trống hoặc không hợp lệ được ẩn trong chế độ dùng thật. Trường **Kênh mặc định** chọn kênh dùng trong luồng giỏ hàng; thanh liên hệ nhanh cho khách chọn các kênh đã cấu hình.

Bản giao giữ **`demoMode: true`** trong `assets/js/config.js`. Vì vậy, thanh liên hệ đang ở trạng thái xem thử dù đã điền thông tin. Để thử mở các kênh trên bản local hoặc hosting phù hợp, đổi thành **`demoMode: false`**, lưu file rồi tải lại. Workflow GitHub Pages tiếp tục xuất **bản demo** như trước.

Khi website dùng API, chỉnh thông tin qua Admin Apps Script. Admin local chỉ lưu vào trình duyệt tại địa chỉ đang mở. Chi tiết: **[SHARE_AND_CONTACT.md](SHARE_AND_CONTACT.md)**.

## 5. Các trường hợp thường gặp

| Hiện tượng | Cách kiểm tra |
| --- | --- |
| Không thấy ảnh thu nhỏ hoặc nút chuyển ảnh | Sản phẩm hiện có 0 hoặc 1 ảnh; thêm ảnh tại Admin rồi lưu |
| Đã chọn 4 ảnh nhưng cửa hàng vẫn hiện ảnh cũ | Bấm Lưu sản phẩm, tải lại đúng địa chỉ website; nếu dùng API, chờ cache theo hướng dẫn Admin |
| Bản mẫu mới có 4 ảnh nhưng dữ liệu của tôi vẫn có 1 ảnh | Danh mục đã lưu trong Admin local/API được ưu tiên; thêm ảnh vào danh mục đó |
| Gỡ ảnh đầu tiên rồi ảnh đại diện thay đổi | Đây là thứ tự lưu: ảnh đầu tiên còn lại sẽ làm ảnh đại diện |
| Phím trái/phải không đổi ảnh khi đang nhập số lượng | Phím chuyển ảnh chỉ hoạt động khi focus ở vùng ảnh; bấm ảnh thu nhỏ hoặc nút trước/sau để chuyển |
| Điền số điện thoại/URL nhưng nút liên hệ chưa mở | Kiểm tra `demoMode`, trạng thái API và các giá trị ở Nội dung shop |

File chạy trên Mac vẫn là **`CHAY_TREN_MAC.command`**; không cần cài thêm package hoặc đổi phiên bản Node để dùng thư viện ảnh. Xem **[CHAY_TREN_MAC.md](CHAY_TREN_MAC.md)** để chạy dự án.
