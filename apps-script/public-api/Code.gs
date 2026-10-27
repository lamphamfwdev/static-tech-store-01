/**
 * WebShop100 — PUBLIC READ-ONLY API PROJECT.
 * Deploy separately from Admin: Execute as Me, access Anyone.
 * ONLY Script Property needed: SPREADSHEET_ID. No secrets in this project.
 */
var PRODUCT_HEADERS_ = ['id','code','name','category','description','shortDescription','price','originalPrice','tags','featured','visible','status','stock','images','updatedAt','archived'];
var PRICE_HEADERS_ = ['id','label','min','max','sort','enabled'];
var PUBLIC_SETTING_KEYS_ = ['name','slogan','logo','seoTitle','seoDescription','heroEyebrow','heroTitle','heroDescription','heroImage','heroBadge','heroHighlight','heroProductName','heroProductDescription','about','address','phone','email','fanpageName','fanpageUsername','pageSize','contactChannel','channels'];
var CHANNEL_KEYS_ = ['messenger','instagram','zalo','zaloOA','tiktok'];
var CACHE_KEY_ = 'webshop100-public-catalog-v1';
var MAX_PRODUCT_IMAGES_ = 4;

function doGet(event) {
  var callback = event && event.parameter && event.parameter.callback || '';
  // A single JavaScript identifier only. Dots, parentheses, brackets and semicolons are rejected.
  if (callback && !/^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(callback)) return output_({ok:false,error:'Invalid callback'},'');
  try {
    var cached = getCached_();
    if (cached) return output_(JSON.parse(cached),callback);
    var catalog = publicCatalog_();
    tryCache_(JSON.stringify(catalog));
    return output_(catalog,callback);
  } catch (error) {
    console.error('Public catalog error: ' + String(error));
    // Do not expose sheet identifiers, permissions or server diagnostics in public responses.
    return output_({ok:false,error:'Catalog temporarily unavailable'},callback);
  }
}

function output_(data,callback) {
  var json = JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback ? callback+'('+json+');' : json)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function publicCatalog_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID not configured');
  var book = SpreadsheetApp.openById(id);
  var products = rows_(book,'Products',PRODUCT_HEADERS_).filter(function (p) {
    return !bool_(p.archived,false) && bool_(p.visible,true) && (p.status === 'active' || p.status === 'out_of_stock');
  }).map(function (p) {
    // Explicit public projection: nothing else from the sheet is returned.
    return {id:String(p.id),code:String(p.code),name:String(p.name),category:String(p.category || ''),description:String(p.description || ''),shortDescription:String(p.shortDescription || ''),price:number_(p.price,0),originalPrice:optionalNumber_(p.originalPrice),tags:array_(p.tags).map(String).slice(0,20),featured:bool_(p.featured,false),visible:true,status:p.status,stock:optionalNumber_(p.stock),images:array_(p.images).filter(imageAllowed_).slice(0,MAX_PRODUCT_IMAGES_),updatedAt:String(p.updatedAt || ''),archived:false};
  });
  var settings = {name:'My Shop',pageSize:5,contactChannel:'messenger',channels:{}};
  rows_(book,'Settings',['key','value']).forEach(function (row) {
    if (PUBLIC_SETTING_KEYS_.indexOf(row.key)<0) return;
    if (row.key === 'channels') {
      var parsed = object_(row.value);
      CHANNEL_KEYS_.forEach(function (key) { var value=String(parsed[key] || '');settings.channels[key]=/^https:\/\//i.test(value)?value:''; });
    } else if (row.key === 'pageSize') settings.pageSize=Math.max(1,Math.min(100,Math.floor(number_(row.value,5))));
    else if (row.key === 'logo' || row.key === 'heroImage') settings[row.key]=imageAllowed_(row.value)?String(row.value):'';
    else settings[row.key]=String(row.value == null ? '' : row.value);
  });
  var priceFilters = rows_(book,'PriceFilters',PRICE_HEADERS_).filter(function (p) { return bool_(p.enabled,true); }).map(function (p) {
    return {id:String(p.id),label:String(p.label),min:number_(p.min,0),max:optionalNumber_(p.max),sort:number_(p.sort,0),enabled:true};
  }).filter(function (p) { return p.min>=0 && (p.max == null || p.max>=p.min); }).sort(function (a,b) { return a.sort-b.sort; });
  return {ok:true,products:products,settings:settings,priceFilters:priceFilters,generatedAt:new Date().toISOString()};
}

function rows_(book,name,headers) {
  var sheet=book.getSheetByName(name);
  if(!sheet)throw new Error('Missing sheet '+name);
  var actual=sheet.getRange(1,1,1,headers.length).getDisplayValues()[0];
  if(headers.some(function(key,index){return actual[index]!==key;}))throw new Error('Unexpected schema '+name);
  if(sheet.getLastRow()<2)return [];
  return sheet.getRange(2,1,sheet.getLastRow()-1,headers.length).getValues().map(function(row){
    var result={};headers.forEach(function(key,index){result[key]=row[index] instanceof Date?row[index].toISOString():row[index];});return result;
  }).filter(function(row){return String(row[headers[0]] || '').trim()!=='';});
}

function tryCache_(json) {
  // CacheService has a per-key limit. Chunk under 100 KB and publish the manifest last.
  // UTF-16 code units use at most 3 bytes each in UTF-8; 20,000 units remain safely below that limit.
  try {
    if (json.length > 3000000) return;
    var cache=CacheService.getScriptCache(),chunks=[],token=Utilities.getUuid();
    for(var offset=0;offset<json.length;){
      var end=Math.min(offset+20000,json.length);
      var last=json.charCodeAt(end-1);
      if(end<json.length && last>=0xD800 && last<=0xDBFF)end--;
      var key=CACHE_KEY_+'-'+token+'-'+chunks.length;
      cache.put(key,json.slice(offset,end),30);chunks.push(key);offset=end;
    }
    // Large catalogs should still be served even when they exceed cache capacity.
    if(chunks.length<=150)cache.put(CACHE_KEY_,JSON.stringify({keys:chunks}),30);
  }catch(error){console.warn('Cache skipped: '+String(error));}
}

function getCached_() {
  try {
    var cache=CacheService.getScriptCache(),manifest=cache.get(CACHE_KEY_);
    if(!manifest)return null;
    var keys=JSON.parse(manifest).keys;
    if(!Array.isArray(keys)||!keys.length)return null;
    var chunks=cache.getAll(keys);
    if(keys.some(function(key){return typeof chunks[key]!=='string';}))return null;
    return keys.map(function(key){return chunks[key];}).join('');
  }catch(error){return null;}
}

function bool_(value,fallback){if(value===''||value==null)return fallback;return value===true||value===1||/^(true|1|yes)$/i.test(String(value));}
function number_(value,fallback){var n=Number(value);return value===''||value==null||!isFinite(n)?fallback:n;}
function optionalNumber_(value){return value===''||value==null?null:number_(value,null);}
function array_(value){try{var parsed=JSON.parse(String(value||'[]'));return Array.isArray(parsed)?parsed:[];}catch(error){return [];}}
function object_(value){try{var parsed=JSON.parse(String(value||'{}'));return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}catch(error){return {};}}
function imageAllowed_(value){return typeof value==='string'&&(/^https:\/\//i.test(value)||/^assets\/[a-zA-Z0-9_./-]+$/.test(value));}
