'use strict';
const assert = require('assert');
const core = require('../assets/js/core.js');
let passed = 0;
function test(name, run) { run(); passed++; console.log('PASS ' + name); }

test('Liên kết giữ đúng thư mục repository GitHub Pages', function () {
  assert.strictEqual(core.productLink('https://shop.example/catalog/', 'p003'), 'https://shop.example/catalog/#product=p003');
});
test('Giữ tên file và query khi thay fragment đang xem', function () {
  assert.strictEqual(core.productLink('https://shop.example/repo/index.html?lang=vi&from=catalog#lien-he', 'p001'), 'https://shop.example/repo/index.html?lang=vi&from=catalog#product=p001');
});
test('Link localhost giữ cổng đang chạy', function () {
  assert.strictEqual(core.productLink('http://127.0.0.1:4180/#san-pham', 'p002'), 'http://127.0.0.1:4180/#product=p002');
});
test('Link file local giữ đường dẫn thư mục chứa khoảng trắng', function () {
  assert.strictEqual(core.productLink('file:///Users/test/My%20Shop/index.html', 'p001'), 'file:///Users/test/My%20Shop/index.html#product=p001');
});
test('Mã sản phẩm chứa tiếng Việt và ký tự URL khôi phục chính xác', function () {
  ['SP tiếng Việt', 'a/b?x=1&y=2#tag', '100% special', 'quote\"<item>', 'a+b', '0'].forEach(function (id) {
    const url = new URL(core.productLink('https://shop.example/repo/?lang=vi', id));
    assert.strictEqual(core.productIdFromHash(url.hash), id);
    assert.strictEqual(url.pathname, '/repo/');
    assert.strictEqual(url.search, '?lang=vi');
  });
});
test('Fragment điều hướng bình thường không bị hiểu thành sản phẩm', function () {
  ['', '#san-pham', '#lien-he', '#dau-trang', '#product-list=p001'].forEach(function (hash) {
    assert.strictEqual(core.productIdFromHash(hash), null);
  });
});
test('Mã hóa URL lỗi và ID trống không gây crash', function () {
  ['#product=', '#product=%', '#product=%ZZ', '#product=%E0%A4%A'].forEach(function (hash) {
    assert.strictEqual(core.productIdFromHash(hash), null);
  });
});
test('Không tạo liên kết từ giao thức không phải website/file', function () {
  ['javascript:alert(1)', 'data:text/html,test', 'ftp://shop.example/item', 'not-a-url'].forEach(function (url) {
    assert.strictEqual(core.productLink(url, 'p001'), '');
  });
});
test('ID thiếu không tạo liên kết sản phẩm giả', function () {
  [null, undefined, ''].forEach(function (id) { assert.strictEqual(core.productLink('https://shop.example/', id), ''); });
});
test('Chỉ giải mã ID một lần, không biến phần trăm thành đường dẫn khác', function () {
  const id = '%2Fadmin%3Fmode%3D1';
  const url = new URL(core.productLink('https://shop.example/repo/', id));
  assert.strictEqual(core.productIdFromHash(url.hash), id);
  assert.strictEqual(url.pathname, '/repo/');
});
console.log('\n' + passed + ' share tests passed.');
