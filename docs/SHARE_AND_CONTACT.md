# Chia sẻ sản phẩm và liên hệ nhanh

Bản cập nhật ngày **21/10/2026** bổ sung đúng hai tính năng được chọn trong ảnh yêu cầu. Cách chạy bằng `CHAY_TREN_MAC.command`, dữ liệu sản phẩm, trang quản trị, giỏ hàng và kết nối Google Sheets/Cloudinary tiếp tục dùng như trước.

## 1. Chia sẻ liên kết riêng của sản phẩm

### Cách dùng

1. Mở website, nhấp vào **ảnh hoặc tên sản phẩm**.
2. Trong popup chi tiết, nhấp **Sao chép liên kết**.
3. Dán liên kết vào nơi bạn muốn gửi. Người nhận mở liên kết sẽ vào website và xem chi tiết đúng sản phẩm.

Ví dụ định dạng liên kết khi website đã được xuất bản:

```text
https://TEN_TAI_KHOAN.github.io/TEN_REPOSITORY/#product=p003
```

Tên tài khoản và repository trong ví dụ là chỗ giữ chỗ, không phải địa chỉ đã được tạo. `p003` là ID của sản phẩm MacBook mẫu trong bộ dữ liệu ban đầu. ID có ký tự đặc biệt được mã hóa trong URL; nút sao chép tự tạo liên kết, không cần nhập ID bằng tay.

Phần sau dấu `#` xác định sản phẩm. Website vẫn tải trang `index.html` hiện có nên không cần tạo một file HTML cho mỗi sản phẩm hoặc cấu hình thêm đường dẫn phía server. Đường dẫn thư mục của website được giữ lại, kể cả khi dự án nằm dưới tên repository.

### Các hành vi cần biết

| Trường hợp | Hoạt động |
| --- | --- |
| Sản phẩm còn hiển thị | Mở popup chi tiết đúng sản phẩm, kể cả khi sản phẩm nằm ở trang danh sách khác |
| Sản phẩm hết hàng nhưng vẫn hiển thị | Vẫn xem được chi tiết; quy tắc khóa thêm vào giỏ giữ như trước |
| Sản phẩm đã ẩn, chuyển nháp, lưu trữ hoặc không còn tồn tại | Không hiển thị nội dung sản phẩm đó; website thông báo và cho tiếp tục xem danh mục |
| Website dùng API | Chờ dữ liệu cửa hàng để xác định sản phẩm từ liên kết; không kết luận sản phẩm bị xóa chỉ vì dữ liệu mẫu chưa có ID đó |
| API tải lỗi, website chuyển sang dữ liệu mẫu dự phòng | Giữ URL để có thể tải lại, báo chưa tải được sản phẩm và không tự mở sản phẩm mẫu trùng ID; nút chia sẻ sản phẩm mẫu tạm khóa |
| Dùng nút quay lại/tiến tới của trình duyệt | Popup được đồng bộ với liên kết sản phẩm đang mở |
| Trình duyệt không cho phép sao chép tự động | Dùng phần liên kết được chọn trong popup để sao chép thủ công bằng **⌘C** trên Mac hoặc **Ctrl+C** trên Windows |

Liên kết dựa vào **ID**, không dựa vào tên. Sửa tên, mô tả hoặc giá của sản phẩm hiện có không làm thay đổi liên kết. Nếu xóa sản phẩm rồi tạo một sản phẩm mới, ID mới có thể khác; cần lấy lại liên kết bằng nút sao chép.

### Thử trên máy và gửi cho người khác

| Bạn đang mở website ở đâu? | Liên kết sao chép dùng ở đâu? |
| --- | --- |
| `http://127.0.0.1:4173/` hoặc một cổng local khác | Trên chính máy đang chạy server đó; server cần còn hoạt động |
| `file:///.../WebShop100/index.html` | Trỏ tới đường dẫn file trên máy; không phải liên kết công khai |
| Địa chỉ website đã xuất bản | Có thể gửi cho người khác truy cập website đó |

Để thử ngay trên Mac: chạy dự án, mở một sản phẩm, sao chép liên kết rồi dán vào **tab mới của cùng trình duyệt**. Để chia sẻ qua Internet, mở bản website đã xuất bản rồi lấy liên kết tại đó. Việc sao chép một URL localhost không tự đưa dự án lên mạng.

## 2. Thanh liên hệ nhanh

Thanh gồm **Zalo**, **Messenger** và **Gọi điện**:

- Trên máy tính: nằm ở góc dưới bên phải và luôn dễ truy cập khi cuộn trang.
- Trên màn hình nhỏ: chuyển thành thanh dưới màn hình; nội dung trang có khoảng trống để không bị thanh che.
- Khi mở popup sản phẩm, giỏ hàng hoặc bộ lọc: thanh tạm ẩn để nhường chỗ cho thao tác đang thực hiện.

Thanh dùng lại dữ liệu trong **Nội dung shop**, không cần khai báo một bộ liên hệ khác.

### Cấu hình qua trang quản trị

1. Chạy dự án và mở **Quản trị** tại cùng địa chỉ. Nếu dùng cổng mặc định, đó là `http://127.0.0.1:4173/admin.html`.
2. Chọn **Nội dung shop**.
3. Trong **Thông tin liên hệ**, nhập **Điện thoại** của cửa hàng nếu muốn có nút gọi.
4. Trong **Kênh nhận đơn**, nhập **URL Messenger**, **URL Zalo cá nhân** hoặc **URL Zalo OA** của cửa hàng. Dùng đầy đủ URL bắt đầu bằng `https://`.
5. Chọn **Lưu thay đổi**, quay lại website khách hàng và tải lại.
6. Khi muốn thử các liên hệ đã điền, mở `assets/js/config.js`, đổi `demoMode: true` thành `demoMode: false`, lưu rồi tải lại website. Giữ nguyên các cấu hình còn lại.

Trường **Kênh mặc định** vẫn chọn nơi nhận nội dung đơn ở giỏ hàng. Thanh liên hệ nhanh hiển thị các kênh được cấu hình độc lập với lựa chọn đó, nên khách vẫn có thể tự chọn Zalo, Messenger hoặc gọi điện.

### Các trường dữ liệu được sử dụng

Nếu quản lý dữ liệu trực tiếp bằng mã nguồn, sửa các trường sau trong `window.SHOP_DATA.settings` ở `assets/js/data.js`:

| Trường | Dùng cho |
| --- | --- |
| `phone` | Nút **Gọi điện** |
| `channels.messenger` | Nút **Messenger** |
| `channels.zalo` | Nút **Zalo**, được ưu tiên khi URL hợp lệ |
| `channels.zaloOA` | Dùng cho nút **Zalo** nếu chưa có URL Zalo cá nhân hợp lệ |

Điền số điện thoại và liên kết thật của cửa hàng vào đúng trường. Số điện thoại cần có định dạng số hợp lệ; không dùng các chuỗi ghi chú như “chưa có số”. URL liên hệ cần là URL HTTPS hợp lệ. Bản cập nhật không điền sẵn số điện thoại hoặc tài khoản của một người khác.

Khi dùng Admin local, dữ liệu đã lưu nằm trong trình duyệt tại địa chỉ/cổng đang dùng. Muốn đưa nội dung đó vào bản frontend tĩnh, sử dụng **Sản phẩm → Xuất data.js cho website**, thay `assets/js/data.js` trong source rồi tạo lại bản public như hướng dẫn cũ. Khi đã kết nối Google Apps Script, thanh lấy các trường liên hệ từ dữ liệu API; thiết lập và phân quyền vẫn theo [SETUP_ADMIN.md](SETUP_ADMIN.md).

### Trạng thái hiển thị

| Trạng thái website | Thanh liên hệ |
| --- | --- |
| `demoMode: true` | Cho xem giao diện các nút; chưa mở liên hệ thật |
| Đang tải API hoặc đang dùng dữ liệu mẫu dự phòng | Tạm khóa liên hệ trực tiếp |
| Chế độ dùng thật, có thông tin hợp lệ | Hiển thị các nút liên hệ đã cấu hình |
| Chế độ dùng thật, một kênh bỏ trống hoặc không hợp lệ | Ẩn riêng kênh đó |
| Chế độ dùng thật, không có kênh hợp lệ | Ẩn toàn bộ thanh |

Messenger và Zalo mở liên kết đã cấu hình; nút Gọi điện mở trình xử lý cuộc gọi của thiết bị. Người dùng tự thực hiện việc liên hệ, gửi tin nhắn hoặc xác nhận cuộc gọi. Không có thao tác tự gửi tin nhắn.

## 3. Khi đưa lên GitHub Pages

Workflow có sẵn tiếp tục xuất **bản demo**. Sao chép liên kết và mở popup sản phẩm vẫn dùng được với URL website đã xuất bản. Thanh liên hệ nhanh vẫn ở chế độ xem thử vì bản build `--demo` bật `demoMode: true`.

Hai tính năng nằm trong frontend tĩnh, dùng các file có sẵn của bản public; không cần thêm database, dịch vụ API hoặc thư viện mới. Hướng dẫn workflow và phạm vi hosting nằm trong [GITHUB_PAGES.md](GITHUB_PAGES.md).

## 4. Xử lý nhanh

| Vấn đề | Cách kiểm tra |
| --- | --- |
| Gửi liên kết nhưng máy khác không mở được | Kiểm tra liên kết có đang là `127.0.0.1`, `localhost` hoặc `file://` không; lấy lại liên kết từ bản đã xuất bản |
| Liên kết báo không tìm thấy sản phẩm | Kiểm tra sản phẩm còn hiển thị và ID có thuộc danh mục hiện tại không; nếu dùng API, kiểm tra thông báo tải dữ liệu |
| Không sao chép tự động được | Sao chép phần liên kết được chọn bằng ⌘C/Ctrl+C; dùng localhost thay cho mở file trực tiếp nếu trình duyệt hạn chế Clipboard |
| Thấy thanh nhưng không bấm liên hệ được | Kiểm tra trạng thái demo, thông báo đang tải API hoặc đang dùng dữ liệu mẫu dự phòng |
| Một nút liên hệ biến mất | Kiểm tra giá trị tương ứng trong Nội dung shop; kênh trống hoặc không hợp lệ được ẩn trong chế độ dùng thật |
| Đã sửa `data.js` nhưng vẫn thấy liên hệ cũ | Có thể trình duyệt đang dùng dữ liệu đã lưu từ Admin local; sửa trong Admin hiện tại hoặc dùng bản public đã xuất từ dữ liệu mới |
| Không thấy thay đổi sau khi push | Chờ bản build hoàn tất, rồi tải lại bằng **Command + Shift + R**; kiểm tra đúng URL triển khai |
