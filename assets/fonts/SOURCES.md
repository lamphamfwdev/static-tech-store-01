# Inter — font dùng offline

Ngày tải: 19/10/2026.

- Tác giả: The Inter Project Authors.
- Nguồn tệp variable WOFF2 nguyên bản: https://rsms.me/inter/font-files/InterVariable.woff2
- Mã nguồn font: https://github.com/rsms/inter
- Giấy phép gốc: https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt — lưu nguyên văn tại `OFL.txt`.

Hai tên `inter-latin.woff2` và `inter-vietnamese.woff2` cùng chứa bản đầy đủ của Inter Variable, không sửa glyph hoặc subset. Việc dùng bản đầy đủ giúp hiển thị tiếng Việt ở cả dạng Unicode dựng sẵn (NFC) và dạng dấu kết hợp (NFD), gồm U+0302, U+0306 và U+031B mà các subset Google Fonts mặc định không chứa.

Font hỗ trợ weight 100–900. Hai tên giữ tương thích với hai khai báo `@font-face` của giao diện. Có thể hợp nhất thành một khai báo không giới hạn `unicode-range` trỏ tới `inter-latin.woff2` để trình duyệt chỉ tải một bản; không cần đổi font của các component.

Các ký tự tiếng Việt của giao diện đã kiểm tra có glyph ở cả NFC và NFD. Dự án dùng font local nên không cần kết nối Google Fonts lúc chạy.
