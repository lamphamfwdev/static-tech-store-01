'use strict';

// Chạy: node tests/core.test.cjs — Node 14+, không cần npm install.
// Kiểm tra quy tắc khách hàng nhìn thấy; không cần DOM hay dịch vụ bên ngoài.
const assert = require('assert');
const core = require('../assets/js/core.js');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('PASS ' + name);
  } catch (error) {
    failed += 1;
    console.error('FAIL ' + name + '\n  ' + error.message);
  }
}
function product(id, values) {
  return Object.assign({
    id: id, code: id.toUpperCase(), name: id, category: 'Phụ kiện khác',
    description: '', shortDescription: '', tags: [], price: 1000,
    visible: true, archived: false, featured: false, status: 'active',
    stock: null, images: [], updatedAt: '2026-10-01T00:00:00Z'
  }, values || {});
}
function ids(items) { return items.map(function (item) { return item.id; }); }
const products = [
  product('earbuds', {code:'TN-01',name:'Tai nghe chống ồn',category:'Tai nghe thể thao',description:'Âm thanh rõ ràng',shortDescription:'Không dây nhẹ',tags:['Bluetooth'],price:1500000,featured:true,stock:4,updatedAt:'2026-10-18T00:00:00Z'}),
  product('phone', {code:'DT-01',name:'Điện thoại xanh',category:'Điện thoại',description:'Chụp ảnh sắc nét',price:7000000,stock:2,updatedAt:'2026-10-19T00:00:00Z'}),
  product('keyboard', {code:'KB-01',name:'Bàn phím cơ',price:790000,updatedAt:'2026-10-17T00:00:00Z'}),
  product('laptop', {code:'LT-01',name:'MacBook Pro',category:'Macbook',price:15000000,stock:1,updatedAt:'2026-10-16T00:00:00Z'}),
  product('zero', {name:'Tai nghe tồn kho bằng không',category:'Tai nghe thể thao',price:2000000,stock:0}),
  product('out', {name:'Tai nghe tạm hết hàng',category:'Tai nghe thể thao',price:3000000,stock:8,status:'out_of_stock'}),
  product('hidden', {name:'Sản phẩm ẩn',visible:false,price:500}),
  product('draft', {name:'Sản phẩm bản nháp',status:'draft',price:600}),
  product('archived', {name:'Sản phẩm lưu trữ',archived:true,price:700})
];
const available = products.slice(0,4);
const defaults = {settings:{name:'Cửa hàng',pageSize:5,channels:{}},priceFilters:[]};
function normalize(raw) { return core.normalizeCatalog(raw, defaults); }

test('Tìm tiếng Việt không dấu, không phân biệt hoa thường', function () {
  assert.deepStrictEqual(ids(core.filterProducts(products,{query:'TAI   NGHE CHONG ON'})), ['earbuds']);
});
test('Tìm từ khóa có đ/Đ và dấu Unicode NFD', function () {
  assert.deepStrictEqual(ids(core.filterProducts(products,{query:'ĐIỆN THOẠI'.normalize('NFD')})), ['phone']);
});
test('Tìm theo mã sản phẩm', function () {
  assert.deepStrictEqual(ids(core.filterProducts(products,{query:'tn-01'})), ['earbuds']);
});
test('Tìm theo thẻ sản phẩm', function () {
  assert.deepStrictEqual(ids(core.filterProducts(products,{query:'BLUETOOTH'})), ['earbuds']);
});
test('Tìm trong mô tả dài và mô tả ngắn', function () {
  assert.deepStrictEqual(['am thanh ro rang','khong day nhe'].map(function(q){return ids(core.filterProducts(products,{query:q}));}), [['earbuds'],['earbuds']]);
});
test('Mọi từ khóa phải cùng khớp, có thể ở các trường khác nhau', function () {
  assert.deepStrictEqual(['TN-01 bluetooth','TN-01 camera'].map(function(q){return ids(core.filterProducts(products,{query:q}));}), [['earbuds'],[]]);
});
test('Tìm không thấy trả danh sách rỗng', function () {
  assert.deepStrictEqual(core.filterProducts(products,{query:'khong-co-san-pham-nay'}), []);
});
test('Nhiều danh mục được kết hợp OR', function () {
  assert.deepStrictEqual(ids(core.filterProducts(products,{categories:['Điện thoại','Phụ kiện khác']})), ['phone','keyboard']);
});
test('Từ khóa, danh mục và khoảng giá được kết hợp AND', function () {
  assert.deepStrictEqual(ids(core.filterProducts(products,{query:'tai nghe',categories:['Tai nghe thể thao','Điện thoại'],priceRange:{min:1400000,max:1600000}})), ['earbuds']);
});
const boundaries = [999999,1000000,4999999,5000000,10000000,10000001].map(function(price){return product('price-'+price,{price:price});});
test('Các khoảng giá liền kề không bỏ sót hoặc trùng điểm biên', function () {
  assert.deepStrictEqual([
    core.filterProducts(boundaries,{priceRange:{min:0,max:999999}}).map(function(p){return p.price;}),
    core.filterProducts(boundaries,{priceRange:{min:1000000,max:4999999}}).map(function(p){return p.price;}),
    core.filterProducts(boundaries,{priceRange:{min:5000000,max:10000000}}).map(function(p){return p.price;})
  ], [[999999],[1000000,4999999],[5000000,10000000]]);
});
test('Khoảng giá mở không có giới hạn trên', function () {
  assert.deepStrictEqual(ids(core.filterProducts(boundaries,{priceRange:{min:10000001,max:null}})), ['price-10000001']);
});
test('Sắp xếp giá tăng dần', function () {
  assert.deepStrictEqual(ids(core.filterProducts(available,{sort:'price-asc'})), ['keyboard','earbuds','phone','laptop']);
});
test('Sắp xếp giá giảm dần', function () {
  assert.deepStrictEqual(ids(core.filterProducts(available,{sort:'price-desc'})), ['laptop','phone','earbuds','keyboard']);
});
test('Sản phẩm nổi bật được ưu tiên', function () {
  assert.strictEqual(core.filterProducts(available.slice().reverse(),{sort:'featured'})[0].id, 'earbuds');
});
test('Sắp xếp mới nhất theo ngày cập nhật', function () {
  assert.deepStrictEqual(ids(core.filterProducts(available,{sort:'newest'})), ['phone','earbuds','keyboard','laptop']);
});
test('Sắp xếp tên A–Z với tên tiếng Việt', function () {
  assert.deepStrictEqual(ids(core.filterProducts([product('d',{name:'Điện thoại'}),product('c',{name:'Cáp sạc'}),product('b',{name:'Bàn phím'})],{sort:'name'})), ['b','c','d']);
});
test('Sắp xếp không đổi thứ tự danh mục nguồn', function () {
  const copy = JSON.parse(JSON.stringify(available));
  core.filterProducts(copy,{sort:'price-desc'});
  assert.deepStrictEqual(ids(copy), ids(available));
});
test('Trang vượt giới hạn được đưa về trang cuối cùng', function () {
  const page=core.paginate(available,99,3);
  assert.deepStrictEqual({ids:ids(page.items),page:page.page,totalPages:page.totalPages,from:page.from,to:page.to,total:page.total}, {ids:['laptop'],page:2,totalPages:2,from:4,to:4,total:4});
});
test('Trang âm, 0 hoặc không phải số được đưa về trang đầu', function () {
  assert.deepStrictEqual([-5,0,'wrong'].map(function(p){return core.paginate(available,p,2).page;}), [1,1,1]);
});
test('Không có sản phẩm vẫn có trạng thái phân trang hợp lệ', function () {
  assert.deepStrictEqual(core.paginate([],20,5), {items:[],page:1,totalPages:1,total:0,from:0,to:0});
});
test('Cấu hình số sản phẩm/trang khớp Admin: tối đa 100', function () {
  assert.deepStrictEqual([100,1000,'bad'].map(function(size){return normalize({products:[],settings:{pageSize:size}}).settings.pageSize;}), [100,100,5]);
});
test('Bộ lọc hỗ trợ thứ tự âm; bộ lọc tắt hoặc sai biên không hiển thị', function () {
  const result=normalize({products:[],priceFilters:[{id:'late',label:'Sau',sort:2},{id:'early',label:'Trước',sort:-2},{id:'off',label:'Tắt',enabled:false},{id:'invalid',label:'Sai',min:100,max:50}]}).priceFilters;
  assert.deepStrictEqual(result.map(function(f){return [f.id,f.sort];}), [['early',-2],['late',2]]);
});
test('Hiển thị đúng cờ true/false dạng boolean, số và chuỗi từ dữ liệu', function () {
  assert.deepStrictEqual([true,false,'true','false',1,0].map(function(v){return core.isVisible(product('x',{visible:v}));}), [true,false,true,false,true,false]);
});
test('Sản phẩm ẩn, nháp hoặc lưu trữ không xuất hiện trên storefront', function () {
  assert.deepStrictEqual(ids(core.filterProducts(products)), ['earbuds','phone','keyboard','laptop','zero','out']);
});
test('Hết hàng vẫn xem được nhưng không thể thêm vào giỏ', function () {
  assert.deepStrictEqual([core.isVisible(products[5]),core.isAvailable(products[5]),core.quantityLimit(products[5],99)], [true,false,0]);
});
test('Tồn kho 0 khóa mua dù trạng thái vẫn là đang bán', function () {
  assert.deepStrictEqual([core.isAvailable(products[4]),core.quantityLimit(products[4],99)], [false,0]);
});
test('Giới hạn số lượng lấy mức nhỏ hơn giữa tồn kho và giới hạn đơn', function () {
  assert.deepStrictEqual([core.quantityLimit(products[0],99),core.quantityLimit(products[0],2),core.quantityLimit(products[2],99)], [4,2,99]);
});
test('Giỏ hỏng cấu trúc được bỏ qua an toàn', function () {
  assert.deepStrictEqual([null,{},'malicious',[null,false]].map(function(cart){return core.reconcileCart(cart,products,99);}), [[],[],[],[]]);
});
test('Số lượng âm, 0, Infinity hoặc chuỗi rác không tạo dòng hàng', function () {
  assert.deepStrictEqual(core.reconcileCart([-3,0,Infinity,'Infinity','invalid',null].map(function(q){return {id:'earbuds',quantity:q};}),products,99), []);
});
test('Số lượng dạng chuỗi số và số thập phân được đưa về số nguyên', function () {
  assert.deepStrictEqual(core.reconcileCart([{id:'earbuds',quantity:'2.9'}],products,99), [{id:'earbuds',quantity:2}]);
});
test('Dòng trùng trong storage được gộp và chặn theo tồn kho hiện tại', function () {
  assert.deepStrictEqual(core.reconcileCart([{id:'earbuds',quantity:3},{id:'earbuds',quantity:4}],products,99), [{id:'earbuds',quantity:4}]);
});
test('Mã không tồn tại hoặc đã xóa được loại khỏi giỏ', function () {
  assert.deepStrictEqual(core.reconcileCart([{id:'deleted',quantity:2},{id:'earbuds',quantity:1}],products,99), [{id:'earbuds',quantity:1}]);
});
test('Sản phẩm đã ẩn, nháp, lưu trữ hoặc hết hàng được loại khỏi giỏ cũ', function () {
  assert.deepStrictEqual(core.reconcileCart(['hidden','draft','archived','zero','out'].map(function(id){return {id:id,quantity:1};}),products,99), []);
});
test('Tên khóa prototype do người dùng chèn không trở thành sản phẩm', function () {
  const untrusted=JSON.parse('[{"id":"__proto__","quantity":2},{"id":"constructor","quantity":1},{"id":"toString","quantity":4},{"id":"phone","quantity":1}]');
  assert.deepStrictEqual(core.reconcileCart(untrusted,products,99), [{id:'phone',quantity:1}]);
});
test('Storage chỉ giữ ID và số lượng, bỏ giá/tên/tổng tiền do khách chèn', function () {
  assert.deepStrictEqual(core.reconcileCart([{id:'earbuds',quantity:2,price:1,name:'Giả mạo',total:2}],products,99), [{id:'earbuds',quantity:2}]);
});
test('Tổng giỏ tính theo giá hiện tại, không tin giá lưu ở máy khách', function () {
  const summary=core.cartSummary([{id:'earbuds',quantity:2,price:1,total:2},{id:'phone',quantity:1,price:0}],products,99);
  assert.deepStrictEqual({count:summary.count,lines:summary.lines,total:summary.total,subtotals:summary.items.map(function(i){return i.total;})}, {count:3,lines:2,total:10000000,subtotals:[3000000,7000000]});
});
test('Giỏ tự tính lại khi Admin đổi giá trong danh mục', function () {
  const updated=products.map(function(p){return p.id==='earbuds'?Object.assign({},p,{price:2000000}):p;});
  assert.strictEqual(core.cartSummary([{id:'earbuds',quantity:2,price:1500000}],updated,99).total, 4000000);
});
test('Tồn kho không khai báo vẫn chặn số lượng theo giới hạn đơn', function () {
  assert.deepStrictEqual(core.reconcileCart([{id:'keyboard',quantity:1000000}],products,99), [{id:'keyboard',quantity:99}]);
});
test('Mã đơn dùng giờ Việt Nam và chuyển ngày đúng tại 00:00', function () {
  assert.strictEqual(core.orderCode(new Date('2026-10-19T17:00:00Z')), 'DH-20261020-000000');
});
test('Nội dung đơn có mã, tên/mã hàng, số lượng, đơn giá, tổng và lưu ý phí', function () {
  const summary=core.cartSummary([{id:'earbuds',quantity:2},{id:'phone',quantity:1}],products,99);
  const message=core.formatOrder(summary,'Cửa hàng thử','DH-20261020-000000');
  assert.deepStrictEqual([
    message.indexOf('Cửa hàng thử')>=0,
    message.indexOf('DH-20261020-000000')>=0,
    message.indexOf('Tai nghe chống ồn [TN-01]')>=0,
    message.indexOf('2 × 1.500.000 đ = 3.000.000 đ')>=0,
    message.indexOf('Tổng tạm tính: 10.000.000 đ')>=0,
    message.indexOf('Chưa gồm phí giao hàng.')>=0
  ], [true,true,true,true,true,true]);
});
test('Dữ liệu danh mục sai cấu trúc bị từ chối rõ ràng', function () {
  assert.throws(function(){normalize({products:'not an array'});}, /Dữ liệu danh mục không hợp lệ/);
});
test('Sản phẩm thiếu định danh/tên và ID trùng không phá danh mục', function () {
  const result=normalize({products:[null,{name:'Không ID'},{id:'bad'},product('ok'),product('ok',{name:'Trùng ID'})]});
  assert.deepStrictEqual(ids(result.products), ['ok']);
});
test('Liên kết nguy hiểm và ảnh script bị chặn, ảnh local/HTTPS vẫn dùng được', function () {
  assert.deepStrictEqual([
    core.safeLink('javascript:alert(1)'),core.safeLink('https://example.com/contact'),
    core.safeImage('data:image/svg+xml,<svg onload=alert(1)>','fallback.jpg'),
    core.safeImage('assets/../../secret','fallback.jpg'),
    core.safeImage('assets/images/iphone.jpg'),core.safeImage('https://images.example.com/photo.jpg')
  ], ['', 'https://example.com/contact','fallback.jpg','fallback.jpg','assets/images/iphone.jpg','https://images.example.com/photo.jpg']);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed.');
if (failed) process.exitCode = 1;
