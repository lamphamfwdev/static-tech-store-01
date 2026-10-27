# Cài đặt Admin, Google Sheets và Cloudinary

Tài liệu này dùng cho bộ mã nguồn **WebShop100** đi kèm. Website khách hàng chạy tĩnh; phần quản trị thật dùng Google Apps Script, dữ liệu lưu trong Google Sheets và ảnh tải lên Cloudinary. Không có PHP, MySQL hoặc máy chủ riêng cần thuê.

## 1. Chọn cách quản lý dữ liệu

| Cách dùng | Dữ liệu lưu ở đâu? | Khi nào phù hợp? |
| --- | --- | --- |
| Admin local tại `admin.html` | `localStorage` của đúng trình duyệt và địa chỉ đang mở | Dùng thử, chỉnh giao diện, chuẩn bị dữ liệu ban đầu |
| Xuất `data.js` từ Admin local | File `assets/js/data.js` trong dự án | Danh mục ít thay đổi; cập nhật file rồi đưa lên GitHub |
| Admin Google Apps Script | Ba sheet `Products`, `Settings`, `PriceFilters` | Shop cần sửa sản phẩm/nội dung online mà không cập nhật mã frontend mỗi lần |

**Admin local không phải đăng nhập quản trị online.** Khách mở `/admin.html` chỉ thay đổi bộ nhớ riêng trong trình duyệt của họ, không sửa Google Sheets hoặc dữ liệu của chủ shop. Không điền khóa bí mật vào `config.js` hoặc vào bất kỳ file public nào.

Khi bật API, cửa hàng lấy dữ liệu từ API. Thay đổi trong Admin local không ghi vào API. Muốn thay đổi dữ liệu thật, mở đúng URL Admin Apps Script.

## 2. Dùng Admin local trước

1. Chạy dự án theo `README.md` rồi mở `admin.html` trên cùng địa chỉ local với cửa hàng.
2. Thêm/sửa sản phẩm, chỉnh nội dung shop và khoảng giá.
3. Bấm **Lưu** tại mục đang chỉnh.
4. Tải lại trang cửa hàng để xem thay đổi.

Địa chỉ `localhost`, `127.0.0.1`, cổng khác nhau và cách mở `file://` có vùng `localStorage` khác nhau. Dùng nhất quán địa chỉ mà file chạy local tự mở. Chế độ ẩn danh/xóa dữ liệu trình duyệt có thể làm mất các thay đổi local.

### Quản lý tối đa 4 ảnh cho mỗi sản phẩm

Từ bản **1.2.0**, mở **Sản phẩm → Sửa** để thấy **4 ô ảnh** và bộ đếm số ảnh đã chọn: 1 ảnh đại diện, 3 ảnh phụ. Bấm vào một ô để chọn file, chỉnh khung cắt rồi chọn **Dùng ảnh này**; hoặc dùng **Nhập URL** để điền URL HTTPS/đường dẫn `assets/`. Bấm **Lưu sản phẩm** để áp dụng.

Các ô trống được bỏ khi lưu; ảnh đầu tiên còn lại làm ảnh đại diện, các ảnh khác giữ đúng thứ tự. Dữ liệu cũ có nhiều hơn 4 ảnh chỉ được trả về tối đa 4 ảnh; việc đọc không tự sửa Google Sheets. Khi lưu sản phẩm hoặc nhập dữ liệu, giới hạn 4 ảnh được áp dụng ở cả Admin và server. Xem hướng dẫn đầy đủ tại **[PRODUCT_GALLERY.md](PRODUCT_GALLERY.md)**.

### Cấu hình Zalo, Messenger và Gọi điện

Mở **Nội dung shop**, nhập **Điện thoại** trong phần thông tin liên hệ; nhập **URL Messenger**, **URL Zalo cá nhân** hoặc **URL Zalo OA** trong phần kênh nhận đơn, rồi bấm **Lưu thay đổi**. Thanh liên hệ nhanh dùng các giá trị này; Zalo cá nhân hợp lệ được ưu tiên trước Zalo OA.

Bản giao vẫn có `demoMode: true` trong `assets/js/config.js`, nên các nút liên hệ đang ở trạng thái xem thử. Để thử các kênh đã cấu hình trên local hoặc hosting phù hợp, đổi thành `demoMode: false` và tải lại. Workflow GitHub Pages tiếp tục xuất bản demo như trước. Khi đã bật API, chỉnh thông tin trong Admin Apps Script; Admin local chỉ thay đổi dữ liệu của trình duyệt đang dùng. Xem **[SHARE_AND_CONTACT.md](SHARE_AND_CONTACT.md)**.

### Đưa dữ liệu local vào mã nguồn

Trong mục **Sản phẩm**, bấm **Xuất data.js cho website**. Chép file tải về để thay `assets/js/data.js`, rồi cập nhật repository. File xuất chỉ chứa sản phẩm đang hiển thị, không nháp, không lưu trữ và các bộ lọc giá đang bật.

Nút **Xuất dữ liệu JSON** tạo bản sao đầy đủ, bao gồm sản phẩm ẩn/nháp/lưu trữ. Giữ file sao lưu này riêng; không đưa lên website công khai nếu nó chứa nội dung chưa muốn công bố.

Nút **Nhập dữ liệu JSON** trong bản local thay dữ liệu hiện có sau khi bạn xác nhận. Bộ nhớ trình duyệt có giới hạn; nếu lưu nhiều ảnh lớn và nhận báo không đủ bộ nhớ, dùng Cloudinary và Google Sheets. Thao tác gặp lỗi quota sẽ không được báo lưu thành công.

## 3. Sơ đồ triển khai

| Thành phần | Mã nguồn | Quyền truy cập |
| --- | --- | --- |
| Website khách hàng | `index.html`, `assets/` | Công khai |
| Admin Apps Script | `apps-script/admin/Code.gs`, `Admin.html`, `appsscript.json` | Mặc định chỉ chủ shop |
| Public API Apps Script | `apps-script/public-api/Code.gs`, `appsscript.json` | Bất kỳ ai; chỉ trả dữ liệu được phép hiển thị |
| Google Sheets | Do bạn tạo | Giữ private; cấp quyền cho các tài khoản quản trị cần thiết |
| Cloudinary | Tài khoản của bạn | Ảnh sản phẩm có URL công khai; API secret chỉ nằm ở Admin server |

**Tạo hai project Apps Script riêng biệt.** Không dán mã quản trị và mã API vào cùng một project. Public API không chứa hàm lưu sản phẩm, ghi cấu hình, ký upload hoặc API secret.

## 4. Tạo Google Sheets

1. Mở [Google Sheets](https://sheets.google.com/) bằng tài khoản sẽ làm chủ shop.
2. Tạo bảng tính, ví dụ `WebShop100 Data`.
3. Lấy ID trong URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

4. Giữ quyền chia sẻ **Restricted / Bị hạn chế**. Không cần publish bảng tính hoặc bật “Anyone with the link”.

Bạn không phải tạo từng cột bằng tay. Hàm `setupShop` ở bước tiếp theo sẽ tạo cấu trúc. Nếu tên sheet đã tồn tại và có cấu trúc khác, hệ thống báo lỗi để bạn kiểm tra, không tự xóa sheet cũ.

## 5. Cài project Admin

### 5.1. Thêm mã nguồn

1. Mở [Google Apps Script](https://script.google.com/) → **New project**.
2. Đặt tên `WebShop100 Admin`.
3. Thay nội dung `Code.gs` bằng `apps-script/admin/Code.gs`.
4. Bấm dấu **+** cạnh Files → **HTML** → tên **Admin**. Dán toàn bộ `apps-script/admin/Admin.html` vào file đó.
5. Trong **Project Settings**, bật hiển thị file manifest `appsscript.json` rồi thay bằng bản `apps-script/admin/appsscript.json` đi kèm.

File `Admin.html` trong thư mục Apps Script đã gộp HTML/CSS/JavaScript. Không dán `admin.html` ở thư mục gốc vào Apps Script vì bản gốc tham chiếu các file `assets/` trên máy.

### 5.2. Nhập Script Properties

Trong **Project Settings → Script Properties → Add script property**, thêm:

| Property | Giá trị | Bắt buộc |
| --- | --- | --- |
| `SPREADSHEET_ID` | ID bảng tính ở bước 4 | Có |
| `ADMIN_EMAIL` | Email Google của chủ shop, ví dụ `ban@gmail.com` | Có |
| `SHOP_SITE_URL` | URL website, có dấu `/` cuối; ví dụ `https://tenban.github.io/WebShop100/` | Nên có sau khi deploy website |
| `CLOUDINARY_CLOUD_NAME` | Cloud name từ Cloudinary | Khi muốn tải ảnh |
| `CLOUDINARY_API_KEY` | API key từ Cloudinary | Khi muốn tải ảnh |
| `CLOUDINARY_API_SECRET` | API secret từ Cloudinary | Khi muốn tải ảnh |
| `CLOUDINARY_FOLDER` | `webshop100` hoặc thư mục bạn chọn | Không; mặc định `webshop100` |

`ADMIN_EMAIL` có thể chứa nhiều email ngăn cách bằng dấu phẩy. Mục 10 giải thích thêm cách triển khai nhiều quản trị viên. Danh sách email là phần kiểm tra ở server; việc nhập một email vào trình duyệt không cấp quyền cho người đó.

`SHOP_SITE_URL` giúp nút **Xem cửa hàng** và ảnh mẫu có đường dẫn `assets/` hoạt động trong Admin Google. Dùng **URL gốc của site/repository, kết thúc bằng `/`**, ví dụ `https://tenban.github.io/WebShop100/`; không điền đường dẫn kết thúc bằng `index.html`. Thiết lập này cần có để xem đúng các ảnh mẫu tương đối trong Admin Google. Nếu chưa có URL online, ảnh mẫu vẫn xuất hiện ở website local nhưng có thể hiển thị hình chờ trong Admin Apps Script. Ảnh Cloudinary HTTPS không phụ thuộc thiết lập này.

### 5.3. Khởi tạo dữ liệu

1. Quay lại Editor, chọn hàm **setupShop** trên thanh công cụ.
2. Bấm **Run** và cấp quyền Google cho project do chính bạn tạo.
3. Sau khi hoàn thành, bảng tính có ba sheet `Products`, `Settings`, `PriceFilters`.

`setupShop` chỉ tạo sheet/header nếu còn trống, và tạo cấu hình mặc định khi Settings trống. Hàm không ghi đè một danh mục đang có dữ liệu.

### 5.4. Triển khai cho một chủ shop

Chọn **Deploy → New deployment → Web app**:

| Tùy chọn | Giá trị |
| --- | --- |
| Execute as | **Me** / chính tài khoản của bạn |
| Who has access | **Only myself** / chỉ mình tôi |

Bấm **Deploy**, sao chép URL kết thúc bằng `/exec` và mở bằng đúng tài khoản đã khai báo ở `ADMIN_EMAIL`. Đây là URL Admin để bạn quản lý online; nên lưu bookmark.

Google Apps Script phân biệt tài khoản người truy cập và tài khoản thực thi. Email của người truy cập có thể trống ở một số chế độ triển khai. Mã nguồn **từ chối truy cập khi email trống**, không lấy `getEffectiveUser()` thay thế để tránh cấp nhầm quyền của chủ script cho khách. [Tài liệu Session](https://developers.google.com/apps-script/reference/base/session) và [Web Apps](https://developers.google.com/apps-script/guides/web).

## 6. Cấu hình ảnh Cloudinary

1. Đăng nhập [Cloudinary Console](https://console.cloudinary.com/).
2. Lấy **Cloud name**, **API key**, **API secret** của product environment.
3. Điền ba giá trị vào Script Properties của **project Admin**.
4. Tải lại Admin. Thông báo đầu trang sẽ hiện Cloudinary đã kết nối.
5. Mở một sản phẩm → chọn ảnh → kéo/zoom/xoay → **Dùng ảnh này** → **Lưu sản phẩm**.

Luồng xử lý:

1. Trình duyệt đọc và cắt ảnh; ảnh gốc chưa được tải lên khi bạn đang chỉnh.
2. Admin gọi `adminUploadSignature` bằng `google.script.run`.
3. Server kiểm tra email, tạo `timestamp`, `public_id`, thư mục ảnh và chữ ký SHA-256.
4. Trình duyệt gửi ảnh đã cắt cùng chữ ký trực tiếp tới Cloudinary.
5. Cloudinary trả URL HTTPS; bấm lưu sản phẩm/nội dung để ghi URL vào Sheets.

API secret không nằm trong HTML, `config.js`, GitHub hoặc dữ liệu API công khai. Chữ ký do server tạo chỉ cho các tham số server đã chọn; trình duyệt không được yêu cầu ký tùy ý. Cách gửi ảnh có chữ ký được mô tả trong [Cloudinary client-side uploading](https://cloudinary.com/documentation/client_side_uploading) và [authentication signatures](https://cloudinary.com/documentation/authentication_signatures).

Không cần tạo unsigned upload preset cho bộ mã nguồn này. Không chia sẻ API secret. Người có quyền chỉnh project Apps Script có thể đọc Script Properties, vì vậy chỉ cấp quyền chỉnh project cho người bạn tin cậy.

### Định dạng và khung cắt ảnh

| Mục | Đầu ra |
| --- | --- |
| Ảnh sản phẩm | JPEG, vuông 1200 × 1200 px; tối đa 4 ảnh (1 đại diện + 3 phụ) |
| Logo tải mới | JPEG, vuông 1200 × 1200 px |
| Hero tải mới | JPEG, 1920 × 1080 px, tỷ lệ 16:9 |

Định dạng chọn vào: JPG, PNG, WebP, AVIF, HEIC/HEIF; tối đa 25 MB cho một file gốc. PNG trong suốt khi đi qua khung cắt được đặt nền trắng để xuất JPEG. Nếu cần giữ logo SVG/PNG trong suốt, nhập URL HTTPS hoặc đường dẫn `assets/` vào ô Logo.

Với HEIC/HEIF, Admin thử giải mã bằng trình duyệt trước, sau đó dùng bản `heic2any 0.0.4` đi kèm. Admin local tải decoder từ `assets/vendor/`; Admin Apps Script tải bản ghim cùng phiên bản từ jsDelivr. Một số biến thể HEIC mới có thể không tương thích bộ giải mã. Khi có thông báo lỗi, mở ảnh trong **Preview trên Mac → File → Export → JPEG**, rồi chọn file JPEG. Nguồn thư viện: [heic2any](https://github.com/alexcorvi/heic2any).

Gỡ ảnh khỏi sản phẩm chỉ gỡ URL khỏi danh sách ảnh. File đã tải vẫn ở Cloudinary để không làm mất ảnh đang được sản phẩm khác sử dụng. Bạn có thể dọn ảnh không dùng trong Cloudinary Console sau.

## 7. Đưa dữ liệu mẫu vào Google Sheets

Admin Google mới cài bắt đầu bằng danh mục rỗng. Để đưa danh mục mẫu của dự án lên:

1. Mở Admin local và bấm **Xuất dữ liệu JSON**.
2. Mở Admin Apps Script.
3. Bấm **Nhập dữ liệu JSON** rồi chọn file vừa xuất.
4. Xác nhận nhập dữ liệu. Các sản phẩm, nội dung shop và bộ lọc giá được ghi vào ba sheet.

**Chỉ cho nhập khi `Products` đang trống**, tránh thay toàn bộ một danh mục đang bán bằng file nhầm. Sau khởi tạo, dùng các màn hình thêm/sửa/lưu trữ để cập nhật.

Ảnh mẫu có đường dẫn `assets/` được giữ nguyên và sử dụng ảnh trong website. Các ảnh bạn đã chọn từ máy ở **Admin local** được lưu thành base64 trong bản sao; Admin Google không ghi loại URL đó vào Sheets. Với các ảnh này, chọn lại file ở Admin Google và tải lên Cloudinary, hoặc thay thành URL HTTPS trước khi nhập. Thông báo lỗi sẽ nêu rõ trường hợp này.

## 8. Cài project Public API

1. Tạo **một Apps Script project mới**, đặt tên `WebShop100 Public API`.
2. Dán file `apps-script/public-api/Code.gs` vào `Code.gs`.
3. Thay manifest bằng `apps-script/public-api/appsscript.json`.
4. Thêm Script Property **SPREADSHEET_ID**, cùng ID mà Admin sử dụng. Không cần và không được thêm Cloudinary secret vào project này.
5. Chọn **Deploy → New deployment → Web app**:

| Tùy chọn | Giá trị |
| --- | --- |
| Execute as | **Me** / tài khoản có quyền đọc bảng tính |
| Who has access | **Anyone** / cho phép cả khách chưa đăng nhập |

6. Cấp quyền rồi sao chép URL `/exec`.
7. Mở URL đó trong cửa sổ chưa đăng nhập. Khi đúng cấu hình, bạn thấy JSON có `ok: true`, `products`, `settings`, `priceFilters`.

Nếu tài khoản Workspace không cho triển khai `Anyone`, cần quản trị viên tổ chức cho phép hoặc sử dụng tài khoản phù hợp. Không đổi Admin thành public để giải quyết vấn đề của API.

### Kết nối website

Mở `assets/js/config.js` và điền hai URL, giữ lại các cấu hình khác trong file:

```js
apiUrl: 'https://script.google.com/macros/s/DEPLOYMENT_ID_PUBLIC_API/exec',
adminUrl: 'https://script.google.com/macros/s/DEPLOYMENT_ID_ADMIN/exec',
```

Hai deployment ID khác nhau. Để dùng danh mục trong file/local, đặt `apiUrl: ''`.

API trả JSON thuần nếu không có tham số; với `?callback=tenHam` thì trả JSONP. Callback phải là một tên JavaScript đơn, tối đa 101 ký tự; mã có dấu ngoặc, chấm, dấu chấm phẩy bị từ chối. Chỉ thông tin công khai được trả: sản phẩm đang hiển thị, trạng thái đang bán/hết hàng, bộ lọc đang bật và các khóa nội dung đã cho phép. Sản phẩm nháp/ẩn/lưu trữ không xuất hiện.

API chỉ có đường đọc `doGet`, không có `doPost`, hàm ghi hoặc chữ ký upload. Manifest vẫn khai báo scope `spreadsheets` vì dịch vụ `SpreadsheetApp.openById` yêu cầu scope đó; giới hạn “chỉ đọc” được đảm bảo bởi mã trong project Public API, không phải bằng scope `spreadsheets.readonly` không đủ cho phương thức đang dùng. [Tài liệu `openById`](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openById(String)).

Google khuyến cáo JSONP chỉ dùng cho dữ liệu không nhạy cảm và thao tác đọc. [Content Service / JSONP](https://developers.google.com/apps-script/guides/content).

### Cache và thời gian cập nhật

API lưu cache khoảng **30 giây**. Cache nằm ở project Public API, không chia sẻ với Admin. Sau khi lưu, chờ khoảng 30 giây rồi tải lại website nếu vẫn thấy dữ liệu cũ. Đây không phải live push hoặc tự refresh mỗi 30 giây.

Nếu cache thiếu/hết hạn/bị loại bỏ, API đọc lại Sheets. Danh mục lớn được chia cache thành nhiều phần để không vượt giới hạn dung lượng từng key; danh mục rất lớn được phục vụ trực tiếp. Google không cam kết cache tồn tại đủ TTL. [CacheService](https://developers.google.com/apps-script/reference/cache/cache).

## 9. Cấu trúc dữ liệu

Không đổi tên hoặc thứ tự các cột dưới đây. Cột `tags`, `images` và giá trị Settings `channels` chứa JSON. Nên sửa bằng Admin để được kiểm tra dữ liệu.

### Products

```text
id | code | name | category | description | shortDescription | price | originalPrice | tags | featured | visible | status | stock | images | updatedAt | archived
```

| Trường | Ý nghĩa |
| --- | --- |
| `id` | ID duy nhất, Admin tự tạo |
| `code` | Mã duy nhất; sản phẩm lưu trữ vẫn giữ mã |
| `status` | `active`, `out_of_stock` hoặc `draft` |
| `visible` | Bật/tắt hiển thị |
| `stock` | Để trống nếu không theo dõi; `0` là hết hàng |
| `images` | Mảng tối đa 4 URL; bỏ ô trống, giữ thứ tự và dùng ảnh đầu làm đại diện |
| `updatedAt` | Thời điểm cập nhật; dùng phát hiện sửa trên dữ liệu cũ |
| `archived` | Soft delete; vẫn giữ dòng dữ liệu |

Giá bán không âm, giá gốc nếu dùng phải không thấp hơn giá bán; tồn kho phải là số nguyên không âm. Admin kiểm tra lại ở server trước khi ghi. Dữ liệu bắt đầu bằng ký tự công thức được ghi thành văn bản, không chạy thành công thức Sheets.

Nhân bản tạo ID/mã mới, thêm hậu tố `(bản sao)`, mặc định `visible=false`, `status=draft`. Lưu trữ không xóa dòng. Khôi phục vẫn để `visible=false` để bạn kiểm tra trước khi công bố lại.

### Settings

```text
key | value
```

Các key nhận diện, SEO, hero, footer, liên hệ và kênh nhận đơn được định nghĩa trong `SETTINGS_FIELDS_`. `channels` là object JSON gồm `messenger`, `instagram`, `zalo`, `zaloOA`, `tiktok`. Không thêm khóa bí mật vào sheet này.

### PriceFilters

```text
id | label | min | max | sort | enabled
```

`max` trống nghĩa là không giới hạn giá tối đa. Khoảng giá gồm cả cận dưới và cận trên. Thứ tự nhỏ hiển thị trước. Khi xóa khoảng giá và bấm lưu, dòng cấu hình tương ứng được xóa khỏi nội dung bảng.

## 10. Nếu cần nhiều quản trị viên

1. Thêm các email vào `ADMIN_EMAIL`, ngăn bằng dấu phẩy.
2. Cấp quyền **Editor** của bảng tính cho các email đó vì script sẽ chạy bằng tài khoản truy cập.
3. Triển khai Admin với **Execute as: User accessing the web app** và quyền truy cập chỉ dành cho người đã đăng nhập Google (hoặc domain nội bộ nếu phù hợp).
4. Nếu chỉnh manifest theo chế độ này, dùng `executeAs: "USER_ACCESSING"`, `access: "ANYONE"` hoặc `"DOMAIN"` phù hợp.
5. Mỗi người mở Admin, chấp nhận cấp quyền, và chỉ tiếp tục nếu email nằm trong allowlist.

Không bỏ kiểm tra email khi gặp lỗi quyền. Danh sách allowlist và quyền Google là hai điều kiện cần khớp. Đây là hướng mở rộng; một chủ shop nên giữ cấu hình **Only myself** mặc định để cài đơn giản.

## 11. Sửa mã Admin sau này

Admin dùng chung nguồn với bản local:

```text
admin.html
assets/css/admin.css
assets/js/admin.js
```

Sau khi chỉnh, chạy:

```bash
python3 apps-script/build-admin.py
```

Lệnh tạo lại `apps-script/admin/Admin.html`, không cài thư viện hoặc build website. File đã được tạo sẵn trong gói bàn giao, chỉ cần chạy lại khi bạn sửa giao diện/code Admin.

Trong Apps Script, khi thay đổi mã đã triển khai, chọn **Deploy → Manage deployments → Edit → New version → Deploy**. Giữ URL `/exec` cũ bằng cách cập nhật deployment hiện tại. Chỉ bấm Save trong Editor chưa đảm bảo bản `/exec` đã dùng mã mới. [Web Apps deployment](https://developers.google.com/apps-script/guides/web).

## 12. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| “Chưa cấu hình ADMIN_EMAIL” | Thêm Script Property ở đúng project Admin |
| “Google chưa cung cấp email” | Một chủ shop: Only myself; nhiều người: thực thi theo người truy cập và allowlist đúng |
| “Thiếu sheet…” | Chạy `setupShop` bằng chủ shop sau khi điền SPREADSHEET_ID |
| “Cấu trúc sheet không đúng” | Khôi phục tên/thứ tự header đúng tài liệu; không xóa dữ liệu để thử |
| API hiện trang đăng nhập | Kiểm tra project Public API có access Anyone, và đang dùng URL `/exec` đúng |
| Website báo lỗi tải API | Kiểm tra URL, quyền triển khai, Sheet ID và mục Executions của API; website có dữ liệu mẫu dự phòng |
| Admin local sửa nhưng site online không đổi | Xuất và đưa `data.js` lên repo, hoặc sửa qua Admin Google khi đã bật API |
| Cloudinary báo Invalid Signature | Kiểm tra API key/secret cùng environment, đồng hồ server, không tự sửa tham số upload ở trình duyệt |
| HEIC không đọc được | Dùng Preview của Mac xuất JPEG, rồi chọn lại |
| Ảnh mẫu ở Admin Google không hiện | Điền SHOP_SITE_URL online đúng repository path, hoặc tải ảnh lên Cloudinary |
| Chỉnh sheet mà web chưa đổi | Chờ cache khoảng 30 giây rồi tải lại cửa hàng |
| “Sản phẩm đã được cập nhật…” | Tải lại dữ liệu và chỉnh trên bản mới nhất |

## 13. Phạm vi vận hành

Admin quản lý danh mục, nội dung và khoảng giá. Giỏ hàng vẫn ở trình duyệt khách; khách sao chép đơn rồi tự gửi qua kênh liên hệ. Không có lưu đơn/thu tiền/trừ tồn kho tự động.

Các bước kết nối trên cần tài khoản và cấu hình của bạn. Bộ mã nguồn không chứa tài khoản Cloudinary/Google đang hoạt động sẵn. Các hàm Apps Script cần được kiểm tra trên deployment thật sau khi bạn thiết lập quyền, Sheet ID và API key; kiểm tra cục bộ không thay thế xác nhận các dịch vụ bên ngoài.
