'use strict';

// Node 14+, chỉ dùng built-in. DOM tối thiểu ở cuối file không render trình duyệt.
const assert = require('assert');
const contact = require('../assets/js/contact-bar.js');
let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); passed += 1; console.log('PASS ' + name); }
  catch (error) { failed += 1; console.error('FAIL ' + name + '\n  ' + error.message); }
}
const live = {demoMode:false, usingFallback:false, loadingApi:false};
const settings = {phone:'+84 912 345 678', channels:{
  zalo:'https://zalo.me/84912345678', zaloOA:'https://zalo.me/example-oa',
  messenger:'https://m.me/example-shop'
}};

test('Dữ liệu live tạo đúng ba kênh, số gọi điện được chuẩn hóa', function () {
  const model = contact.getModel(settings, live);
  assert.strictEqual(model.visible, true);
  assert.deepStrictEqual(model.actions.map(a=>[a.id,a.href,a.disabled]), [
    ['zalo','https://zalo.me/84912345678',false],
    ['messenger','https://m.me/example-shop',false],
    ['phone','tel:+84912345678',false]
  ]);
});
test('Ưu tiên Zalo cá nhân khi cả Zalo và OA đều có cấu hình', function () {
  assert.strictEqual(contact.getModel(settings,live).actions[0].href, settings.channels.zalo);
});
test('Dùng Zalo OA khi URL Zalo cá nhân trống hoặc không hợp lệ', function () {
  ['', 'javascript:alert(1)', 'https://'].forEach(function (zalo) {
    const model=contact.getModel({channels:{zalo:zalo,zaloOA:settings.channels.zaloOA}},live);
    assert.deepStrictEqual(model.actions.map(a=>a.href), [settings.channels.zaloOA]);
  });
});
test('Live chỉ hiển thị những kênh đã cấu hình hợp lệ', function () {
  assert.deepStrictEqual(contact.getModel({channels:{messenger:settings.channels.messenger}},live).actions.map(a=>a.id), ['messenger']);
});
test('Live không có thông tin liên hệ thì ẩn toàn bộ thanh', function () {
  [null, {}, {channels:{}}, {phone:'không có',channels:{zalo:'bad',messenger:'http://example.com'}}].forEach(function (value) {
    assert.strictEqual(contact.getModel(value,live).visible, false);
  });
});
test('URL HTTPS giữ query hợp lệ và loại khoảng trắng ở hai đầu', function () {
  assert.strictEqual(contact.safeHttps('  https://m.me/example-shop?ref=sp%201  '), 'https://m.me/example-shop?ref=sp%201');
});
test('Không chấp nhận giao thức lạ, URL lỗi, credentials hoặc ký tự chèn thuộc tính', function () {
  [undefined, null, 123, {}, 'javascript:alert(1)', 'data:text/html,test', '//m.me/shop',
    'http://m.me/shop', 'https://', 'https://exa mple.com', 'https://m.me/shop" onclick="alert(1)',
    'https://user:pass@example.com/', 'https://example.com\\@m.me/shop',
    'https://m.me/\nshop', 'https://m.me/<script>'].forEach(function (url) {
    assert.strictEqual(contact.safeHttps(url), '', String(url));
  });
});
test('Số điện thoại nhận dấu cách, ngoặc, gạch ngang, dấu chấm thông thường', function () {
  assert.deepStrictEqual(['0912.345.678','(028) 1234-5678','+84 912 345 678','0912\u00a0345\u00a0678'].map(contact.phoneNumber),
    ['0912345678','02812345678','+84912345678','0912345678']);
});
test('Không rút số điện thoại từ mã lệnh, chữ, extension hoặc dấu cộng ở giữa', function () {
  ['javascript:0912345678', 'Gọi 0912345678', '0912345678 ext 123', '0912345678,123',
    '0912345678#', '++84912345678', '84+912345678', '123456', '1234567890123456',
    '0912\n345678', '', null, {}].forEach(function (value) {
    assert.strictEqual(contact.phoneNumber(value), '', String(value));
  });
});
test('Demo hiển thị nút mẫu nhưng tuyệt đối không giữ href liên hệ thật', function () {
  const model=contact.getModel(settings,{demoMode:true});
  assert.strictEqual(model.actions.length,3);
  assert.strictEqual(model.blocked,true);
  assert.ok(model.actions.every(a=>a.disabled && !a.href));
  assert.ok(model.status.includes('Bản xem thử'));
});
test('Demo thiếu toàn bộ cấu hình vẫn có đủ ba nút để xem bố cục', function () {
  assert.deepStrictEqual(contact.getModel({}, {demoMode:true}).actions.map(a=>a.id), ['zalo','messenger','phone']);
});
test('API fallback khóa liên hệ dù cấu hình demo đã tắt', function () {
  const model=contact.getModel(settings,{demoMode:false,usingFallback:true});
  assert.ok(model.actions.every(a=>a.disabled && !a.href));
  assert.ok(model.status.includes('dữ liệu mẫu'));
});
test('Chờ API không đưa thông tin mẫu thành liên hệ thật', function () {
  const model=contact.getModel(settings,{demoMode:false,loadingApi:true});
  assert.ok(model.actions.every(a=>a.disabled && !a.href));
  assert.strictEqual(model.caption,'Đang tải liên hệ');
});
test('Hàm xây dựng kênh không sửa cấu hình đầu vào', function () {
  const before=JSON.stringify(settings);
  contact.getModel(settings,live);
  contact.getModel(settings,{demoMode:true});
  assert.strictEqual(JSON.stringify(settings),before);
});
test('Kết quả mới phản ánh thay đổi cấu hình, không giữ kênh từ lần trước', function () {
  contact.getModel(settings,live);
  assert.deepStrictEqual(contact.getModel({phone:'02812345678'},live).actions.map(a=>a.id), ['phone']);
});

// Fake DOM nhỏ chỉ kiểm tra cây phần tử và thuộc tính do render() tạo ra.
function documentFixture() {
  const doc={activeElement:null};
  class Element {
    constructor(tag) {
      this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.parentNode=null;
      this.id='';this.hidden=false;this.disabled=false;this._text='';
      const classes=new Set();
      this.classList={toggle(name,enabled){if(enabled)classes.add(name);else classes.delete(name);},contains(name){return classes.has(name);}};
    }
    setAttribute(name,value){this.attributes[name]=String(value);if(name==='id')this.id=String(value);}
    getAttribute(name){return Object.prototype.hasOwnProperty.call(this.attributes,name)?this.attributes[name]:null;}
    appendChild(node){node.parentNode=this;this.children.push(node);return node;}
    removeChild(node){this.children.splice(this.children.indexOf(node),1);node.parentNode=null;return node;}
    get firstChild(){return this.children[0]||null;}
    set textContent(value){this._text=String(value);this.children=[];}
    get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
    contains(node){return node===this||this.children.some(child=>child.contains(node));}
    focus(){doc.activeElement=this;}
  }
  doc.createElement=tag=>new Element(tag);
  doc.createElementNS=(_namespace,tag)=>new Element(tag);
  doc.body=new Element('body');doc.activeElement=doc.body;
  doc.getElementById=id=>findAll(doc.body,n=>n.id===id)[0]||null;
  return doc;
}
function findAll(node,fn) {return (fn(node)?[node]:[]).concat(...node.children.map(child=>findAll(child,fn)));}
const previousDocument=global.document;
global.document=documentFixture();
try {
  test('Render tạo thanh với nhãn truy cập và chỉ các anchor live hợp lệ', function () {
    const nav=contact.render(settings,live);
    assert.strictEqual(nav.getAttribute('aria-label'),'Liên hệ nhanh với cửa hàng');
    assert.strictEqual(findAll(nav,n=>n.tagName==='A').length,3);
    assert.ok(global.document.body.classList.contains('has-quick-contact'));
  });
  test('Kênh web mở tab mới có rel bảo vệ; tel không mở tab mới', function () {
    const nav=contact.render(settings,live);
    const links=findAll(nav,n=>n.tagName==='A');
    links.forEach(function (link) {
      if(link.getAttribute('data-contact')==='phone')assert.strictEqual(link.getAttribute('target'),null);
      else {
        assert.strictEqual(link.getAttribute('target'),'_blank');
        assert.strictEqual(link.getAttribute('rel'),'noopener noreferrer');
      }
    });
  });
  test('Render nhiều lần không nhân đôi thanh hoặc giữ anchor của cấu hình cũ', function () {
    contact.render(settings,live);contact.render(settings,live);
    const nav=contact.render({phone:'02812345678'},live);
    assert.strictEqual(findAll(global.document.body,n=>n.id==='quick-contact').length,1);
    assert.deepStrictEqual(findAll(nav,n=>n.tagName==='A').map(n=>n.getAttribute('href')),['tel:02812345678']);
  });
  test('Chuyển sang demo loại hết anchor, các nút có trạng thái disabled rõ ràng', function () {
    const nav=contact.render(settings,{demoMode:true});
    assert.strictEqual(findAll(nav,n=>n.tagName==='A').length,0);
    const buttons=findAll(nav,n=>n.tagName==='BUTTON');
    assert.strictEqual(buttons.length,3);
    assert.ok(buttons.every(n=>n.disabled && n.getAttribute('aria-disabled')==='true' && !n.getAttribute('href')));
    assert.ok(global.document.getElementById('quick-contact-status'));
  });
  test('Chuyển demo về live bỏ thông báo demo và tạo lại đúng kênh', function () {
    const nav=contact.render(settings,live);
    assert.strictEqual(findAll(nav,n=>n.tagName==='A').length,3);
    assert.strictEqual(global.document.getElementById('quick-contact-status'),null);
  });
  test('Bỏ hết kênh live sẽ ẩn thanh và bỏ khoảng đệm mobile', function () {
    const nav=contact.render({},live);
    assert.strictEqual(nav.hidden,true);
    assert.strictEqual(global.document.body.classList.contains('has-quick-contact'),false);
    assert.strictEqual(nav.children.length,0);
  });
  test('Cập nhật cấu hình giữ focus ở cùng kênh nếu kênh đó còn dùng được', function () {
    let nav=contact.render(settings,live);
    findAll(nav,n=>n.getAttribute('data-contact')==='messenger')[0].focus();
    nav=contact.render(settings,live);
    assert.strictEqual(global.document.activeElement,findAll(nav,n=>n.getAttribute('data-contact')==='messenger')[0]);
  });
} finally {
  if(previousDocument===undefined)delete global.document;else global.document=previousDocument;
}
test('Không có document thì không gây lỗi trong môi trường Node', function () {
  if(previousDocument===undefined)assert.strictEqual(contact.render(settings,live),null);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed.');
if(failed)process.exitCode=1;
