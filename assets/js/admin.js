/* WebShop100 Admin — no build step. Apps Script uses this same UI through google.script.run. */
(function () {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const copy = value => JSON.parse(JSON.stringify(value));
  const config = window.SHOP_CONFIG || {};
  const dataKey = config.localDataKey || 'webshop100.catalog.v1';
  const remote = Boolean(window.google && window.google.script && window.google.script.run);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalizeText = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const uid = prefix => prefix + '-' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9));
  const currency = value => new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND', maximumFractionDigits:0}).format(Number(value) || 0);
  const dateLabel = value => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat('vi-VN', {day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(value)) : '—';
  const emptyImage = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f3ea"/><path d="M24 69h52V31H24zM25 66l19-20 13 14 8-10 10 13" fill="none" stroke="#c2c7b2" stroke-width="3"/><circle cx="63" cy="41" r="5" fill="#c2c7b2"/></svg>');
  const settingFields = ['name','slogan','logo','seoTitle','seoDescription','heroEyebrow','heroTitle','heroDescription','heroImage','heroBadge','heroHighlight','heroProductName','heroProductDescription','about','address','phone','email','fanpageName','fanpageUsername','pageSize','contactChannel'];
  const channelFields = ['messenger','instagram','zalo','zaloOA','tiktok'];
  const maxProductImages = 4;
  const state = {catalog:null, meta:{}, view:'products', page:1, pageSize:10, query:'', archived:false, draft:null, productDirty:false, settingsDirty:false, pricesDirty:false, priceDraft:[], loaded:false};
  let toastTimer;
  let pendingImageTarget = null;
  let crop = null;
  let decoderPromise;
  let confirmResolve = null;

  function notify(message, isError = false) {
    clearTimeout(toastTimer);
    const element = $('#toast');
    element.textContent = message;
    element.classList.toggle('error', isError);
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, isError ? 7000 : 3800);
  }
  function showError(selector, error) {
    const element = $(selector);
    element.textContent = error && error.message ? error.message : String(error);
    element.hidden = false;
  }
  async function withBusy(button, fn, text = 'Đang lưu…') {
    if (button.disabled) return;
    const old = button.textContent;
    button.disabled = true;
    button.textContent = text;
    try { return await fn(); }
    finally { button.disabled = false; button.textContent = old; }
  }
  function confirmAction(message, label = 'Xác nhận') {
    if (confirmResolve) return Promise.resolve(false);
    $('#confirm-message').textContent = message;
    $('#confirm-ok').textContent = label;
    $('#confirm-dialog').showModal();
    $('#confirm-cancel').focus();
    return new Promise(resolve => { confirmResolve = resolve; });
  }
  function finishConfirm(result) {
    $('#confirm-dialog').close();
    if (confirmResolve) { const resolve = confirmResolve; confirmResolve = null; resolve(result); }
  }
  function defaultCatalog() {
    const seed = window.SHOP_DATA || {products:[], settings:{name:'My Shop',slogan:'Uy tín · Giá tốt',pageSize:5,contactChannel:'messenger',channels:{}},priceFilters:[]};
    return copy(seed);
  }
  function normalizeCatalog(input) {
    if (!input || !Array.isArray(input.products) || !input.settings || !Array.isArray(input.priceFilters)) throw new Error('File cần chứa products, settings và priceFilters. Hãy chọn file JSON được xuất từ Admin.');
    if (input.products.length > 5000 || input.priceFilters.length > 100) throw new Error('Dữ liệu vượt giới hạn 5.000 sản phẩm hoặc 100 bộ lọc.');
    const seed = defaultCatalog();
    const ids = new Set(), codes = new Set();
    const products = input.products.map(raw => {
      const p = validateProduct(raw);
      p.id = String(raw.id || uid('sp'));
      if (ids.has(p.id) || codes.has(p.code.toLowerCase())) throw new Error('Trùng ID hoặc mã sản phẩm trong file: ' + p.code);
      ids.add(p.id); codes.add(p.code.toLowerCase());
      p.archived = raw.archived === true;
      p.updatedAt = raw.updatedAt || new Date().toISOString();
      return p;
    });
    return {products, settings:validateSettings({...seed.settings, ...input.settings}), priceFilters:validatePrices(input.priceFilters)};
  }
  function safeImageUrl(value) {
    const url = String(value || '').trim();
    if (!url) return '';
    if (/^https:\/\//i.test(url) || /^assets\/[a-zA-Z0-9_./-]+$/.test(url) || (!remote && /^data:image\/(?:jpeg|png|webp|avif);base64,[a-zA-Z0-9+/=]+$/.test(url))) return url;
    throw new Error('URL ảnh cần là HTTPS hoặc đường dẫn assets/ trong dự án.');
  }
  function productImages(values) {
    return (Array.isArray(values) ? values : []).filter(value=>String(value == null ? '' : value).trim() !== '').slice(0,maxProductImages);
  }
  function validateProduct(raw) {
    if (!raw || raw.price == null || (typeof raw.price === 'string' && raw.price.trim() === '')) throw new Error('Vui lòng nhập giá bán. Giá 0 cần được khai báo rõ bằng số 0.');
    const p = {
      id:String(raw.id || ''), code:String(raw.code || '').trim().slice(0,60), name:String(raw.name || '').trim().slice(0,200),
      category:String(raw.category || '').trim().slice(0,100), description:String(raw.description || '').slice(0,10000), shortDescription:String(raw.shortDescription || '').slice(0,500),
      price:Number(raw.price), originalPrice:raw.originalPrice === '' || raw.originalPrice == null ? null : Number(raw.originalPrice),
      tags:(Array.isArray(raw.tags) ? raw.tags : String(raw.tags || '').split(',')).map(tag=>String(tag).trim().slice(0,80)).filter(Boolean).slice(0,20),
      featured:raw.featured === true, visible:raw.visible !== false,
      status:['active','out_of_stock','draft'].includes(raw.status) ? raw.status : 'active',
      stock:raw.stock === '' || raw.stock == null ? null : Number(raw.stock),
      images:productImages(raw.images).map(safeImageUrl).filter(Boolean),
      updatedAt:raw.updatedAt || '', archived:raw.archived === true
    };
    if (!p.code || !p.name) throw new Error('Vui lòng nhập mã và tên sản phẩm.');
    if (!Number.isFinite(p.price) || p.price < 0 || p.price > 1e12) throw new Error('Giá bán phải là số từ 0 đến 1.000 tỷ.');
    if (p.originalPrice != null && (!Number.isFinite(p.originalPrice) || p.originalPrice < 0 || p.originalPrice > 1e12)) throw new Error('Giá gốc không hợp lệ.');
    if (p.originalPrice && p.originalPrice < p.price) throw new Error('Giá gốc cần lớn hơn hoặc bằng giá bán.');
    if (p.stock != null && (!Number.isInteger(p.stock) || p.stock < 0 || p.stock > 1e9)) throw new Error('Tồn kho phải là số nguyên từ 0 trở lên.');
    return p;
  }
  function validateSettings(raw) {
    const settings = {};
    settingFields.forEach(key => { settings[key] = String(raw[key] == null ? '' : raw[key]).trim(); });
    if (!settings.name) throw new Error('Vui lòng nhập tên shop.');
    settings.pageSize = Number(raw.pageSize);
    if (!Number.isInteger(settings.pageSize) || settings.pageSize < 1 || settings.pageSize > 100) throw new Error('Số sản phẩm/trang phải từ 1 đến 100.');
    if (!channelFields.includes(settings.contactChannel)) settings.contactChannel = 'messenger';
    settings.logo = safeImageUrl(settings.logo);
    settings.heroImage = safeImageUrl(settings.heroImage);
    settings.channels = {};
    channelFields.forEach(key => {
      const url = String(raw.channels && raw.channels[key] || '').trim();
      if (url && !/^https:\/\//i.test(url)) throw new Error('Liên kết ' + key + ' cần bắt đầu bằng https://.');
      settings.channels[key] = url;
    });
    return settings;
  }
  function validatePrices(items) {
    const seen = new Set();
    return items.map((raw,index) => {
      const item = {id:String(raw.id || uid('gia')), label:String(raw.label || '').trim(), min:raw.min === '' || raw.min == null ? 0 : Number(raw.min), max:raw.max === '' || raw.max == null ? null : Number(raw.max), sort:Number(raw.sort || 0), enabled:raw.enabled !== false};
      if (!item.label) throw new Error('Khoảng giá thứ ' + (index + 1) + ' chưa có tên.');
      if (seen.has(item.id)) throw new Error('ID khoảng giá bị trùng.');
      seen.add(item.id);
      if (!Number.isFinite(item.min) || item.min < 0 || item.min > 1e12 || (item.max != null && (!Number.isFinite(item.max) || item.max < item.min || item.max > 1e12))) throw new Error('Khoảng giá “' + item.label + '” không hợp lệ. Giá đến cần lớn hơn hoặc bằng giá từ.');
      if (!Number.isInteger(item.sort) || Math.abs(item.sort) > 10000) throw new Error('Thứ tự khoảng giá phải là số nguyên từ -10000 đến 10000.');
      item.label = item.label.slice(0,100);
      return item;
    });
  }
  function gsCall(method, ...args) {
    return new Promise((resolve,reject) => {
      window.google.script.run.withSuccessHandler(resolve).withFailureHandler(error => reject(new Error(error.message || String(error))))[method](...args);
    });
  }
  function persistLocal(catalog) {
    try { localStorage.setItem(dataKey, JSON.stringify(catalog)); }
    catch (error) { throw new Error('Bộ nhớ trình duyệt không đủ hoặc đang bị chặn. Hãy xuất bản sao JSON và dùng Google Sheets/Cloudinary để quản lý nhiều ảnh. Chưa ghi thay đổi này.'); }
    return {catalog:copy(catalog), meta:{mode:'local',email:'Chế độ dùng thử tại máy',publicSiteUrl:new URL('./', location.href).href}};
  }
  function latestLocalCatalog() {
    try { const saved=localStorage.getItem(dataKey);return saved?normalizeCatalog(JSON.parse(saved)):copy(state.catalog); }
    catch(error){throw new Error('Không đọc được dữ liệu local mới nhất. Hãy xuất bản sao và tải lại trang trước khi tiếp tục.');}
  }
  const repository = {
    async load() {
      if (remote) return gsCall('adminBootstrap');
      let saved = null;
      try { saved = localStorage.getItem(dataKey); } catch (error) { notify('Trình duyệt đang chặn lưu dữ liệu local.',true); }
      return {catalog:saved ? normalizeCatalog(JSON.parse(saved)) : defaultCatalog(), meta:{mode:'local',email:'Chế độ dùng thử tại máy',publicSiteUrl:new URL('./', location.href).href}};
    },
    async saveProduct(raw) {
      const p = validateProduct(raw);
      if (remote) return gsCall('adminSaveProduct',p);
      const next = latestLocalCatalog();
      if (next.products.some(item => item.id !== p.id && item.code.toLowerCase() === p.code.toLowerCase())) throw new Error('Mã sản phẩm đã tồn tại, kể cả trong danh sách lưu trữ.');
      const index = next.products.findIndex(item => item.id === p.id);
      if (p.id && index < 0) throw new Error('Không tìm thấy sản phẩm. Hãy tải lại dữ liệu.');
      if (index >= 0 && next.products[index].updatedAt !== p.updatedAt) throw new Error('Sản phẩm đã được thay đổi. Hãy tải lại trước khi lưu.');
      p.id = p.id || uid('sp'); p.updatedAt = new Date().toISOString();
      if (index < 0) next.products.unshift(p); else next.products[index] = p;
      return persistLocal(next);
    },
    async cloneProduct(id) {
      if (remote) return gsCall('adminCloneProduct',id);
      const next = latestLocalCatalog(), source = next.products.find(p=>p.id===id);
      if (!source) throw new Error('Không tìm thấy sản phẩm.');
      let suffix = 1, code;
      do { code = source.code.slice(0,45) + '-COPY-' + suffix++; } while (next.products.some(p=>p.code.toLowerCase()===code.toLowerCase()));
      next.products.unshift({...copy(source),id:uid('sp'),code,name:source.name.slice(0,185)+' (bản sao)',visible:false,status:'draft',archived:false,updatedAt:new Date().toISOString()});
      return persistLocal(next);
    },
    async archiveProduct(id, archived) {
      if (remote) return gsCall(archived ? 'adminArchiveProduct' : 'adminRestoreProduct',id);
      const next = latestLocalCatalog(), p = next.products.find(item=>item.id===id);
      if (!p) throw new Error('Không tìm thấy sản phẩm.');
      p.archived = archived; p.visible = false; p.updatedAt = new Date().toISOString();
      return persistLocal(next);
    },
    async saveSettings(settings) {
      const validated = validateSettings(settings);
      if (remote) return gsCall('adminSaveSettings',validated);
      const next = latestLocalCatalog(); next.settings = validated; return persistLocal(next);
    },
    async savePrices(items) {
      const validated = validatePrices(items);
      if (remote) return gsCall('adminSavePriceFilters',validated);
      const next = latestLocalCatalog(); next.priceFilters = validated; return persistLocal(next);
    },
    async importCatalog(catalog) {
      const valid = normalizeCatalog(catalog);
      if (remote) return gsCall('adminImportCatalog',valid);
      return persistLocal(valid);
    }
  };
  function acceptSnapshot(snapshot) {
    if (!snapshot || !snapshot.catalog) throw new Error('Dữ liệu quản trị không hợp lệ.');
    state.catalog = {...snapshot.catalog,products:snapshot.catalog.products.map(product=>({...product,images:productImages(product.images)}))};
    state.meta = snapshot.meta || {};
    state.loaded = true;
    state.priceDraft = copy(state.catalog.priceFilters);
    state.pricesDirty = false;
    state.settingsDirty = false;
    renderAll();
  }
  function previewUrl(url) {
    try {
      const checked = safeImageUrl(url);
      if (!checked) return emptyImage;
      if (remote && checked.startsWith('assets/')) return state.meta.publicSiteUrl ? new URL(checked,state.meta.publicSiteUrl.replace(/\/?$/,'/')).href : emptyImage;
      return checked;
    } catch (error) { return emptyImage; }
  }
  function renderMeta() {
    $('#admin-email').textContent = state.meta.email || '';
    $('#nav-count').textContent = state.catalog.products.filter(p=>!p.archived).length;
    $('#mode-chip').classList.toggle('remote',remote);
    $('#mode-chip').innerHTML = '<i></i>' + (remote ? 'Google Sheets' : 'Bản local');
    if (remote) {
      $('#mode-notice').innerHTML = '<span aria-hidden="true">✓</span><p>Dữ liệu được lưu vào Google Sheets. ' + (state.meta.cloudinaryConfigured ? 'Cloudinary đã kết nối.' : 'Chưa cấu hình Cloudinary; bạn vẫn có thể nhập URL ảnh HTTPS.') + '</p>';
      if (state.meta.sheetUrl) { $('#open-sheet').href=state.meta.sheetUrl; $('#open-sheet').hidden=false; }
      if (state.meta.publicSiteUrl) { $('#open-shop').href=state.meta.publicSiteUrl; $('#brand-home').href=state.meta.publicSiteUrl; } else { $('#open-shop').hidden=true; $('#brand-home').href='#'; }
      $('#export-js').hidden=true;
      $('#data-tools-help').textContent='Xuất bản sao JSON; nhập dữ liệu chỉ được dùng khi sheet sản phẩm đang trống.';
    } else {
      $('#mode-notice').innerHTML = '<span aria-hidden="true">ⓘ</span><p><strong>Chế độ local:</strong> thay đổi chỉ lưu trong trình duyệt này. Tải lại trang cửa hàng để xem. Muốn xuất bản thay đổi, xuất <strong>data.js</strong> rồi thay file trong dự án; hoặc dùng Admin Google Sheets.' + (config.adminUrl && /^https:\/\//.test(config.adminUrl) ? ' <a href="'+esc(config.adminUrl)+'" target="_blank" rel="noopener">Mở Admin Google Sheets ↗</a>' : '') + (config.apiUrl ? ' <strong>Cửa hàng đang cấu hình API; thay đổi local không ghi vào API.</strong>' : '') + '</p>';
    }
  }
  function renderProducts() {
    if (!state.loaded) return;
    const active = state.catalog.products.filter(p=>!p.archived);
    const publicCount = active.filter(p=>p.visible !== false && p.status !== 'draft').length;
    $('#stat-total').textContent=active.length;
    $('#stat-visible').textContent=publicCount;
    $('#stat-hidden').textContent=active.length-publicCount;
    const query=normalizeText(state.query);
    const filtered=state.catalog.products.filter(p=>Boolean(p.archived)===state.archived && (!query || normalizeText([p.code,p.name,p.category].join(' ')).includes(query)));
    const pages=Math.max(1,Math.ceil(filtered.length/state.pageSize));
    state.page=Math.max(1,Math.min(state.page,pages));
    const from=(state.page-1)*state.pageSize;
    $('#product-rows').innerHTML=filtered.slice(from,from+state.pageSize).map(p=>{
      const out=p.status==='out_of_stock' || p.stock===0;
      const badge=p.archived ? ['hidden','Đã lưu trữ'] : p.status==='draft' ? ['draft','Bản nháp'] : p.visible===false ? ['hidden','Tạm ẩn'] : out ? ['out','Hết hàng'] : ['','Đang bán'];
      return '<tr><td><div class="product-cell"><img class="product-thumb" src="'+esc(previewUrl(p.images && p.images[0]))+'" alt="" loading="lazy"><div><strong>'+esc(p.name)+'</strong><small>'+esc(p.code)+(p.featured?' · ★ Nổi bật':'')+'</small></div></div></td><td>'+esc(p.category || '—')+'</td><td class="product-price">'+esc(currency(p.price))+(p.originalPrice>p.price?'<span class="product-old-price">'+esc(currency(p.originalPrice))+'</span>':'')+'</td><td><span class="status-badge '+badge[0]+'">'+badge[1]+'</span></td><td class="date-cell">'+esc(dateLabel(p.updatedAt))+'</td><td><div class="row-actions">'+(p.archived?'<button class="icon-button" data-action="restore" data-id="'+esc(p.id)+'" title="Khôi phục (giữ tạm ẩn)" aria-label="Khôi phục '+esc(p.name)+'">↶</button>':'<button class="icon-button" data-action="edit" data-id="'+esc(p.id)+'" title="Chỉnh sửa" aria-label="Sửa '+esc(p.name)+'">✎</button><button class="icon-button" data-action="clone" data-id="'+esc(p.id)+'" title="Nhân bản" aria-label="Nhân bản '+esc(p.name)+'">⧉</button><button class="icon-button danger" data-action="archive" data-id="'+esc(p.id)+'" title="Lưu trữ" aria-label="Lưu trữ '+esc(p.name)+'">⌫</button>')+'</div></td></tr>';
    }).join('');
    $$('.product-thumb').forEach(img=>{img.addEventListener('error',()=>{img.src=emptyImage;},{once:true});});
    $('#product-empty').hidden=filtered.length>0;
    $('#product-result-count').textContent=filtered.length ? 'Hiển thị '+(from+1)+'–'+Math.min(from+state.pageSize,filtered.length)+' / '+filtered.length+' sản phẩm' : '0 sản phẩm';
    const numbered=Array.from({length:pages},(_,i)=>i+1).filter(n=>n===1 || n===pages || Math.abs(n-state.page)<=1);
    $('#admin-pagination').innerHTML='<button class="page-btn" data-page="'+(state.page-1)+'" '+(state.page===1?'disabled':'')+' aria-label="Trang trước">‹</button>'+numbered.map((n,i)=> (i>0&&n-numbered[i-1]>1?'<span aria-hidden="true">…</span>':'')+'<button class="page-btn '+(n===state.page?'current':'')+'" data-page="'+n+'" '+(n===state.page?'aria-current="page"':'')+'>'+n+'</button>').join('')+'<button class="page-btn" data-page="'+(state.page+1)+'" '+(state.page===pages?'disabled':'')+' aria-label="Trang sau">›</button>';
    $('#category-options').innerHTML=[...new Set(active.map(p=>p.category).filter(Boolean))].sort().map(category=>'<option value="'+esc(category)+'"></option>').join('');
  }
  function renderSettings() {
    const form=$('#settings-form'), settings=state.catalog.settings;
    settingFields.forEach(key=>{form.elements.namedItem(key).value=settings[key] == null ? '' : settings[key];});
    channelFields.forEach(key=>{form.elements.namedItem('channel_'+key).value=settings.channels && settings.channels[key] || '';});
  }
  function renderPrices() {
    $('#price-rows').innerHTML=state.priceDraft.map((item,index)=>'<tr data-index="'+index+'"><td><input data-field="label" aria-label="Tên khoảng giá '+(index+1)+'" value="'+esc(item.label)+'" maxlength="100" required></td><td><input data-field="min" type="number" min="0" step="1" aria-label="Giá từ" value="'+esc(item.min)+'"></td><td><input data-field="max" type="number" min="0" step="1" aria-label="Giá đến" placeholder="Không giới hạn" value="'+esc(item.max)+'"></td><td><input data-field="sort" type="number" min="-10000" max="10000" step="1" aria-label="Thứ tự" value="'+esc(item.sort)+'"></td><td><input data-field="enabled" type="checkbox" aria-label="Hiển thị khoảng giá" '+(item.enabled!==false?'checked':'')+'></td><td><button class="icon-button danger" data-remove-price="'+index+'" aria-label="Xóa khoảng giá '+esc(item.label)+'" title="Xóa khoảng giá">×</button></td></tr>').join('');
    $('#prices-empty').hidden=state.priceDraft.length>0;
  }
  function renderAll() { renderMeta();renderProducts();renderSettings();renderPrices(); }
  async function setView(view) {
    if (!['products','settings','prices'].includes(view) || view===state.view) return;
    if ((state.view==='settings' && state.settingsDirty) || (state.view==='prices' && state.pricesDirty)) {
      if (!await confirmAction('Bạn có thay đổi chưa lưu. Rời mục này và bỏ các thay đổi?','Rời mục')) return;
      state.settingsDirty=false;state.pricesDirty=false;state.priceDraft=copy(state.catalog.priceFilters);renderSettings();renderPrices();
    }
    state.view=view;
    $$('.view-panel').forEach(element=>{element.hidden=element.id!==view+'-view';});
    $$('.nav-button').forEach(button=>button.classList.toggle('active',button.dataset.view===view));
    $('#breadcrumb').textContent='/ '+({products:'Sản phẩm',settings:'Nội dung shop',prices:'Bộ lọc giá'}[view]);
  }
  function openProduct(id) {
    state.draft=id ? copy(state.catalog.products.find(p=>p.id===id)) : {id:'',code:'',name:'',category:'',description:'',shortDescription:'',price:'',originalPrice:'',tags:[],featured:false,visible:true,status:'active',stock:null,images:[],updatedAt:'',archived:false};
    if (!state.draft) return;
    const form=$('#product-form');form.reset();
    ['code','name','category','description','shortDescription','price','originalPrice','status','stock'].forEach(key=>{form.elements.namedItem(key).value=state.draft[key] == null ? '' : state.draft[key];});
    form.elements.namedItem('tags').value=(state.draft.tags || []).join(', ');
    form.elements.namedItem('featured').checked=state.draft.featured===true;
    form.elements.namedItem('visible').checked=state.draft.visible!==false;
    $('#product-dialog-title').textContent=id?'Chỉnh sửa sản phẩm':'Thêm sản phẩm';
    $('#product-form-error').hidden=true;state.productDirty=false;renderImageSlots();
    $('#product-dialog').showModal();
    form.elements.namedItem('code').focus();
  }
  function renderImageSlots() {
    $('#product-image-count').textContent=productImages(state.draft.images).length+'/'+maxProductImages+' ảnh · 1 ảnh đại diện + 3 ảnh phụ';
    $('#image-slots').innerHTML=Array.from({length:maxProductImages},(_,i)=>{
      const url=state.draft.images[i];
      return '<div class="image-slot"><button class="image-slot-preview" type="button" data-image-slot="'+i+'" aria-label="Chọn '+(i===0?'ảnh đại diện':'ảnh phụ '+i)+'">'+(url?'<img src="'+esc(previewUrl(url))+'" alt="'+(i===0?'Ảnh đại diện':'Ảnh phụ '+i)+'">':'<span aria-hidden="true">＋</span>Chọn ảnh')+'</button>'+(url?'<button class="remove-image" type="button" data-remove-image="'+i+'" aria-label="Gỡ ảnh '+(i+1)+'">×</button>':'')+'<span class="image-slot-label">'+(i===0?'Ảnh đại diện':'Ảnh phụ '+i)+'</span><button class="image-url-button" type="button" data-image-url="'+i+'">Nhập URL</button></div>';
    }).join('');
  }
  async function closeDialog(id) {
    if (id==='crop-dialog' && $('#save-crop').disabled) { notify('Ảnh đang được xử lý, vui lòng chờ hoàn tất.');return; }
    if (id==='product-dialog' && state.productDirty && !await confirmAction('Sản phẩm có thay đổi chưa lưu. Đóng và bỏ thay đổi?','Bỏ thay đổi')) return;
    $("#"+id).close();
    if (id==='product-dialog') { state.productDirty=false;state.draft=null; }
    if (id==='crop-dialog') { releaseCrop(); }
  }
  async function saveProduct(event) {
    event.preventDefault();
    $('#product-form-error').hidden=true;
    await withBusy($('#save-product'),async()=>{
      try {
        const form=$('#product-form'), values={...state.draft};
        ['code','name','category','description','shortDescription','price','originalPrice','tags','status','stock'].forEach(key=>{values[key]=form.elements.namedItem(key).value;});
        values.featured=form.elements.namedItem('featured').checked;values.visible=form.elements.namedItem('visible').checked;
        const snapshot=await repository.saveProduct(values);
        acceptSnapshot(snapshot);state.productDirty=false;state.draft=null;$('#product-dialog').close();notify('Đã lưu sản phẩm.');
      } catch(error) { showError('#product-form-error',error); }
    });
  }
  async function saveSettings(event) {
    event.preventDefault();
    const button=$('button[form="settings-form"]');
    await withBusy(button,async()=>{
      try {
        const form=$('#settings-form'),settings={channels:{}};
        settingFields.forEach(key=>{settings[key]=form.elements.namedItem(key).value;});
        channelFields.forEach(key=>{settings.channels[key]=form.elements.namedItem('channel_'+key).value;});
        acceptSnapshot(await repository.saveSettings(settings));notify('Đã cập nhật nội dung shop.');
      } catch(error) { notify(error.message,true); }
    });
  }
  async function rowAction(button) {
    const {action,id}=button.dataset;
    if (action==='edit') { openProduct(id);return; }
    if (action==='archive' && !await confirmAction('Lưu trữ sản phẩm này? Sản phẩm sẽ được ẩn khỏi cửa hàng. Bạn có thể khôi phục trong mục “Đã lưu trữ”.','Lưu trữ')) return;
    await withBusy(button,async()=>{
      try { const snapshot=action==='clone'?await repository.cloneProduct(id):await repository.archiveProduct(id,action==='archive');acceptSnapshot(snapshot);notify(action==='clone'?'Đã nhân bản. Bản sao đang tạm ẩn và ở trạng thái nháp.':action==='archive'?'Đã lưu trữ sản phẩm.':'Đã khôi phục. Sản phẩm vẫn tạm ẩn để bạn kiểm tra.'); }
      catch(error) { notify(error.message,true); }
    },'…');
  }
  function startImage(target) {
    pendingImageTarget=target;$('#image-file').value='';$('#image-file').click();
  }
  function imageFromBlob(blob) {
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(blob),img=new Image();
      img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Trình duyệt không giải mã được ảnh.'));};
      img.src=url;
    });
  }
  function loadHeicDecoder() {
    if (window.heic2any) return Promise.resolve(window.heic2any);
    if (decoderPromise) return decoderPromise;
    decoderPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      // Local package is pinned + vendored. Apps Script cannot serve local files, so uses the same pinned CDN version.
      script.src=remote?'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js':'assets/vendor/heic2any-0.0.4.min.js';
      script.onload=()=>window.heic2any?resolve(window.heic2any):reject(new Error('Không khởi tạo được bộ giải mã HEIC.'));
      script.onerror=()=>{decoderPromise=null;reject(new Error('Không tải được bộ giải mã HEIC. Kiểm tra Internet hoặc xuất ảnh sang JPEG trong Preview trên Mac.'));};
      document.head.appendChild(script);
    });
    return decoderPromise;
  }
  async function receiveImage(file) {
    if (!file || !pendingImageTarget) return;
    if (file.size>25*1024*1024) { notify('Ảnh gốc vượt quá 25 MB. Vui lòng chọn ảnh nhỏ hơn.',true);return; }
    const target={...pendingImageTarget};pendingImageTarget=null;
    const heic=/\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type);
    try {
      notify(heic?'Đang đọc ảnh HEIC/HEIF…':'Đang đọc ảnh…');
      let img;
      try { img=await imageFromBlob(file); }
      catch(error) {
        if (!heic) throw new Error('Không đọc được ảnh. Hãy chọn JPG, PNG, WebP, AVIF hoặc xuất ảnh thành JPEG bằng Preview trên Mac.');
        const decoder=await loadHeicDecoder();
        const result=await decoder({blob:file,toType:'image/jpeg',quality:0.95});
        img=await imageFromBlob(Array.isArray(result)?result[0]:result);
      }
      if (!img.naturalWidth || !img.naturalHeight) throw new Error('Ảnh không có kích thước hợp lệ.');
      crop={img,target,rotation:0,zoom:1,dx:0,dy:0,width:target.key==='heroImage'?1920:1200,height:target.key==='heroImage'?1080:1200,pointer:null};
      const canvas=$('#crop-canvas');canvas.width=crop.width;canvas.height=crop.height;
      $('#crop-zoom').value='1';$('#crop-error').hidden=true;
      $('#crop-info').textContent='Ảnh xuất: '+crop.width+' × '+crop.height+' px, JPEG. '+(!remote?'Ảnh được lưu tại trình duyệt.':'Ảnh được tải lên Cloudinary sau khi bạn xác nhận.');
      renderCrop();$('#crop-dialog').showModal();
    } catch(error) { notify(heic?'Không chuyển được ảnh HEIC/HEIF này. Hãy mở ảnh bằng Preview → File → Export → JPEG rồi chọn lại. '+error.message:error.message,true); }
  }
  function cropGeometry() {
    const rotated=Math.abs(crop.rotation%180)===90;
    const w=rotated?crop.img.naturalHeight:crop.img.naturalWidth;
    const h=rotated?crop.img.naturalWidth:crop.img.naturalHeight;
    const scale=Math.max(crop.width/w,crop.height/h)*crop.zoom;
    const limitX=Math.max(0,(w*scale-crop.width)/2),limitY=Math.max(0,(h*scale-crop.height)/2);
    crop.dx=Math.min(limitX,Math.max(-limitX,crop.dx));crop.dy=Math.min(limitY,Math.max(-limitY,crop.dy));
    return {scale};
  }
  function renderCrop() {
    if (!crop) return;
    const canvas=$('#crop-canvas'),ctx=canvas.getContext('2d');
    const geometry=cropGeometry();
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.translate(canvas.width/2+crop.dx,canvas.height/2+crop.dy);ctx.rotate(crop.rotation*Math.PI/180);ctx.scale(geometry.scale,geometry.scale);ctx.drawImage(crop.img,-crop.img.naturalWidth/2,-crop.img.naturalHeight/2);ctx.restore();
  }
  function releaseCrop() { crop=null;$('#crop-canvas').getContext('2d').clearRect(0,0,$('#crop-canvas').width,$('#crop-canvas').height); }
  function blobDataUrl(blob) { return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Không đọc được ảnh đã cắt.'));reader.readAsDataURL(blob);}); }
  async function uploadImage(blob,target) {
    if (!remote) return blobDataUrl(blob);
    const signed=await gsCall('adminUploadSignature',target.type==='product'?'product':target.key==='logo'?'logo':'hero');
    const body=new FormData();
    Object.keys(signed.params).forEach(key=>body.append(key,String(signed.params[key])));
    body.append('file',blob,'webshop-image.jpg');body.append('api_key',signed.apiKey);body.append('signature',signed.signature);
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),90000);
    try {
      const response=await fetch('https://api.cloudinary.com/v1_1/'+encodeURIComponent(signed.cloudName)+'/image/upload',{method:'POST',body,signal:controller.signal});
      const result=await response.json();
      if (!response.ok || !result.secure_url) throw new Error(result.error && result.error.message || 'Cloudinary không nhận ảnh.');
      return safeImageUrl(result.secure_url);
    } catch(error) { if(error.name==='AbortError')throw new Error('Tải ảnh quá 90 giây. Kiểm tra kết nối và thử lại.');throw error; }
    finally { clearTimeout(timeout); }
  }
  async function saveCrop() {
    if (!crop) return;
    await withBusy($('#save-crop'),async()=>{
      try {
        $('#crop-error').hidden=true;
        const target={...crop.target};
        const blob=await new Promise(resolve=>$('#crop-canvas').toBlob(resolve,'image/jpeg',remote?0.9:0.8));
        if (!blob) throw new Error('Không xuất được ảnh.');
        const url=await uploadImage(blob,target);
        if (target.type==='product') { if(!state.draft)throw new Error('Hộp sản phẩm đã đóng.');state.draft.images[target.index]=url;state.productDirty=true;renderImageSlots(); }
        else { $('#settings-form').elements.namedItem(target.key).value=url;state.settingsDirty=true; }
        $('#crop-dialog').close();releaseCrop();notify(remote?'Đã tải ảnh. Hãy lưu sản phẩm/nội dung để áp dụng.':'Đã chọn ảnh. Hãy lưu sản phẩm/nội dung để áp dụng.');
      } catch(error) { showError('#crop-error',error); }
    },remote?'Đang tải ảnh…':'Đang xử lý…');
  }
  function download(name,content,type) {
    const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  function publicCatalog() {
    const exported=copy(state.catalog);
    exported.products=exported.products.filter(p=>!p.archived && p.visible!==false && p.status!=='draft');
    exported.priceFilters=exported.priceFilters.filter(p=>p.enabled!==false);
    return exported;
  }
  async function importFile(file) {
    if (!file)return;
    try {
      if(file.size>15*1024*1024)throw new Error('File JSON vượt quá 15 MB.');
      const parsed=JSON.parse(await file.text());
      const valid=normalizeCatalog(parsed);
      if(remote && state.catalog.products.length)throw new Error('Nhập dữ liệu trên Admin Google Sheets chỉ dành cho khởi tạo khi sheet Products đang trống. Dữ liệu hiện có được giữ nguyên.');
      if(!await confirmAction(remote?'Nhập '+valid.products.length+' sản phẩm cùng nội dung shop và bộ lọc vào Google Sheets?':'Thay toàn bộ dữ liệu local bằng '+valid.products.length+' sản phẩm trong file? Hãy xuất bản sao JSON trước nếu cần.','Nhập dữ liệu'))return;
      acceptSnapshot(await repository.importCatalog(valid));state.page=1;renderProducts();notify('Đã nhập dữ liệu.');
    }catch(error){notify(error.message,true);}
  }
  function bindEvents() {
    $$('.nav-button').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    $('#add-product').addEventListener('click',()=>{if(state.loaded)openProduct();});
    $('#product-search').addEventListener('input',event=>{state.query=event.target.value;state.page=1;renderProducts();});
    $('#show-archived').addEventListener('change',event=>{state.archived=event.target.checked;state.page=1;renderProducts();});
    $('#admin-pagination').addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(button){state.page=Number(button.dataset.page);renderProducts();}});
    $('#product-rows').addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(button)rowAction(button);});
    $('#reload-data').addEventListener('click',()=>withBusy($('#reload-data'),async()=>{try{acceptSnapshot(await repository.load());notify('Đã tải lại dữ liệu.');}catch(error){notify(error.message,true);}},'Đang tải…'));
    $('#product-form').addEventListener('submit',saveProduct);
    $('#product-form').addEventListener('input',()=>{state.productDirty=true;});
    $('#settings-form').addEventListener('submit',saveSettings);
    $('#settings-form').addEventListener('input',()=>{state.settingsDirty=true;});
    $$('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.dataset.closeDialog)));
    $('#product-dialog').addEventListener('cancel',event=>{event.preventDefault();closeDialog('product-dialog');});
    $('#crop-dialog').addEventListener('cancel',event=>{event.preventDefault();closeDialog('crop-dialog');});
    $('#confirm-dialog').addEventListener('cancel',event=>{event.preventDefault();finishConfirm(false);});
    $('#confirm-cancel').addEventListener('click',()=>finishConfirm(false));$('#confirm-ok').addEventListener('click',()=>finishConfirm(true));
    $('#image-slots').addEventListener('click',event=>{
      const choose=event.target.closest('[data-image-slot]'),remove=event.target.closest('[data-remove-image]'),urlButton=event.target.closest('[data-image-url]');
      if(choose)startImage({type:'product',index:Number(choose.dataset.imageSlot)});
      if(remove){state.draft.images[Number(remove.dataset.removeImage)]='';state.productDirty=true;renderImageSlots();}
      if(urlButton){const index=Number(urlButton.dataset.imageUrl),url=window.prompt('Nhập URL ảnh HTTPS hoặc đường dẫn assets/ trong dự án:',state.draft.images[index] || '');if(url!==null){try{state.draft.images[index]=safeImageUrl(url);state.productDirty=true;renderImageSlots();}catch(error){notify(error.message,true);}}}
    });
    $$('[data-settings-image]').forEach(button=>button.addEventListener('click',()=>startImage({type:'settings',key:button.dataset.settingsImage})));
    $('#image-file').addEventListener('change',event=>receiveImage(event.target.files[0]));
    $('#crop-zoom').addEventListener('input',event=>{if(crop){crop.zoom=Number(event.target.value);renderCrop();}});
    $('#rotate-left').addEventListener('click',()=>{if(crop){crop.rotation=(crop.rotation-90)%360;crop.dx=0;crop.dy=0;renderCrop();}});
    $('#rotate-right').addEventListener('click',()=>{if(crop){crop.rotation=(crop.rotation+90)%360;crop.dx=0;crop.dy=0;renderCrop();}});
    $('#reset-crop').addEventListener('click',()=>{if(crop){Object.assign(crop,{rotation:0,zoom:1,dx:0,dy:0});$('#crop-zoom').value='1';renderCrop();}});
    const canvas=$('#crop-canvas');
    canvas.addEventListener('pointerdown',event=>{if(!crop)return;crop.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,dx:crop.dx,dy:crop.dy};canvas.setPointerCapture(event.pointerId);});
    canvas.addEventListener('pointermove',event=>{if(!crop || !crop.pointer || crop.pointer.id!==event.pointerId)return;const rect=canvas.getBoundingClientRect();crop.dx=crop.pointer.dx+(event.clientX-crop.pointer.x)*canvas.width/rect.width;crop.dy=crop.pointer.dy+(event.clientY-crop.pointer.y)*canvas.height/rect.height;renderCrop();});
    function stopDrag(){if(crop)crop.pointer=null;}
    canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);canvas.addEventListener('lostpointercapture',stopDrag);
    $('#save-crop').addEventListener('click',saveCrop);
    $('#add-price').addEventListener('click',()=>{if(!state.loaded)return;state.priceDraft.push({id:uid('gia'),label:'',min:0,max:null,sort:state.priceDraft.length+1,enabled:true});state.pricesDirty=true;renderPrices();$('#price-rows tr:last-child input').focus();});
    $('#price-rows').addEventListener('input',event=>{const input=event.target.closest('[data-field]');if(!input)return;const row=input.closest('[data-index]');state.priceDraft[Number(row.dataset.index)][input.dataset.field]=input.type==='checkbox'?input.checked:input.value;state.pricesDirty=true;});
    $('#price-rows').addEventListener('click',async event=>{const button=event.target.closest('[data-remove-price]');if(!button)return;const index=Number(button.dataset.removePrice);if(await confirmAction('Xóa khoảng giá “'+(state.priceDraft[index].label || 'chưa đặt tên')+'”? Thay đổi có hiệu lực sau khi bấm Lưu bộ lọc giá.','Xóa khoảng giá')){state.priceDraft.splice(index,1);state.pricesDirty=true;renderPrices();}});
    $('#save-prices').addEventListener('click',()=>withBusy($('#save-prices'),async()=>{try{acceptSnapshot(await repository.savePrices(state.priceDraft));notify('Đã lưu bộ lọc giá.');}catch(error){notify(error.message,true);}}));
    $('#export-json').addEventListener('click',()=>{if(state.loaded)download('webshop100-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(state.catalog,null,2),'application/json');});
    $('#export-js').addEventListener('click',()=>{if(state.loaded){download('data.js','/* Public storefront catalog. Exported '+new Date().toISOString()+'. */\nwindow.SHOP_DATA = '+JSON.stringify(publicCatalog(),null,2)+';\n','text/javascript');notify('Đã xuất data.js. Thay assets/js/data.js trong dự án rồi đưa lên GitHub.');}});
    $('#import-json').addEventListener('click',()=>{if(state.loaded){$('#import-file').value='';$('#import-file').click();}});
    $('#import-file').addEventListener('change',event=>importFile(event.target.files[0]));
    window.addEventListener('beforeunload',event=>{if(state.productDirty || state.settingsDirty || state.pricesDirty){event.preventDefault();event.returnValue='';}});
    window.addEventListener('storage',event=>{if(!remote && event.key===dataKey)notify('Dữ liệu đã thay đổi ở tab khác. Bấm Tải lại để lấy bản mới nhất.');});
  }
  async function init() {
    bindEvents();
    try { acceptSnapshot(await repository.load()); }
    catch(error) { showError('#fatal-error',error);$('#mode-notice').hidden=true;$('#product-result-count').textContent='Không tải được dữ liệu'; }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}());
