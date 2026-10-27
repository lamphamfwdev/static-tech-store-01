/* Các hàm nghiệp vụ độc lập với DOM, dùng chung cho trình duyệt và kiểm thử Node. */
(function (root, factory) {
  'use strict';
  var core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  root.ShopCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var MAX_PRODUCT_IMAGES = 4;
  function normalize(value) {
    return String(value == null ? '' : value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function number(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : (fallback == null ? 0 : fallback);
  }
  function bool(value, fallback) {
    if (value == null || value === '') return fallback;
    return value === true || value === 1 || /^(true|1)$/i.test(String(value));
  }
  function safeImage(value, fallback) {
    var url = String(value || '').trim();
    if (/^(https?:\/\/|data:image\/(png|jpe?g|webp|avif|gif);base64,)/i.test(url)) return url;
    if (/^(\.\/)?assets\/[a-z0-9_./% -]+$/i.test(url) && url.indexOf('..') === -1) return url;
    return fallback || 'assets/images/earbuds.jpg';
  }
  function productImages(values) {
    if (!Array.isArray(values)) return [];
    return values.filter(function(value){return typeof value === 'string' && value.trim();})
      .slice(0,MAX_PRODUCT_IMAGES).map(function(value){return safeImage(value);});
  }
  function safeLink(value) {
    var url = String(value || '').trim();
    return /^https:\/\/[^\s<>"']+$/i.test(url) ? url : '';
  }
  function productIdFromHash(hash) {
    var match = /^#product=(.+)$/.exec(String(hash || ''));
    if (!match) return null;
    try { return decodeURIComponent(match[1]) || null; }
    catch (_) { return null; }
  }
  function productLink(pageUrl, id) {
    if (id == null || String(id) === '') return '';
    try {
      var url = new URL(String(pageUrl));
      if (!/^(https?:|file:)$/.test(url.protocol)) return '';
      url.hash = 'product=' + encodeURIComponent(String(id));
      return url.href;
    } catch (_) { return ''; }
  }
  function stockOf(product) {
    return product.stock == null || product.stock === '' ? null : Math.floor(number(product.stock));
  }
  function isVisible(product) {
    return !bool(product.archived, false) && bool(product.visible, true) && product.status !== 'draft';
  }
  function isAvailable(product) {
    return isVisible(product) && product.status !== 'out_of_stock' && stockOf(product) !== 0;
  }
  function normalizeCatalog(raw, defaults) {
    if (!raw || !Array.isArray(raw.products)) throw new Error('Dữ liệu danh mục không hợp lệ.');
    defaults = defaults || {settings:{},priceFilters:[]};
    var seen = Object.create(null);
    var products = raw.products.filter(function(p) { return p && (p.id || p.code) && p.name; }).map(function(p) {
      var id = String(p.id || p.code);
      var tags = Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',');
      var images = Array.isArray(p.images) ? p.images : [];
      return Object.assign({}, p, {
        id:id, code:String(p.code || id), name:String(p.name), category:String(p.category || 'Phụ kiện khác'),
        description:String(p.description || ''), shortDescription:String(p.shortDescription || ''),
        price:number(p.price), originalPrice:number(p.originalPrice), stock:stockOf(p),
        visible:bool(p.visible, true), featured:bool(p.featured, false), archived:bool(p.archived, false),
        status:['active','out_of_stock','draft'].indexOf(p.status) > -1 ? p.status : 'active',
        tags:tags.map(function(t){return String(t).trim();}).filter(Boolean),
        images:productImages(images), updatedAt:String(p.updatedAt || '')
      });
    }).filter(function(p){if(seen[p.id])return false;seen[p.id]=true;return true;});
    var settings = Object.assign({}, defaults.settings, raw.settings || {});
    settings.channels = Object.assign({}, defaults.settings.channels || {}, (raw.settings || {}).channels || {});
    settings.pageSize = Math.min(100, Math.max(1, Math.floor(number(settings.pageSize,5)) || 5));
    var priceFilters = (Array.isArray(raw.priceFilters) ? raw.priceFilters : defaults.priceFilters || []).filter(function(f){return f && bool(f.enabled,true);}).map(function(f){
      return {id:String(f.id),label:String(f.label || ''),min:number(f.min),max:f.max == null || f.max === '' ? null : number(f.max),sort:Number.isFinite(Number(f.sort)) ? Number(f.sort) : 0,enabled:true};
    }).filter(function(f){return f.max === null || f.max >= f.min;}).sort(function(a,b){return a.sort-b.sort;});
    return {products:products,settings:settings,priceFilters:priceFilters};
  }
  function filterProducts(products, options) {
    options = options || {};
    var keywords = normalize(options.query).split(' ').filter(Boolean);
    var categories = options.categories || [];
    var range = options.priceRange;
    var result = products.filter(function(p) {
      if(!isVisible(p)) return false;
      if(categories.length && categories.indexOf(p.category) === -1) return false;
      if(range && (p.price < range.min || (range.max != null && p.price > range.max))) return false;
      var haystack=normalize([p.code,p.name,p.description,p.shortDescription,p.category].concat(p.tags || []).join(' '));
      return keywords.every(function(word){return haystack.indexOf(word)>-1;});
    });
    var sort=options.sort || 'featured';
    return result.sort(function(a,b){
      if(sort==='price-asc') return a.price-b.price;
      if(sort==='price-desc') return b.price-a.price;
      if(sort==='name') return a.name.localeCompare(b.name,'vi');
      if(sort==='newest') return (Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0);
      return Number(b.featured)-Number(a.featured);
    });
  }
  function paginate(items,page,pageSize) {
    pageSize=Math.max(1,Math.floor(number(pageSize,5)) || 5);
    var totalPages=Math.max(1,Math.ceil(items.length/pageSize));
    page=Math.min(totalPages,Math.max(1,Math.floor(number(page,1)) || 1));
    return {items:items.slice((page-1)*pageSize,page*pageSize),page:page,totalPages:totalPages,total:items.length,from:items.length?(page-1)*pageSize+1:0,to:Math.min(page*pageSize,items.length)};
  }
  function quantityLimit(product,max) {
    var stock=stockOf(product);
    return isAvailable(product) ? Math.min(stock == null ? Infinity : stock,max || 99) : 0;
  }
  function reconcileCart(cart,products,max) {
    if(!Array.isArray(cart)) return [];
    var byId=Object.create(null), quantities=Object.create(null);
    products.forEach(function(p){byId[p.id]=p;});
    cart.forEach(function(item){
      if(!item || !byId[item.id] || !isAvailable(byId[item.id])) return;
      var qty=Math.floor(number(item.quantity));
      if(qty) quantities[item.id]=(quantities[item.id]||0)+qty;
    });
    return Object.keys(quantities).map(function(id){return {id:id,quantity:Math.min(quantities[id],quantityLimit(byId[id],max))};}).filter(function(item){return item.quantity>0;});
  }
  function cartSummary(cart,products,max) {
    var byId=Object.create(null); products.forEach(function(p){byId[p.id]=p;});
    var items=reconcileCart(cart,products,max).map(function(item){return {product:byId[item.id],quantity:item.quantity,total:byId[item.id].price*item.quantity};});
    return {items:items,count:items.reduce(function(s,i){return s+i.quantity;},0),lines:items.length,total:items.reduce(function(s,i){return s+i.total;},0)};
  }
  function formatMoney(value) {return new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0}).format(number(value))+' đ';}
  function orderCode(date) {
    var d=date || new Date();
    var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d);
    var m={};parts.forEach(function(p){m[p.type]=p.value;});
    return 'DH-'+m.year+m.month+m.day+'-'+m.hour+m.minute+m.second;
  }
  function formatOrder(summary,shopName,code) {
    return ['Xin chào '+(shopName || 'shop')+', mình muốn đặt các sản phẩm sau:', '', 'Mã tham chiếu tạm: '+code].concat(summary.items.map(function(item,i){
      return (i+1)+'. '+item.product.name+' ['+item.product.code+']\n   '+item.quantity+' × '+formatMoney(item.product.price)+' = '+formatMoney(item.total);
    })).concat(['','Tổng tạm tính: '+formatMoney(summary.total),'Chưa gồm phí giao hàng. Nhờ shop xác nhận tồn kho và tổng tiền giúp mình.']).join('\n');
  }
  return {MAX_PRODUCT_IMAGES:MAX_PRODUCT_IMAGES,productImages:productImages,normalize:normalize,number:number,bool:bool,safeImage:safeImage,safeLink:safeLink,productIdFromHash:productIdFromHash,productLink:productLink,stockOf:stockOf,isVisible:isVisible,isAvailable:isAvailable,normalizeCatalog:normalizeCatalog,filterProducts:filterProducts,paginate:paginate,quantityLimit:quantityLimit,reconcileCart:reconcileCart,cartSummary:cartSummary,formatMoney:formatMoney,orderCode:orderCode,formatOrder:formatOrder};
});
