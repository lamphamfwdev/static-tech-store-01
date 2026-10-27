# Đưa bản demo lên GitHub Pages

## 1. Xác định phạm vi dùng GitHub Pages

Dự án hỗ trợ chạy frontend tĩnh tại địa chỉ miễn phí dạng **`https://TEN_TAI_KHOAN.github.io/TEN_REPOSITORY/`**. Tuy nhiên, GitHub nêu rõ Pages không được dùng làm hosting miễn phí cho kinh doanh trực tuyến, website thương mại điện tử hoặc website chủ yếu hỗ trợ giao dịch thương mại. Xem [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

Vì vậy, workflow của dự án này đưa lên **bản demo giao diện và chức năng**. Chức năng sao chép nội dung đơn mẫu vẫn giúp xem luồng thao tác; các nút mở kênh nhận đơn thật bị khóa bởi `demoMode`. Cấu hình chạy của bản xuất cũng vô hiệu hóa kết nối API/Admin và dữ liệu quản trị cục bộ.

Bản cập nhật có liên kết sản phẩm dạng `#product=p003`; khi mở từ địa chỉ Pages, website vẫn tải trang chính và tự mở popup sản phẩm. Nút **Sao chép liên kết** hoạt động trong bản demo. Thanh liên hệ nhanh Zalo/Messenger/Gọi điện vẫn ở trạng thái xem thử vì workflow bật `demoMode: true`. Xem [hướng dẫn hai tính năng](SHARE_AND_CONTACT.md).

Bạn có thể lưu mã nguồn shop trên GitHub và dùng một dịch vụ hosting khác cho website bán hàng thực tế. Việc đổi tên nút hoặc chuyển sang chốt đơn bằng tin nhắn không tự làm một website bán hàng trở thành bản demo.

## 2. Tạo repository

1. Đăng nhập [github.com](https://github.com/).
2. Chọn **New repository**.
3. Đặt tên, ví dụ **`webshop100`**.
4. Chọn **Public** nếu dùng GitHub Free cho Pages.
5. Đưa các file trong thư mục WebShop100 vào **gốc repository**, để `index.html`, `assets/` và `.github/` ở cấp đầu tiên.

Có thể dùng GitHub Desktop để tạo repository từ thư mục đã giải nén rồi Publish. Khi dùng công cụ tải file trên website GitHub, kiểm tra cả **`.github/workflows/pages.yml`** có trong repository; Finder mặc định có thể ẩn thư mục bắt đầu bằng dấu chấm. Trên Finder, **Command + Shift + .** giúp hiện các file/thư mục ẩn khi cần chọn chúng.

Không tải các khóa bí mật hoặc file cấu hình tài khoản thật lên repository. Các secret của Apps Script/Cloudinary nằm trong Script Properties của Apps Script, không nằm trong frontend. `.gitignore` có mẫu bỏ qua file `.env` và một số file thông tin xác thực thông dụng, nhưng vẫn cần xem danh sách file trước khi commit.

## 3. Bật GitHub Pages

1. Vào repository → **Settings → Pages**.
2. Trong **Build and deployment → Source**, chọn **GitHub Actions**.
3. Mở tab **Actions**.
4. Chọn workflow **Publish demo to GitHub Pages**.
5. Nếu workflow chưa chạy sau lần push, chọn **Run workflow**, nhánh **main**, rồi chạy.
6. Chờ workflow hoàn tất. Địa chỉ đã xuất hiện trong kết quả deployment và **Settings → Pages**.

Tham chiếu: [cấu hình nguồn xuất bản](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) và [custom workflows cho Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Nếu repository dùng nhánh `master` hoặc tên khác, đổi `branches: [main]` trong `.github/workflows/pages.yml` thành tên nhánh đó. Không cần đổi URL của ảnh/CSS/JavaScript khi tên repository thay đổi vì frontend sử dụng đường dẫn tương đối.

## 4. Địa chỉ sẽ là gì?

| Cách đặt repository | Địa chỉ minh họa |
| --- | --- |
| Tài khoản `lam-dev`, repository `webshop100` | `https://lam-dev.github.io/webshop100/` |
| Repository đặc biệt tên `lam-dev.github.io` trong tài khoản `lam-dev` | `https://lam-dev.github.io/` |

Đây là ví dụ định dạng, không phải địa chỉ đã được tạo cho bạn. Với repository đặc biệt, tên phải khớp tên tài khoản. Xem [About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages).

## 5. Workflow thực hiện gì?

Khi push lên `main` hoặc bấm **Run workflow**, GitHub Actions:

1. Lấy mã nguồn.
2. Chạy `node scripts/build-static.cjs --demo` bằng Node có sẵn trên runner GitHub.
3. Tạo thư mục `dist/` gồm `index.html`, tài nguyên frontend trong `assets/` và `.nojekyll`.
4. Trong cấu hình chạy của bản xuất, đặt `window.SHOP_CONFIG.demoMode = true`, `apiUrl = ""`, `adminUrl = ""`, `useLocalAdminData = false`; file nguồn trong repository được giữ nguyên.
5. Upload **chỉ `dist/`** và xuất bản lên GitHub Pages.

Không cần khóa deploy riêng; workflow dùng quyền Pages/OIDC tiêu chuẩn của GitHub Actions. Các phiên bản action dùng theo tài liệu chính thức được đối chiếu ngày 19/10/2026: `checkout@v6`, `configure-pages@v5`, `upload-pages-artifact@v4`, `deploy-pages@v4`.

`admin.html`, script admin demo, mã Google Apps Script, tài liệu và launcher Mac không nằm trong bản website được xuất. Vì repository Public vẫn công khai toàn bộ **mã nguồn repository**, việc bỏ một file khỏi `dist/` không làm file đó thành bí mật.

## 6. Cập nhật về sau

- Chỉnh giao diện/dữ liệu mẫu trên máy, kiểm tra local, rồi commit và push lên nhánh `main`. Workflow tự xuất bản bản demo mới.
- Sửa trong `admin.html` local chỉ thay đổi dữ liệu của trình duyệt hiện tại; không tự commit lên GitHub và không tự thay đổi website demo của người khác.
- Khi cần đưa dữ liệu shop thật lên một hosting khác, cấu hình kết nối Apps Script trong mã nguồn và sử dụng bản build thường theo phần tiếp theo.

## 7. Phương án hosting khác với địa chỉ `pages.dev`

Cloudflare Pages có gói Free cho frontend tĩnh và hỗ trợ tải thư mục website đã build; mỗi dự án có địa chỉ `*.pages.dev`. Xem [giá và giới hạn](https://developers.cloudflare.com/pages/functions/pricing/), [hạn mức Pages](https://developers.cloudflare.com/pages/platform/limits/) và [hướng dẫn Static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/). Gói miễn phí vẫn chịu điều khoản và hạn mức của nhà cung cấp.

Nếu chọn **Direct Upload**:

1. Hoàn tất thông tin cửa hàng, URL liên hệ và [cấu hình Google Apps Script](SETUP_ADMIN.md) khi bạn cần dữ liệu chung giữa nhiều máy.
2. Đặt `demoMode: false` trong `assets/js/config.js` khi website đã sẵn sàng dùng thật trên hosting phù hợp.
3. Tại thư mục dự án, chạy:

   ```bash
   node scripts/build-static.cjs
   ```

   Lệnh tương đương là **`npm run build`**. Bản build thường dùng đúng `apiUrl`, `adminUrl`, `demoMode` từ cấu hình nguồn. Chỉ lệnh `npm run build:demo` / tham số `--demo` ép chế độ demo và vô hiệu hóa kết nối để xuất bản trên GitHub Pages.

4. Trong Cloudflare, mở **Workers & Pages** và tạo dự án Pages bằng phương thức **Direct Upload / Upload assets** theo [hướng dẫn chính thức](https://developers.cloudflare.com/pages/get-started/direct-upload/).
5. Tải **thư mục `dist/`** đã tạo lên. Đặt tên dự án và xuất bản.
6. Dùng địa chỉ `TEN_DU_AN.pages.dev` mà Cloudflare cấp.

Không tải nguyên thư mục code hoặc file ZIP dự án gốc lên hosting; chỉ tải thư mục `dist/`. Admin dùng thật được triển khai riêng trên Google Apps Script và giới hạn tài khoản truy cập.

Theo tài liệu Cloudflare, dự án tạo bằng Direct Upload không chuyển trực tiếp sang Git integration được. Nếu muốn tự triển khai mỗi lần push GitHub ngay từ đầu, chọn **Git integration**, đặt build command **`node scripts/build-static.cjs`**, output directory **`dist`**. Xem [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/).

## 8. Khi trang không hiển thị đúng

| Vấn đề | Kiểm tra |
| --- | --- |
| Workflow không tự chạy | Nhánh có đúng `main` không; `.github/workflows/pages.yml` có trong repository không. |
| Configure Pages báo lỗi | **Settings → Pages → Source** đã chọn **GitHub Actions** chưa; tài khoản có quyền quản trị repository không. |
| 404 ở địa chỉ Pages | Lấy đúng URL trong kết quả deployment, có phần tên repository nếu đó là project site. |
| Trang tải được nhưng mất ảnh/CSS | Xem `assets/` có được commit đầy đủ và nằm cùng cấp với `index.html` không; tên file trên GitHub phân biệt chữ hoa/chữ thường. |
| Bản mới chưa xuất hiện | Chờ workflow thành công, rồi tải lại trang bằng **Command + Shift + R**. |
| Không vào được `/admin.html` trên Pages | Đây là chủ đích của bản public; dùng Admin demo local hoặc Admin Google Apps Script đã triển khai riêng. |
| Nút mở kênh nhận đơn hiển thị chế độ demo | GitHub Pages build luôn bật demo. Dùng hosting phù hợp cho website bán hàng thật. |
| Gửi link sản phẩm nhưng người nhận không mở được | Sao chép từ URL Pages đã xuất bản, không dùng link `localhost`, `127.0.0.1` hoặc `file://` trên máy. |
