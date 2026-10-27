'use strict';
const assert=require('assert');
const core=require('../assets/js/core.js');
let passed=0;
function test(name,run){run();passed++;console.log('PASS '+name);}
const images=[1,2,3,4,5,6].map(i=>'assets/images/photo-'+i+'.jpg');

test('Giới hạn bốn ảnh tổng cộng, ảnh đầu giữ vai trò đại diện',()=>{
  assert.strictEqual(core.MAX_PRODUCT_IMAGES,4);
  assert.deepStrictEqual(core.productImages(images),images.slice(0,4));
});
test('Giữ nguyên thứ tự ảnh mà chủ shop đã chọn',()=>{
  const chosen=[images[2],images[0],images[3],images[1]];
  assert.deepStrictEqual(core.productImages(chosen),chosen);
});
test('Ô trống không chiếm chỗ của bốn ảnh thật',()=>{
  assert.deepStrictEqual(core.productImages(['',images[0],null,'  ',images[1],undefined,images[2],images[3],images[4]]),images.slice(0,4));
});
test('Một ảnh và không có ảnh vẫn được chuẩn hóa bình thường',()=>{
  assert.deepStrictEqual(core.productImages([images[0]]),[images[0]]);
  [null,undefined,{},'',images[0],[],['',null,42]].forEach(value=>assert.deepStrictEqual(core.productImages(value),[]));
});
test('Ảnh trong nguồn dữ liệu không bị sửa khi lấy danh sách xem',()=>{
  const before=images.slice();
  core.productImages(images);
  assert.deepStrictEqual(images,before);
});
test('Loại khoảng trắng ngoài URL và giữ ảnh data/local/HTTPS',()=>{
  const inline='data:image/png;base64,iVBORw0KGgo=';
  assert.deepStrictEqual(core.productImages([' '+images[0]+' ','https://example.com/photo.jpg',inline]),[images[0],'https://example.com/photo.jpg',inline]);
});
test('URL ảnh nguy hiểm không được đưa vào giao diện',()=>{
  const result=core.productImages(['javascript:alert(1)','assets/../../private','data:image/svg+xml,<svg/>']);
  assert.strictEqual(result.length,3);
  assert.ok(result.every(url=>url==='assets/images/earbuds.jpg'));
});
test('Danh mục local hoặc API cũ có nhiều ảnh chỉ hiển thị bốn ảnh',()=>{
  const raw={products:[{id:'sample',name:'Sản phẩm thử',images:images.slice()}]};
  assert.deepStrictEqual(core.normalizeCatalog(raw,{settings:{},priceFilters:[]}).products[0].images,images.slice(0,4));
  assert.strictEqual(raw.products[0].images.length,6);
});
console.log('\n'+passed+' gallery tests passed.');
