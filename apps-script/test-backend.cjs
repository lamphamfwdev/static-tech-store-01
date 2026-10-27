/* Offline business/security tests using in-memory Google service doubles.
 * Run: node apps-script/test-backend.cjs
 * These tests do not connect to Google or Cloudinary and do not prove a live deployment.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = __dirname;
let total = 0;
const rawWrites = [];

class Sheet {
  constructor(name) { this.name=name;this.grid=[];this.capacity=1000; }
  getName(){return this.name;}
  getMaxRows(){return this.capacity;}
  insertRowsAfter(_at,count){this.capacity+=count;return this;}
  getLastRow(){for(let i=this.grid.length-1;i>=0;i--)if((this.grid[i]||[]).some(value=>value!==''&&value!=null))return i+1;return 0;}
  setFrozenRows(){return this;}
  getRange(row,col,height,width){
    const sheet=this;
    const range={
      getValues(){return Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>(sheet.grid[row-1+y]||[])[col-1+x]??''));},
      getDisplayValues(){return this.getValues().map(r=>r.map(v=>String(v)));},
      setValues(values){assert.equal(values.length,height);rawWrites.push({sheet:sheet.name,row,col,values:JSON.parse(JSON.stringify(values))});values.forEach((valuesRow,y)=>{assert.equal(valuesRow.length,width);const target=sheet.grid[row-1+y]||(sheet.grid[row-1+y]=[]);valuesRow.forEach((value,x)=>{target[col-1+x]=typeof value==='string'&&value.startsWith("'")?value.slice(1):value;});});return this;},
      clearContent(){return this.setValues(Array.from({length:height},()=>Array(width).fill('')));},
      setFontWeight(){return this;},setBackground(){return this;}
    };
    return range;
  }
}
const sheets=new Map();
const book={getSheetByName:name=>sheets.get(name)||null,insertSheet:name=>{const sheet=new Sheet(name);sheets.set(name,sheet);return sheet;}};
const properties={SPREADSHEET_ID:'test-sheet',ADMIN_EMAIL:'owner@example.test',CLOUDINARY_CLOUD_NAME:'shop-demo',CLOUDINARY_API_KEY:'public-key',CLOUDINARY_API_SECRET:'test-secret',SHOP_SITE_URL:'https://example.test/shop/'};
let activeEmail='owner@example.test';
const cacheData=new Map();
const cache={put(key,value,ttl){assert.equal(ttl,30);assert.ok(Buffer.byteLength(value,'utf8')<100000);cacheData.set(key,value);},get:key=>cacheData.get(key)||null,getAll:keys=>Object.fromEntries(keys.filter(key=>cacheData.has(key)).map(key=>[key,cacheData.get(key)]))};
const shared={
  console,
  SpreadsheetApp:{openById(id){assert.equal(id,'test-sheet');return book;},flush(){}},
  PropertiesService:{getScriptProperties:()=>({getProperty:name=>properties[name]||null})},
  Session:{getActiveUser:()=>({getEmail:()=>activeEmail}),getEffectiveUser:()=>({getEmail:()=>properties.ADMIN_EMAIL})},
  LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},
  Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(algorithm,value)=>[...crypto.createHash(algorithm).update(value).digest()].map(byte=>byte>127?byte-256:byte)},
  CacheService:{getScriptCache:()=>cache},
  ContentService:{MimeType:{JAVASCRIPT:'javascript',JSON:'json'},createTextOutput:text=>({text,setMimeType(type){this.type=type;return this;}})},
  HtmlService:{createHtmlOutput:html=>({html}),createHtmlOutputFromFile:name=>({name,setTitle(){return this;},addMetaTag(){return this;}})}
};
function context(file){const ctx=vm.createContext({...shared});vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});return ctx;}
const admin=context('admin/Code.gs'),api=context('public-api/Code.gs');
// Load the real client validation/import functions without a browser or UI bootstrap.
const clientSource=fs.readFileSync(path.join(root,'../assets/js/admin.js'),'utf8').replace("if(document.readyState==='loading')", "window.__adminValidation={validateProduct,normalizeCatalog}; if(document.readyState==='loading')");
const clientContext=vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}},URL,Intl,crypto,console});
vm.runInContext(clientSource,clientContext,{filename:'admin.js (validation-only)'});
const client=clientContext.window.__adminValidation;
function test(name,fn){fn();total++;process.stdout.write('PASS '+name+'\n');}
const parse=value=>JSON.parse(JSON.stringify(value));
let first;

test('Setup creates the exact three schemas without replacing data',()=>{admin.setupShop();assert.equal(sheets.size,3);assert.equal(sheets.get('Products').getLastRow(),1);assert.equal(sheets.get('Settings').grid[0].join(','),'key,value');admin.setupShop();assert.equal(sheets.size,3);});
test('Anonymous active user is denied even when effective user is owner',()=>{activeEmail='';assert.throws(()=>admin.adminBootstrap(),/Google chưa cung cấp email/);assert.throws(()=>admin.adminUploadSignature('product'));activeEmail='owner@example.test';});
test('An authenticated email outside allowlist cannot mutate data',()=>{activeEmail='other@example.test';assert.throws(()=>admin.adminSaveProduct({}),/không nằm trong/);activeEmail='owner@example.test';});
test('Create stores validated fields and survives a full read',()=>{const result=admin.adminSaveProduct({code:'SP-001',name:'Cáp USB-C',price:99000,originalPrice:120000,status:'active',visible:true,stock:null,tags:['USB-C'],images:['assets/images/cable.jpg']});first=parse(result.catalog.products[0]);assert.ok(first.id);assert.equal(first.price,99000);assert.equal(first.stock,null);assert.equal(first.images[0],'assets/images/cable.jpg');assert.ok(!('_row' in first));});
test('Duplicate product codes are rejected case-insensitively',()=>{assert.throws(()=>admin.adminSaveProduct({code:'sp-001',name:'Trùng',price:1}),/đã tồn tại/);});
test('Invalid prices, stock and unsafe image URLs are rejected',()=>{for(const extra of [{price:-1},{stock:1.5},{images:['javascript:alert(1)']},{originalPrice:50}])assert.throws(()=>admin.validateProduct_({code:'B',name:'B',price:100,...extra}));});
test('Blank and missing prices are rejected before client/import/server numeric conversion',()=>{for(const price of ['',null,undefined,' \t ']){const product={code:'ZERO',name:'Zero',price};assert.throws(()=>client.validateProduct(product),/giá bán/);assert.throws(()=>client.normalizeCatalog({products:[product],settings:{name:'Shop',pageSize:5},priceFilters:[]}),/giá bán/);assert.throws(()=>admin.validateProduct_(product),/Giá bán/);}for(const price of [0,'0']){assert.equal(client.validateProduct({code:'ZERO',name:'Zero',price}).price,0);assert.equal(admin.validateProduct_({code:'ZERO',name:'Zero',price}).price,0);assert.equal(client.normalizeCatalog({products:[{id:'zero',code:'ZERO',name:'Zero',price}],settings:{name:'Shop',pageSize:5},priceFilters:[]}).products[0].price,0);}});
test('Update uses optimistic updatedAt checks',()=>{const modified={...first,name:'Cáp cập nhật',updatedAt:'stale-version'};assert.throws(()=>admin.adminSaveProduct(modified),/đã được cập nhật/);const result=admin.adminSaveProduct({...first,name:'Cáp cập nhật'});first=parse(result.catalog.products[0]);assert.equal(first.name,'Cáp cập nhật');});
test('Clone is a new product hidden in draft status',()=>{const result=admin.adminCloneProduct(first.id);const clone=result.catalog.products.find(p=>p.id!==first.id);assert.ok(clone.code.startsWith('SP-001-COPY-'));assert.equal(clone.visible,false);assert.equal(clone.status,'draft');assert.equal(result.catalog.products.length,2);});
test('Public projection hides draft, hidden and archived products',()=>{const data=api.publicCatalog_();assert.equal(data.products.length,1);assert.equal(data.products[0].id,first.id);assert.ok(!('meta' in data));assert.ok(!('ADMIN_EMAIL' in data.settings));});
test('Archive preserves the product row and restore keeps it hidden',()=>{let snapshot=admin.adminArchiveProduct(first.id);assert.equal(snapshot.catalog.products.length,2);assert.equal(snapshot.catalog.products.find(p=>p.id===first.id).archived,true);assert.equal(api.publicCatalog_().products.length,0);snapshot=admin.adminRestoreProduct(first.id);const p=snapshot.catalog.products.find(p=>p.id===first.id);assert.equal(p.archived,false);assert.equal(p.visible,false);});
test('Settings accept only declared fields and safe contact URLs',()=>{const base=admin.readSettings_();admin.adminSaveSettings({...base,name:'Shop thử nghiệm',ADMIN_EMAIL:'do-not-publish',channels:{messenger:'https://m.me/shop'}});assert.equal(api.publicCatalog_().settings.name,'Shop thử nghiệm');assert.ok(!('ADMIN_EMAIL' in api.publicCatalog_().settings));assert.throws(()=>admin.adminSaveSettings({...base,channels:{messenger:'javascript:alert(1)'}}));});
test('Price filters sort, toggle and delete correctly',()=>{admin.adminSavePriceFilters([{id:'high',label:'Cao',min:100000,max:null,sort:2,enabled:true},{id:'low',label:'Thấp',min:0,max:99999,sort:1,enabled:true},{id:'off',label:'Ẩn',min:0,max:null,sort:0,enabled:false}]);assert.deepEqual(parse(api.publicCatalog_().priceFilters.map(p=>p.id)),['low','high']);admin.adminSavePriceFilters([]);assert.equal(admin.readPrices_().length,0);assert.throws(()=>admin.adminSavePriceFilters([{label:'Sai',min:20,max:10}]));});
test('Unsafe JSONP callbacks cannot inject JavaScript',()=>{for(const callback of ['x);alert(1)//','a.b','x[0]','x\nalert(1)']){const output=api.doGet({parameter:{callback}});assert.equal(output.type,'json');assert.equal(JSON.parse(output.text).error,'Invalid callback');}});
test('Valid JSONP wraps only public catalog data',()=>{const output=api.doGet({parameter:{callback:'shop_callback_123'}});assert.equal(output.type,'javascript');assert.ok(output.text.startsWith('shop_callback_123('));assert.ok(!output.text.includes('test-secret'));assert.ok(!output.text.includes('owner@example.test'));});
test('Cache safely reconstructs Unicode data across chunk boundaries',()=>{const payload=JSON.stringify({text:'a'.repeat(19990)+'📱'.repeat(17000)+'đẹp'});api.tryCache_(payload);assert.equal(api.getCached_(),payload);const manifest=JSON.parse(cacheData.get(api.CACHE_KEY_));cacheData.delete(manifest.keys[1]);assert.equal(api.getCached_(),null);});
test('Signed upload matches SHA-256 and does not return the secret',()=>{const signed=parse(admin.adminUploadSignature('product'));const text=Object.keys(signed.params).sort().map(key=>key+'='+signed.params[key]).join('&')+properties.CLOUDINARY_API_SECRET;assert.equal(signed.signature,crypto.createHash('sha256').update(text).digest('hex'));assert.equal(signed.params.overwrite,false);assert.ok(!JSON.stringify(signed).includes('test-secret'));assert.throws(()=>admin.adminUploadSignature('arbitrary'));});
test('Catalog import refuses replacing existing products',()=>{assert.throws(()=>admin.adminImportCatalog({products:[],settings:admin.readSettings_(),priceFilters:[]}),/Products đang trống/);});
test('User-entered formula text is escaped before writing',()=>{const p=admin.validateProduct_({code:'FORMULA',name:'=IMPORTXML("https://bad.invalid","//x")',price:1});admin.adminSaveProduct(p);const write=rawWrites.filter(item=>item.sheet==='Products').at(-1);assert.equal(write.values[0][2],"'"+p.name);const stored=admin.readProducts_().find(item=>item.code==='FORMULA');assert.equal(stored.name,p.name);});
test('Public API project contains no write endpoint or admin function',()=>{const source=fs.readFileSync(path.join(root,'public-api/Code.gs'),'utf8');assert.ok(!/function\s+(doPost|admin\w+)\s*\(/.test(source));assert.ok(!/\.setValues\s*\(|\.appendRow\s*\(|\.deleteRow\s*\(/.test(source));});

const galleryImages=Array.from({length:5},(_,index)=>'assets/images/gallery-'+(index+1)+'.jpg');
test('Client and server keep four product images without counting blank slots',()=>{
  const images=['',galleryImages[0],null,' \t ',...galleryImages.slice(1)];
  const original=JSON.stringify(images);
  const input={code:'GALLERY-VALIDATION',name:'Bộ ảnh',price:100,images};
  assert.deepEqual(parse(client.validateProduct(input).images),galleryImages.slice(0,4));
  assert.deepEqual(parse(admin.validateProduct_(input).images),galleryImages.slice(0,4));
  assert.equal(JSON.stringify(images),original);
});
test('Client catalog import applies the four-image limit to every product',()=>{
  const catalog=client.normalizeCatalog({products:[{id:'four',code:'FOUR',name:'Bốn ảnh',price:100,images:galleryImages},{id:'empty',code:'EMPTY',name:'Chưa có ảnh',price:100,images:['',null,' ']}],settings:{name:'Shop',pageSize:5},priceFilters:[]});
  assert.deepEqual(parse(catalog.products[0].images),galleryImages.slice(0,4));
  assert.deepEqual(parse(catalog.products[1].images),[]);
});
test('Saving a gallery stores four images and returns the same order in snapshots and public data',()=>{
  const saved=admin.adminSaveProduct({code:'GALLERY-SAVE',name:'Bộ ảnh đã lưu',price:100,status:'active',visible:true,images:galleryImages});
  const product=saved.catalog.products.find(item=>item.code==='GALLERY-SAVE');
  const imageColumn=admin.PRODUCT_HEADERS_.indexOf('images');
  const row=sheets.get('Products').grid.find(item=>item[0]===product.id);
  assert.deepEqual(parse(product.images),galleryImages.slice(0,4));
  assert.deepEqual(JSON.parse(row[imageColumn]),galleryImages.slice(0,4));
  assert.deepEqual(parse(api.publicCatalog_().products.find(item=>item.id===product.id).images),galleryImages.slice(0,4));
});
test('Reading a legacy five-image row exposes four without changing the stored cells',()=>{
  const sheet=sheets.get('Products');
  const legacy={...first,id:'gallery-legacy',code:'GALLERY-LEGACY',visible:true,status:'active',images:['',...galleryImages]};
  sheet.grid.push(parse(admin.productValues_(legacy)));
  const rawRow=JSON.stringify(sheet.grid[sheet.grid.length-1]);
  const writesBefore=rawWrites.length;
  assert.deepEqual(parse(admin.readProducts_().find(item=>item.id===legacy.id).images),galleryImages.slice(0,4));
  assert.deepEqual(parse(admin.adminBootstrap().catalog.products.find(item=>item.id===legacy.id).images),galleryImages.slice(0,4));
  assert.deepEqual(parse(api.publicCatalog_().products.find(item=>item.id===legacy.id).images),galleryImages.slice(0,4));
  assert.equal(rawWrites.length,writesBefore);
  assert.equal(JSON.stringify(sheet.grid[sheet.grid.length-1]),rawRow);
});
test('Public gallery skips unsafe or empty entries before applying the four-image maximum',()=>{
  const legacy={...first,id:'gallery-public',code:'GALLERY-PUBLIC',visible:true,status:'active',images:['','javascript:alert(1)',null,...galleryImages]};
  sheets.get('Products').grid.push(parse(admin.productValues_(legacy)));
  const product=api.publicCatalog_().products.find(item=>item.id===legacy.id);
  assert.deepEqual(parse(product.images),galleryImages.slice(0,4));
});

process.stdout.write('\n'+total+' offline backend checks passed. Live Google/Cloudinary setup remains to be verified after deployment.\n');
