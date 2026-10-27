/**
 * WebShop100 — PRIVATE ADMIN PROJECT.
 * Do not put this file in the public API project.
 * Deploy owner-only by default. All callable entry points check the authenticated email.
 * Script Properties: SPREADSHEET_ID, ADMIN_EMAIL, SHOP_SITE_URL (optional),
 * CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER.
 */
var PRODUCT_HEADERS_ = ['id','code','name','category','description','shortDescription','price','originalPrice','tags','featured','visible','status','stock','images','updatedAt','archived'];
var PRICE_HEADERS_ = ['id','label','min','max','sort','enabled'];
var SETTINGS_FIELDS_ = ['name','slogan','logo','seoTitle','seoDescription','heroEyebrow','heroTitle','heroDescription','heroImage','heroBadge','heroHighlight','heroProductName','heroProductDescription','about','address','phone','email','fanpageName','fanpageUsername','pageSize','contactChannel','channels'];
var CHANNELS_ = ['messenger','instagram','zalo','zaloOA','tiktok'];
var MAX_PRODUCT_IMAGES_ = 4;

function doGet() {
  try {
    assertAdmin_();
    return HtmlService.createHtmlOutputFromFile('Admin')
      .setTitle('Quản trị cửa hàng · WebShop100')
      .addMetaTag('viewport','width=device-width, initial-scale=1');
  } catch (error) {
    return HtmlService.createHtmlOutput('<!doctype html><html lang="vi"><meta charset="utf-8"><title>Không có quyền truy cập</title><body style="font:16px/1.7 Arial;max-width:680px;margin:80px auto;padding:24px"><h1>Không có quyền truy cập</h1><p>' + escapeHtml_(error.message) + '</p><p>Đăng nhập đúng tài khoản được cấp quyền và mở lại URL Admin. Nếu bạn là chủ shop, kiểm tra ADMIN_EMAIL và cấu hình triển khai.</p></body></html>');
  }
}

/** Run once in Apps Script after setting Script Properties. Never overwrites populated sheets. */
function setupShop() {
  assertAdmin_();
  return withLock_(function () {
    var book = spreadsheet_();
    ensureSheet_(book,'Products',PRODUCT_HEADERS_);
    var settingsSheet = ensureSheet_(book,'Settings',['key','value']);
    ensureSheet_(book,'PriceFilters',PRICE_HEADERS_);
    if (settingsSheet.getLastRow() < 2) writeSettings_(defaultSettings_());
    return 'Đã khởi tạo Products, Settings, PriceFilters. Mở Admin để nhập dữ liệu hoặc thêm sản phẩm.';
  });
}

function adminBootstrap() {
  var email = assertAdmin_();
  return snapshot_(email);
}

function adminSaveProduct(raw) {
  var email = assertAdmin_();
  return withLock_(function () {
    var product = validateProduct_(raw);
    var sheet = getSheet_('Products',PRODUCT_HEADERS_);
    var existing = readProducts_();
    var index = -1;
    existing.forEach(function (item,i) {
      if (item.id === product.id) index = i;
      if (item.id !== product.id && item.code.toLowerCase() === product.code.toLowerCase()) throw new Error('Mã sản phẩm đã tồn tại, kể cả trong danh sách lưu trữ.');
    });
    if (product.id && index < 0) throw new Error('Không tìm thấy sản phẩm. Hãy tải lại dữ liệu.');
    if (index >= 0) {
      if (existing[index].updatedAt !== product.updatedAt) throw new Error('Sản phẩm đã được cập nhật bởi thao tác khác. Tải lại dữ liệu trước khi sửa.');
      if (existing[index].archived) throw new Error('Hãy khôi phục sản phẩm trước khi chỉnh sửa.');
      product.archived = false;
    } else {
      product.id = 'sp-' + Utilities.getUuid();
      product.archived = false;
    }
    product.updatedAt = new Date().toISOString();
    if (index >= 0) writeProductRow_(sheet,existing[index]._row,product); else writeProductRow_(sheet,sheet.getLastRow()+1,product);
    SpreadsheetApp.flush();
    return snapshot_(email);
  });
}

function adminCloneProduct(id) {
  var email = assertAdmin_();
  return withLock_(function () {
    var existing = readProducts_();
    var source = existing.filter(function (p) { return p.id === String(id); })[0];
    if (!source || source.archived) throw new Error('Không tìm thấy sản phẩm để nhân bản.');
    var product = JSON.parse(JSON.stringify(source));
    var suffix = 1, code;
    do { code = source.code.slice(0,45) + '-COPY-' + suffix++; }
    while (existing.some(function (p) { return p.code.toLowerCase() === code.toLowerCase(); }));
    product.id = 'sp-' + Utilities.getUuid(); product.code = code;
    product.name = source.name.slice(0,185) + ' (bản sao)';
    product.visible = false; product.status = 'draft'; product.archived = false;
    product.updatedAt = new Date().toISOString();
    var sheet = getSheet_('Products',PRODUCT_HEADERS_);
    writeProductRow_(sheet,sheet.getLastRow()+1,product);
    SpreadsheetApp.flush();
    return snapshot_(email);
  });
}

function adminArchiveProduct(id) {
  var email = assertAdmin_();
  return withLock_(function () { setArchived_(id,true); return snapshot_(email); });
}

function adminRestoreProduct(id) {
  var email = assertAdmin_();
  return withLock_(function () { setArchived_(id,false); return snapshot_(email); });
}

function adminSaveSettings(raw) {
  var email = assertAdmin_();
  return withLock_(function () {
    writeSettings_(validateSettings_(raw));
    SpreadsheetApp.flush();
    return snapshot_(email);
  });
}

function adminSavePriceFilters(raw) {
  var email = assertAdmin_();
  return withLock_(function () {
    writePrices_(validatePrices_(raw));
    SpreadsheetApp.flush();
    return snapshot_(email);
  });
}

/** Initial migration only: an existing Products sheet is never replaced through this action. */
function adminImportCatalog(raw) {
  var email = assertAdmin_();
  return withLock_(function () {
    if (!raw || !Array.isArray(raw.products) || raw.products.length > 5000) throw new Error('Dữ liệu nhập không hợp lệ hoặc vượt 5.000 sản phẩm.');
    var sheet = getSheet_('Products',PRODUCT_HEADERS_);
    if (readProducts_().length) throw new Error('Nhập dữ liệu chỉ được phép khi Products đang trống.');
    var ids = {}, codes = {};
    var products = raw.products.map(function (item) {
      var p = validateProduct_(item);
      p.id = p.id || 'sp-' + Utilities.getUuid();
      var idKey = '$' + p.id, codeKey = '$' + p.code.toLowerCase();
      if (ids[idKey] || codes[codeKey]) throw new Error('Trùng ID hoặc mã trong dữ liệu nhập: ' + p.code);
      ids[idKey] = true; codes[codeKey] = true;
      p.updatedAt = new Date().toISOString();
      return p;
    });
    var settings = validateSettings_(raw.settings);
    var prices = validatePrices_(raw.priceFilters);
    // Validate the whole input before the first write. Sheets is not a transactional database.
    if (products.length) writeRows_(sheet,2,products.map(productValues_),PRODUCT_HEADERS_.length);
    writeSettings_(settings); writePrices_(prices); SpreadsheetApp.flush();
    return snapshot_(email);
  });
}

/** Only fixed server-selected fields are signed; the browser cannot choose arbitrary parameters. */
function adminUploadSignature(kind) {
  assertAdmin_();
  if (['product','logo','hero'].indexOf(kind) < 0) throw new Error('Loại ảnh không hợp lệ.');
  var props = PropertiesService.getScriptProperties();
  var cloud = props.getProperty('CLOUDINARY_CLOUD_NAME');
  var key = props.getProperty('CLOUDINARY_API_KEY');
  var secret = props.getProperty('CLOUDINARY_API_SECRET');
  if (!cloud || !key || !secret) throw new Error('Chưa cấu hình Cloudinary. Bổ sung CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong Script Properties.');
  if (!/^[a-zA-Z0-9_-]+$/.test(cloud)) throw new Error('Cloud name không hợp lệ.');
  var folder = props.getProperty('CLOUDINARY_FOLDER') || 'webshop100';
  if (!/^[a-zA-Z0-9_\/-]{1,100}$/.test(folder)) throw new Error('CLOUDINARY_FOLDER chỉ được chứa chữ, số, gạch ngang, gạch dưới và /.');
  var params = {folder:folder + '/' + kind,overwrite:false,public_id:'img-' + Utilities.getUuid(),timestamp:Math.floor(Date.now()/1000)};
  var signingText = Object.keys(params).sort().map(function (name) { return name + '=' + String(params[name]); }).join('&') + secret;
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,signingText,Utilities.Charset.UTF_8);
  var signature = digest.map(function (byte) { return ('0'+((byte+256)%256).toString(16)).slice(-2); }).join('');
  return {cloudName:cloud,apiKey:key,signature:signature,params:params};
}

function assertAdmin_() {
  var configured = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || '';
  var allowed = configured.split(/[,;\s]+/).map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  if (!allowed.length) throw new Error('Chưa cấu hình ADMIN_EMAIL trong Script Properties.');
  var email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  // Never fall back to getEffectiveUser(): a web app executing as its owner would grant the owner identity to every caller.
  if (!email) throw new Error('Google chưa cung cấp email của tài khoản truy cập. Với một chủ shop: triển khai Admin bằng Execute as: Me, Who has access: Only myself. Với nhiều quản trị viên: dùng Execute as: User accessing the web app và cấp quyền Sheet cho từng tài khoản.');
  if (allowed.indexOf(email) < 0) throw new Error('Tài khoản ' + email + ' không nằm trong danh sách quản trị.');
  return email;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('Có thao tác khác đang lưu. Vui lòng thử lại sau vài giây.');
  try { return fn(); } finally { lock.releaseLock(); }
}

function spreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Chưa cấu hình SPREADSHEET_ID hợp lệ.');
  return SpreadsheetApp.openById(id);
}

function ensureSheet_(book,name,headers) {
  var sheet = book.getSheetByName(name) || book.insertSheet(name);
  if (!sheet.getLastRow()) {
    sheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold').setBackground('#f8c72f');
    sheet.setFrozenRows(1);
  }
  checkHeaders_(sheet,headers);
  return sheet;
}

function getSheet_(name,headers) {
  var sheet = spreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('Thiếu sheet ' + name + '. Chạy setupShop trong Apps Script trước.');
  checkHeaders_(sheet,headers);
  return sheet;
}

function checkHeaders_(sheet,headers) {
  var actual = sheet.getRange(1,1,1,headers.length).getDisplayValues()[0];
  if (headers.some(function (key,index) { return actual[index] !== key; })) throw new Error('Cấu trúc sheet ' + sheet.getName() + ' không đúng. Xem docs/SETUP_ADMIN.md; không đổi tên hoặc thứ tự cột.');
}

function readRows_(name,headers) {
  var sheet = getSheet_(name,headers);
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2,1,sheet.getLastRow()-1,headers.length).getValues().map(function (row,index) {
    var item = {_row:index+2};
    headers.forEach(function (key,i) { item[key] = row[i] instanceof Date ? row[i].toISOString() : row[i]; });
    return item;
  }).filter(function (row) { return String(row[headers[0]] || '').trim() !== ''; });
}

function readProducts_() {
  return readRows_('Products',PRODUCT_HEADERS_).map(function (row) {
    row.id = String(row.id); row.code = String(row.code); row.name = String(row.name);
    row.tags = parseArray_(row.tags); row.images = productImages_(parseArray_(row.images));
    row.featured = bool_(row.featured,false); row.visible = bool_(row.visible,true); row.archived = bool_(row.archived,false);
    row.price = number_(row.price,0); row.originalPrice = nullableNumber_(row.originalPrice); row.stock = nullableNumber_(row.stock);
    row.updatedAt = String(row.updatedAt || '');
    return row;
  });
}

function readSettings_() {
  var settings = defaultSettings_();
  readRows_('Settings',['key','value']).forEach(function (row) {
    if (SETTINGS_FIELDS_.indexOf(row.key) < 0) return;
    if (row.key === 'channels') {
      var channels = parseObject_(row.value);
      CHANNELS_.forEach(function (key) { settings.channels[key] = String(channels[key] || ''); });
    } else if (row.key === 'pageSize') settings.pageSize = Math.max(1,Math.min(100,Math.floor(number_(row.value,5))));
    else settings[row.key] = String(row.value == null ? '' : row.value);
  });
  return settings;
}

function readPrices_() {
  return readRows_('PriceFilters',PRICE_HEADERS_).map(function (row) {
    return {id:String(row.id),label:String(row.label),min:number_(row.min,0),max:nullableNumber_(row.max),sort:number_(row.sort,0),enabled:bool_(row.enabled,true)};
  }).sort(function (a,b) { return a.sort-b.sort; });
}

function snapshot_(email) {
  var props = PropertiesService.getScriptProperties();
  return {catalog:{products:readProducts_().map(function (p) { delete p._row; return p; }),settings:readSettings_(),priceFilters:readPrices_()},meta:{mode:'remote',email:email,sheetUrl:'https://docs.google.com/spreadsheets/d/' + props.getProperty('SPREADSHEET_ID') + '/edit',publicSiteUrl:props.getProperty('SHOP_SITE_URL') || '',cloudinaryConfigured:Boolean(props.getProperty('CLOUDINARY_CLOUD_NAME') && props.getProperty('CLOUDINARY_API_KEY') && props.getProperty('CLOUDINARY_API_SECRET'))}};
}

function productValues_(product) {
  return PRODUCT_HEADERS_.map(function (key) {
    var value = product[key];
    return key === 'tags' || key === 'images' ? JSON.stringify(value || []) : value == null ? '' : value;
  });
}

function writeProductRow_(sheet,row,product) { writeRows_(sheet,row,[productValues_(product)],PRODUCT_HEADERS_.length); }

function writeRows_(sheet,startRow,rows,width) {
  if (!rows.length) return;
  var needed = startRow + rows.length - 1;
  if (needed > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(),needed-sheet.getMaxRows());
  // Prefix formula-leading user strings so Google Sheets stores them as text. Never evaluate pasted formulas.
  var safe = rows.map(function (row) { return row.map(function (value) { return typeof value === 'string' && /^[=+@-]/.test(value) ? "'" + value : value; }); });
  sheet.getRange(startRow,1,safe.length,width).setValues(safe);
}

function setArchived_(id,archived) {
  var product = readProducts_().filter(function (p) { return p.id === String(id); })[0];
  if (!product) throw new Error('Không tìm thấy sản phẩm.');
  product.archived = archived; product.visible = false; product.updatedAt = new Date().toISOString();
  writeProductRow_(getSheet_('Products',PRODUCT_HEADERS_),product._row,product);
  SpreadsheetApp.flush();
}

function writeSettings_(settings) {
  var sheet = getSheet_('Settings',['key','value']);
  var rows = SETTINGS_FIELDS_.map(function (key) { return [key,key === 'channels' ? JSON.stringify(settings.channels) : settings[key] == null ? '' : settings[key]]; });
  writeRows_(sheet,2,rows,2);
  if (sheet.getLastRow()>rows.length+1) sheet.getRange(rows.length+2,1,sheet.getLastRow()-rows.length-1,2).clearContent();
}

function writePrices_(items) {
  var sheet = getSheet_('PriceFilters',PRICE_HEADERS_);
  var oldLast = sheet.getLastRow();
  var rows = items.map(function (item) { return PRICE_HEADERS_.map(function (key) { return item[key] == null ? '' : item[key]; }); });
  if (rows.length) writeRows_(sheet,2,rows,PRICE_HEADERS_.length);
  if (oldLast>rows.length+1) sheet.getRange(rows.length+2,1,oldLast-rows.length-1,PRICE_HEADERS_.length).clearContent();
}

function validateProduct_(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Sản phẩm không hợp lệ.');
  var p = {id:text_(raw.id,100),code:text_(raw.code,60),name:text_(raw.name,200),category:text_(raw.category,100),description:text_(raw.description,10000),shortDescription:text_(raw.shortDescription,500),price:finite_(raw.price,'Giá bán',0,1e12),originalPrice:optionalFinite_(raw.originalPrice,'Giá gốc',0,1e12),tags:(Array.isArray(raw.tags) ? raw.tags : []).slice(0,20).map(function (value) { return text_(value,80); }).filter(Boolean),featured:raw.featured === true,visible:raw.visible !== false,status:['active','out_of_stock','draft'].indexOf(raw.status)>=0 ? raw.status : 'active',stock:optionalFinite_(raw.stock,'Tồn kho',0,1e9),images:productImages_(raw.images).map(imageUrl_).filter(Boolean),updatedAt:text_(raw.updatedAt,100),archived:raw.archived === true};
  if (!p.code || !p.name) throw new Error('Mã và tên sản phẩm là bắt buộc.');
  if (p.originalPrice && p.originalPrice < p.price) throw new Error('Giá gốc cần lớn hơn hoặc bằng giá bán.');
  if (p.stock != null && Math.floor(p.stock) !== p.stock) throw new Error('Tồn kho phải là số nguyên.');
  return p;
}

function validateSettings_(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Cấu hình shop không hợp lệ.');
  var s = defaultSettings_();
  SETTINGS_FIELDS_.forEach(function (key) { if (key !== 'channels') s[key] = text_(raw[key],key === 'about' ? 2000 : key === 'heroDescription' ? 1000 : 500); });
  if (!s.name) throw new Error('Tên shop là bắt buộc.');
  s.pageSize = finite_(raw.pageSize,'Số sản phẩm mỗi trang',1,100);
  if (Math.floor(s.pageSize) !== s.pageSize) throw new Error('Số sản phẩm mỗi trang phải là số nguyên.');
  if (CHANNELS_.indexOf(s.contactChannel)<0) throw new Error('Kênh liên hệ không hợp lệ.');
  s.logo = imageUrl_(raw.logo); s.heroImage = imageUrl_(raw.heroImage);
  var channels = raw.channels || {};
  CHANNELS_.forEach(function (key) { var url = text_(channels[key],2000); if (url && !/^https:\/\//i.test(url)) throw new Error('URL '+key+' phải bắt đầu bằng https://.'); s.channels[key] = url; });
  return s;
}

function validatePrices_(raw) {
  if (!Array.isArray(raw) || raw.length>100) throw new Error('Bộ lọc giá không hợp lệ hoặc vượt 100 khoảng.');
  var ids = {};
  return raw.map(function (item) {
    var p = {id:text_(item.id,100) || 'gia-'+Utilities.getUuid(),label:text_(item.label,100),min:finite_(item.min === '' || item.min == null ? 0 : item.min,'Giá từ',0,1e12),max:optionalFinite_(item.max,'Giá đến',0,1e12),sort:finite_(item.sort || 0,'Thứ tự',-10000,10000),enabled:item.enabled !== false};
    if (!p.label) throw new Error('Tên khoảng giá là bắt buộc.');
    if (p.max != null && p.max<p.min) throw new Error('Giá đến cần lớn hơn hoặc bằng giá từ.');
    if (Math.floor(p.sort) !== p.sort) throw new Error('Thứ tự phải là số nguyên.');
    if (ids['$'+p.id]) throw new Error('ID khoảng giá bị trùng.');
    ids['$'+p.id] = true; return p;
  });
}

function productImages_(values) {
  return (Array.isArray(values) ? values : []).filter(function (value) { return String(value == null ? '' : value).trim() !== ''; }).slice(0,MAX_PRODUCT_IMAGES_);
}

function imageUrl_(value) {
  var url = text_(value,3000);
  if (!url || /^https:\/\//i.test(url) || /^assets\/[a-zA-Z0-9_./-]+$/.test(url)) return url;
  throw new Error('Ảnh phải là URL HTTPS hoặc đường dẫn assets/. Ảnh base64 ở bản local cần được tải lên Cloudinary trong Admin trước khi dùng Google Sheets.');
}

function defaultSettings_() { return {name:'My Shop',slogan:'Uy tín · Giá tốt',logo:'',seoTitle:'My Shop · Phụ kiện công nghệ',seoDescription:'Cửa hàng phụ kiện công nghệ.',heroEyebrow:'PHỤ KIỆN CÔNG NGHỆ',heroTitle:'Công nghệ\nphù hợp với bạn',heroDescription:'Những lựa chọn tốt cho công việc và cuộc sống.',heroImage:'',heroBadge:'SẢN PHẨM CHỌN LỌC',heroHighlight:'Khám phá ngay',heroProductName:'',heroProductDescription:'',about:'',address:'',phone:'',email:'',fanpageName:'',fanpageUsername:'',pageSize:5,contactChannel:'messenger',channels:{messenger:'',instagram:'',zalo:'',zaloOA:'',tiktok:''}}; }
function text_(value,max) { return String(value == null ? '' : value).trim().slice(0,max); }
function finite_(value,label,min,max) { if(value==null || (typeof value==='string' && value.trim()===''))throw new Error(label+' là bắt buộc.');var num=Number(value);if(!isFinite(num)||num<min||num>max)throw new Error(label+' không hợp lệ.');return num; }
function optionalFinite_(value,label,min,max) { return value === '' || value == null ? null : finite_(value,label,min,max); }
function number_(value,fallback) { var n=Number(value);return value==='' || value==null || !isFinite(n)?fallback:n; }
function nullableNumber_(value) { return value === '' || value == null ? null : number_(value,null); }
function bool_(value,fallback) { if(value==='' || value==null)return fallback;return value===true || value===1 || /^(true|1|yes)$/i.test(String(value)); }
function parseArray_(value) { if(Array.isArray(value))return value;try{var result=JSON.parse(String(value || '[]'));return Array.isArray(result)?result:[];}catch(error){return [];} }
function parseObject_(value) { try{var result=JSON.parse(String(value || '{}'));return result && typeof result==='object' && !Array.isArray(result)?result:{};}catch(error){return {};} }
function escapeHtml_(value) { return String(value || '').replace(/[&<>"']/g,function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
