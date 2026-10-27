#!/bin/bash
# Nhấp đúp file này trong Finder. Không cài package hoặc thay phiên bản Node.
set -u

SHOP_DIR="$(cd -- "$(dirname -- "$0")" && pwd -P)" || exit 1
cd -- "$SHOP_DIR" || exit 1

if [ ! -f "$SHOP_DIR/index.html" ]; then
  printf '\nKhông tìm thấy index.html. Hãy giải nén đầy đủ thư mục WebShop100 trước.\n'
  printf 'Nhấn Enter để đóng cửa sổ này.'
  read -r _shop_close
  exit 1
fi

printf '\n  WebShop100 · Chạy trên Mac\n\n'

SHOP_NODE=""
shop_try_node() {
  local candidate="$1"
  if [ -x "$candidate" ] && "$candidate" -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 14 ? 0 : 1)' >/dev/null 2>&1; then
    SHOP_NODE="$candidate"
    return 0
  fi
  return 1
}

# Finder có PATH khác Terminal. Kiểm tra Node hiện có và các vị trí phổ biến.
SHOP_PATH_NODE="$(command -v node 2>/dev/null || true)"
for SHOP_CANDIDATE in "$SHOP_PATH_NODE" /opt/homebrew/bin/node /usr/local/bin/node; do
  if shop_try_node "$SHOP_CANDIDATE"; then break; fi
done

if [ -z "$SHOP_NODE" ]; then
  for SHOP_CANDIDATE in "${HOME}/.nvm/versions/node/"*/bin/node "${HOME}/.volta/bin/node"; do
    if shop_try_node "$SHOP_CANDIDATE"; then break; fi
  done
fi

if [ -n "$SHOP_NODE" ]; then
  printf 'Đang dùng Node có sẵn: %s\n' "$SHOP_NODE"
  printf 'Giữ cửa sổ Terminal này mở khi xem website. Ctrl+C để dừng.\n'
  exec "$SHOP_NODE" "$SHOP_DIR/scripts/local-server.cjs" --open
fi

# Bản giao diện tĩnh dùng script thường nên vẫn mở được khi máy chưa có Node.
printf 'Máy chưa có Node từ phiên bản 14. Đang mở trực tiếp index.html.\n'
printf 'Giao diện mẫu vẫn chạy; không cần cài thêm để xem.\n'
printf 'Một số trình duyệt có thể hạn chế lưu giỏ/sao chép trong chế độ file.\n\n'
if [ -x /usr/bin/open ]; then
  /usr/bin/open "$SHOP_DIR/index.html"
else
  printf 'Mở file này bằng trình duyệt: %s/index.html\n' "$SHOP_DIR"
fi
