(function () {
  'use strict';
  const C = window.ShopCore;
  const config = Object.assign({apiUrl:'',apiTimeout:10000,cartKey:'webshop100.cart.v1',localDataKey:'webshop100.catalog.v1',useLocalAdminData:true,maxOrderQuantity:99,demoMode:true},window.SHOP_CONFIG || {});
  const seed = window.SHOP_DATA;
  const $ = id => document.getElementById(id);
  const icons = name => '<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"/></svg>';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const channelNames = {messenger:'Messenger',instagram:'Instagram',zalo:'Zalo cá nhân',zaloOA:'Zalo OA',tiktok:'TikTok'};
  const state = {catalog:null,query:'',categories:[],price:'',sort:'featured',page:1,cart:[],cartKey:config.apiUrl?config.cartKey+'.fallback':config.cartKey,usingFallback:!!config.apiUrl,loadingApi:!!config.apiUrl,detail:null,slide:0,orderCode:C.orderCode(),storageWarning:false,focusBeforeDialog:null};
  let localSnapshot = '';
  let searchTimer;
  let routeReady = false;
  let detailRouteBound = false;
  let detailReturnHash = '#san-pham';
  let routeWarning = '';
  let detailImageIndex = 0;
  let galleryTouch = null;

  function readStorage(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  function writeStorage(key, value, notify) {
    try { window.localStorage.setItem(key,value); return true; }
    catch (_) {
      if(notify && !state.storageWarning) { state.storageWarning=true; toast('Trình duyệt không cho lưu giỏ. Bạn vẫn dùng được trong lần mở này; hãy chạy bằng file CHAY_TREN_MAC.command để lưu ổn định.'); }
      return false;
    }
  }
  function parseJSON(text,fallback) { try {return text ? JSON.parse(text) : fallback;} catch (_) {return fallback;} }
  function toast(message,error) {
    const el=document.createElement('div');el.className='toast'+(error?' error':'');el.textContent=message;
    $('toast-stack').appendChild(el);window.setTimeout(()=>el.remove(),4500);
  }
  function bindImages(container) {
    container.querySelectorAll('img').forEach(img=>{
      if(img.id==='detail-image') return; // Ảnh lớn có xử lý lỗi riêng sau mỗi lần chuyển ảnh.
      img.addEventListener('error',function fail(){
        img.removeEventListener('error',fail);
        img.src='assets/images/earbuds.jpg';
        img.classList.add('image-fallback');
      },{once:true});
    });
  }
  function currentData() {
    if(config.useLocalAdminData && !config.apiUrl) {
      localSnapshot=readStorage(config.localDataKey) || '';
      const local=parseJSON(localSnapshot,null);
      if(local && Array.isArray(local.products)) return local;
    }
    return seed;
  }
  function text(id,value) {$(id).textContent=String(value == null ? '' : value);}

  function loadCatalog(raw) {
    state.catalog=C.normalizeCatalog(raw,seed);
    const categories=Array.from(new Set(state.catalog.products.filter(C.isVisible).map(p=>p.category)));
    state.categories=state.categories.filter(category=>categories.indexOf(category)>-1);
    if(!state.catalog.priceFilters.some(f=>f.id===state.price)) state.price='';
    const oldCart=JSON.stringify(state.cart);
    state.cart=C.reconcileCart(state.cart,state.catalog.products,config.maxOrderQuantity);
    if(oldCart!==JSON.stringify(state.cart)) {
      writeStorage(state.cartKey,JSON.stringify(state.cart),false);
      if(oldCart!=='[]') toast('Giỏ hàng đã cập nhật theo sản phẩm và số lượng hiện có.');
    }
    renderBrand();renderFilterOptions();renderProducts();renderCart();
    if(state.detail) {
      const p=findProduct(state.detail);
      if(!p || !C.isVisible(p)) closeDialog($('product-dialog'));
      else renderDetail(p,false);
    }
    if(routeReady) syncProductRoute();
  }
  function renderBrand() {
    const s=state.catalog.settings;
    text('brand-name',s.name);text('brand-slogan',s.slogan);
    $('brand-logo').src=C.safeImage(s.logo,'assets/images/logo.svg');
    text('hero-eyebrow',s.heroEyebrow);text('hero-title',s.heroTitle);text('hero-description',s.heroDescription);
    text('hero-badge',s.heroBadge);text('hero-highlight',s.heroHighlight);
    document.title=s.seoTitle || (s.name+' — Phụ kiện công nghệ');
    document.querySelector('meta[name="description"]').setAttribute('content',s.seoDescription || s.heroDescription || '');
    $('hero-photo').src=C.safeImage(s.heroImage,'assets/images/hero-tech.jpg');
    setSlide(state.slide);
    text('footer-name',s.name);text('footer-about',s.about);
    const lines=[];
    if(s.address) lines.push('<div class="contact-line">'+icons('pin')+'<span>'+esc(s.address)+'</span></div>');
    const phone=String(s.phone || '').replace(/[^\d+]/g,'');
    if(phone) lines.push('<a href="tel:'+esc(phone)+'">'+icons('phone')+'<span>'+esc(s.phone)+'</span></a>');
    if(s.email && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(s.email)) lines.push('<a href="mailto:'+esc(encodeURIComponent(s.email))+'">'+icons('mail')+'<span>'+esc(s.email)+'</span></a>');
    $('contact-details').innerHTML=lines.join('');$('contact-unconfigured').hidden=!!lines.length;
    const channels=s.channels || {};
    $('social-links').innerHTML=Object.keys(channelNames).filter(key=>C.safeLink(channels[key])).map(key=>'<a class="social-link" href="'+esc(C.safeLink(channels[key]))+'" target="_blank" rel="noopener noreferrer">'+esc(key==='messenger' && s.fanpageName ? s.fanpageName+' · Messenger' : channelNames[key])+'</a>').join('');
    text('copyright','© '+new Date().getFullYear()+' '+s.name+'.');
    $('demo-label').hidden=!config.demoMode;
    const adminUrl=C.safeLink(config.adminUrl);
    $('admin-link').href=adminUrl || 'admin.html';
    $('admin-link').hidden=!adminUrl && location.protocol!=='file:' && ['localhost','127.0.0.1','[::1]'].indexOf(location.hostname)===-1;
    if(adminUrl) {$('admin-link').target='_blank';$('admin-link').rel='noopener noreferrer';}
    const orderChannel=channelNames[s.contactChannel] ? s.contactChannel : 'messenger';
    const contactUrl=C.safeLink(channels[orderChannel]);
    $('contact-order').href=!config.demoMode && !state.usingFallback && contactUrl ? contactUrl : '#';
    $('contact-order').querySelector('span').textContent='2. Mở '+channelNames[orderChannel];
    text('contact-hint',state.usingFallback ? 'Đang dùng dữ liệu mẫu dự phòng. Giỏ hàng thật được giữ nguyên; chưa mở kênh nhận đơn.' : config.demoMode ? 'Bản xem thử: bạn có thể sao chép nội dung, chưa gửi đơn cho cửa hàng.' : contactUrl ? 'Dán nội dung và tự gửi tin nhắn cho cửa hàng.' : 'Cửa hàng chưa cấu hình kênh nhận đơn. Bạn vẫn có thể sao chép nội dung.');
    if(window.ShopContactBar) window.ShopContactBar.render(s,{demoMode:config.demoMode,usingFallback:state.usingFallback,loadingApi:state.loadingApi});
  }
  function setSlide(index) {
    state.slide=index;
    const s=state.catalog.settings;
    const slides=[
      {image:s.heroImage || 'assets/images/hero-tech.jpg',name:s.heroProductName || 'MacBook',description:s.heroProductDescription || '',category:'Macbook',alt:'MacBook và tai nghe trên mặt bàn đá, không gian công nghệ tối giản'},
      {image:'assets/images/earbuds.jpg',name:'Tai nghe',description:'Chạm vào thế giới\nâm thanh của bạn.',category:'Tai nghe thể thao',alt:'Tai nghe không dây màu trắng trên mặt đá'},
      {image:'assets/images/keyboard.jpg',name:'Góc làm việc',description:'Cảm hứng từ\nnhững điều nhỏ nhất.',category:'Phụ kiện khác',alt:'Bàn phím cơ và chuột trên bàn làm việc'}
    ];
    const slide=slides[index] || slides[0];
    $('hero-photo').src=C.safeImage(slide.image,'assets/images/hero-tech.jpg');
    $('hero-photo').alt=slide.alt;
    $('hero-photo').style.objectPosition=index===0?'center 51%':'center 55%';
    text('hero-product-name',slide.name);text('hero-product-description',slide.description);
    document.querySelectorAll('.hero-dot').forEach(dot=>{const selected=Number(dot.dataset.slide)===index;dot.classList.toggle('active',selected);dot.setAttribute('aria-pressed',String(selected));});
  }

  function renderFilterOptions() {
    const products=state.catalog.products.filter(C.isVisible);
    const categories=Array.from(new Set(products.map(p=>p.category)));
    const option=(name,value,label,type,checked)=>'<label class="filter-option"><input type="'+type+'" name="'+name+'" value="'+esc(value)+'"'+(checked?' checked':'')+'><span>'+esc(label)+'</span></label>';
    $('category-options').innerHTML=option('category','','Tất cả','checkbox',state.categories.length===0)+categories.map(category=>option('category',category,category,'checkbox',state.categories.indexOf(category)>-1)).join('');
    $('price-options').innerHTML=option('price','','Tất cả mức giá','radio',!state.price)+state.catalog.priceFilters.map(range=>option('price',range.id,range.label,'radio',state.price===range.id)).join('');
    document.querySelectorAll('input[name=sort]').forEach(input=>{input.checked=input.value===state.sort;});
    filterCounter();
  }
  function filterCounter() {
    const count=state.categories.length+Number(!!state.price)+Number(!!state.query);
    text('active-filter-count',count?'('+count+')':'');
    $('reset-filters').hidden=!count && state.sort==='featured';
  }
  function getResults() {
    return C.filterProducts(state.catalog.products,{query:state.query,categories:state.categories,priceRange:state.catalog.priceFilters.find(f=>f.id===state.price),sort:state.sort});
  }
  function productCard(p,index,featured) {
    const available=C.isAvailable(p);
    const sale=p.originalPrice>p.price;
    let badge='';
    if(!available) badge='<span class="product-badge sold-out">Hết hàng</span>';
    else if(featured && p.featured) badge='<span class="product-badge">'+icons('flame')+'Bán chạy</span>';
    else if(sale) badge='<span class="product-badge sale">−'+Math.round((1-p.price/p.originalPrice)*100)+'%</span>';
    const price='<span class="product-price">'+C.formatMoney(p.price)+'</span>'+(sale?'<span class="product-old-price">'+C.formatMoney(p.originalPrice)+'</span>':'');
    return '<article class="product-card'+(featured?' featured':'')+'" data-product-id="'+esc(p.id)+'">'+
      '<button class="product-visual" type="button" data-detail="'+esc(p.id)+'" aria-label="Xem '+esc(p.name)+'">'+badge+'<img src="'+esc(C.safeImage(p.images[0]))+'" alt="'+esc(p.name)+'"'+(index===0?' fetchpriority="high"':' loading="lazy"')+' decoding="async"></button>'+
      '<div class="product-body"><p class="product-category">'+esc(p.category)+'</p><h3 class="product-name"><button type="button" data-detail="'+esc(p.id)+'">'+esc(p.name)+'</button></h3><p class="product-description">'+esc(p.shortDescription || p.description.split('\n')[0])+'</p><div class="product-bottom"><div>'+price+'</div></div><button class="product-add" data-add="'+esc(p.id)+'" type="button" aria-label="'+(state.loadingApi?'Đang tải dữ liệu':available?'Thêm '+esc(p.name)+' vào giỏ':'Hết hàng: '+esc(p.name))+'"'+(!available || state.loadingApi?' disabled':'')+'>'+icons('cart')+'<span>'+(state.loadingApi?'Đang tải…':available?'Thêm vào giỏ':'Hết hàng')+'</span></button></div></article>';
  }
  function renderProducts() {
    const result=C.paginate(getResults(),state.page,state.catalog.settings.pageSize);
    state.page=result.page;
    $('product-grid').classList.toggle('is-compact',result.items.length<5);
    $('product-grid').classList.toggle('extended',result.items.length>5);
    $('product-grid').innerHTML=result.items.map((p,index)=>productCard(p,index,index===0 && result.items.length>=5)).join('');
    $('product-grid').hidden=!result.total;
    $('product-grid').setAttribute('aria-busy','false');
    $('empty-state').hidden=!!result.total;
    bindImages($('product-grid'));
    text('result-count',result.total?'Hiển thị '+result.from+'–'+result.to+' / '+result.total+' sản phẩm':'0 sản phẩm');
    const buttons=[];
    if(result.totalPages>1) {
      buttons.push('<button type="button" data-page="'+(result.page-1)+'" aria-label="Trang trước"'+(result.page===1?' disabled':'')+'>'+icons('arrow')+'</button>');
      let start=Math.max(1,result.page-2),end=Math.min(result.totalPages,start+4);start=Math.max(1,end-4);
      for(let page=start;page<=end;page++) buttons.push('<button type="button" data-page="'+page+'" aria-label="Trang '+page+'"'+(page===result.page?' aria-current="page" class="current"':'')+'>'+page+'</button>');
      buttons.push('<button type="button" data-page="'+(result.page+1)+'" aria-label="Trang sau"'+(result.page===result.totalPages?' disabled':'')+'>'+icons('arrow')+'</button>');
    }
    $('pagination').innerHTML=buttons.join('');
    $('search-summary').hidden=!state.query;
    $('search-summary').innerHTML=state.query?'Kết quả cho <strong>“'+esc(state.query)+'”</strong>':'';
    filterCounter();
  }
  function resetFilters() {
    state.query='';state.categories=[];state.price='';state.sort='featured';state.page=1;
    $('search-input').value='';renderFilterOptions();renderProducts();
  }
  function scrollCatalog() { $('san-pham').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); }
  function findProduct(id) {return state.catalog.products.find(p=>p.id===id);}
  function saveCart() {
    state.cart=C.reconcileCart(state.cart,state.catalog.products,config.maxOrderQuantity);
    writeStorage(state.cartKey,JSON.stringify(state.cart),true);
    state.orderCode=C.orderCode();renderCart();
  }
  function addCart(id,quantity) {
    if(state.loadingApi){toast('Đang tải dữ liệu cửa hàng, vui lòng chờ một chút.');return;}
    const product=findProduct(id);
    if(!product || !C.isAvailable(product)) {toast('Sản phẩm hiện không còn hàng.',true);return;}
    const line=state.cart.find(i=>i.id===id);
    const oldQty=line?line.quantity:0;
    const wanted=oldQty+Math.max(1,Math.floor(Number(quantity)||1));
    const limit=C.quantityLimit(product,config.maxOrderQuantity);
    const next=Math.min(wanted,limit);
    if(next===oldQty) {toast('Bạn đã chọn số lượng tối đa cho sản phẩm này.');return;}
    if(line) line.quantity=next;else state.cart.push({id:id,quantity:next});
    saveCart();
    toast(wanted>limit?'Đã thêm đến số lượng tối đa hiện có ('+limit+').':'Đã thêm '+product.name+' vào giỏ.');
  }
  function changeCart(id,quantity) {
    const product=findProduct(id),line=state.cart.find(i=>i.id===id);
    if(!line || !product) return;
    if(!Number.isFinite(quantity)) {renderCart();return;}
    quantity=Math.floor(quantity);
    if(quantity<=0) state.cart=state.cart.filter(i=>i.id!==id);
    else {
      const limit=C.quantityLimit(product,config.maxOrderQuantity);
      if(quantity>limit) toast('Số lượng tối đa hiện có là '+limit+'.');
      line.quantity=Math.min(quantity,limit);
    }
    saveCart();
  }
  function renderCart() {
    const summary=C.cartSummary(state.cart,state.catalog.products,config.maxOrderQuantity);
    text('cart-count',summary.count);$('cart-open').setAttribute('aria-label','Mở giỏ hàng, '+summary.count+' sản phẩm');
    text('cart-lines','('+summary.lines+' mặt hàng)');
    $('cart-empty').hidden=!!summary.lines;$('cart-checkout').hidden=!summary.lines;
    $('cart-items').innerHTML=summary.items.map(item=>{
      const p=item.product,id=esc(p.id),limit=C.quantityLimit(p,config.maxOrderQuantity);
      return '<article class="cart-item" data-cart-id="'+id+'"><img class="cart-item-image" src="'+esc(C.safeImage(p.images[0]))+'" alt="'+esc(p.name)+'"><div class="cart-item-info"><h3>'+esc(p.name)+'</h3><p>'+esc(p.code)+'</p><span class="cart-item-price">'+C.formatMoney(p.price)+'</span><div class="quantity-picker"><button type="button" data-cart-minus="'+id+'" aria-label="Giảm số lượng '+esc(p.name)+'">'+icons('minus')+'</button><input type="number" min="1" max="'+limit+'" value="'+item.quantity+'" data-cart-quantity="'+id+'" aria-label="Số lượng '+esc(p.name)+'" inputmode="numeric"><button type="button" data-cart-plus="'+id+'" aria-label="Tăng số lượng '+esc(p.name)+'"'+(item.quantity>=limit?' disabled':'')+'>'+icons('plus')+'</button></div></div><button type="button" class="cart-remove" data-cart-remove="'+id+'" aria-label="Xóa '+esc(p.name)+' khỏi giỏ">'+icons('trash')+'</button><span class="cart-line-total">'+C.formatMoney(item.total)+'</span></article>';
    }).join('');
    text('cart-total',C.formatMoney(summary.total));
    $('order-text').value=C.formatOrder(summary,state.catalog.settings.name,state.orderCode);
    $('copy-order').querySelector('span').textContent='1. Sao chép nội dung đơn';
    bindImages($('cart-items'));
  }

  function openDialog(dialog) {
    if(dialog.open) return;
    state.focusBeforeDialog=document.activeElement;
    if(typeof dialog.showModal==='function') dialog.showModal();
    else {dialog.setAttribute('open','');dialog.setAttribute('aria-modal','true');dialog.setAttribute('role','dialog');}
    document.body.classList.add('modal-open');
    const close=dialog.querySelector('[data-close]');if(close) close.focus();
  }
  function closeDialog(dialog,keepProductRoute) {
    if(typeof dialog.close==='function') dialog.close();else dialog.removeAttribute('open');
    if(dialog.id==='product-dialog') {
      const wasBound=detailRouteBound;
      state.detail=null;detailRouteBound=false;
      if(wasBound && !keepProductRoute) restoreProductAddress();
    }
    if(!document.querySelector('dialog[open]') && !$('filters').classList.contains('open')) document.body.classList.remove('modal-open');
    if(state.focusBeforeDialog && document.contains(state.focusBeforeDialog)) state.focusBeforeDialog.focus();
  }
  function renderDetail(p,resetQuantity) {
    text('detail-category',p.category);text('detail-name',p.name);text('detail-code','Mã sản phẩm: '+p.code);
    text('detail-description',p.description || p.shortDescription);
    $('detail-price').innerHTML=C.formatMoney(p.price)+(p.originalPrice>p.price?'<del>'+C.formatMoney(p.originalPrice)+'</del>':'');
    $('detail-tags').innerHTML=(p.tags || []).map(tag=>'<span>'+esc(tag)+'</span>').join('');
    const available=C.isAvailable(p),stock=C.stockOf(p),limit=C.quantityLimit(p,config.maxOrderQuantity);
    text('detail-stock',!available?'Hết hàng':stock===null?'Còn hàng — liên hệ để xác nhận':'Còn '+stock+' sản phẩm');
    $('detail-stock').classList.toggle('unavailable',!available);
    $('detail-add').disabled=!available || state.loadingApi;$('detail-add').querySelector('span').textContent=state.loadingApi?'Đang tải…':available?'Thêm vào giỏ':'Hết hàng';
    $('detail-quantity').max=Math.max(1,limit);$('detail-quantity').disabled=!available;
    if(resetQuantity) $('detail-quantity').value=1;
    renderDetailGallery(p,resetQuantity);
    updateDetailQuantity();
    renderShareLink(p);
  }
  function detailImages(p) {
    const images=C.productImages(p.images);
    return images.length?images:['assets/images/earbuds.jpg'];
  }
  function renderDetailGallery(p,reset) {
    const images=detailImages(p),multiple=images.length>1;
    galleryTouch=null;
    detailImageIndex=reset?0:Math.min(detailImageIndex,images.length-1);
    $('detail-thumbs').innerHTML=images.map((src,index)=>'<button type="button" data-image="'+index+'" aria-label="Xem ảnh '+(index+1)+' của '+esc(p.name)+'" aria-controls="detail-image" aria-pressed="false"><img src="'+esc(src)+'" alt="" draggable="false"></button>').join('');
    $('detail-thumbs').hidden=!multiple;
    ['detail-image-prev','detail-image-next'].forEach(id=>{$(id).hidden=!multiple;$(id).disabled=!multiple;});
    $('detail-image-counter').hidden=!multiple;
    showDetailImage(detailImageIndex);
    bindImages($('detail-thumbs'));
  }
  function showDetailImage(index) {
    const p=findProduct(state.detail);
    if(!p || !Number.isInteger(index)) return;
    const images=detailImages(p);
    detailImageIndex=((index%images.length)+images.length)%images.length;
    const img=$('detail-image');
    img.classList.remove('image-fallback');
    img.onerror=()=>{img.onerror=null;img.src='assets/images/earbuds.jpg';img.classList.add('image-fallback');};
    img.src=images[detailImageIndex];
    img.alt=p.name+' — Ảnh '+(detailImageIndex+1)+' / '+images.length;
    text('detail-image-counter','Ảnh '+(detailImageIndex+1)+' / '+images.length);
    $('detail-thumbs').querySelectorAll('[data-image]').forEach(button=>{
      const selected=Number(button.dataset.image)===detailImageIndex;
      button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
    });
  }
  function moveDetailImage(delta) {
    const p=findProduct(state.detail);
    if(p && detailImages(p).length>1) showDetailImage(detailImageIndex+delta);
  }
  function installGalleryEvents() {
    $('detail-thumbs').addEventListener('click',event=>{
      const button=event.target.closest('[data-image]');
      if(button) showDetailImage(Number(button.dataset.image));
    });
    $('detail-image-prev').addEventListener('click',()=>moveDetailImage(-1));
    $('detail-image-next').addEventListener('click',()=>moveDetailImage(1));
    $('detail-gallery').addEventListener('keydown',event=>{
      if(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
      const p=findProduct(state.detail);
      if(!p || detailImages(p).length<2) return;
      event.preventDefault();moveDetailImage(event.key==='ArrowLeft'?-1:1);
      if(event.target.closest('[data-image]')) $('detail-thumbs').querySelector('[data-image="'+detailImageIndex+'"]').focus();
    });
    const stage=$('detail-image-stage');
    stage.addEventListener('touchstart',event=>{
      galleryTouch=null;
      if(event.touches.length!==1 || event.target.closest('button')) return;
      const point=event.touches[0];
      galleryTouch={id:point.identifier,x:point.clientX,y:point.clientY,product:state.detail};
    },{passive:true});
    stage.addEventListener('touchend',event=>{
      const start=galleryTouch;galleryTouch=null;
      if(!start || start.product!==state.detail) return;
      const point=Array.from(event.changedTouches).find(touch=>touch.identifier===start.id);
      if(!point) return;
      const dx=point.clientX-start.x,dy=point.clientY-start.y;
      if(Math.abs(dx)>=40 && Math.abs(dx)>Math.abs(dy)*1.5) moveDetailImage(dx<0?1:-1);
    },{passive:true});
    stage.addEventListener('touchcancel',()=>{galleryTouch=null;},{passive:true});
  }
  function currentHash() {
    try { return new URL(window.location.href).hash; } catch(_) { return ''; }
  }
  function isProductHash(hash) { return /^#product(?:=|$)/.test(hash); }
  function canShareCatalog() { return !state.loadingApi && !(config.apiUrl && state.usingFallback); }
  function writeAddress(url,replace) {
    if(!url || url===window.location.href) return;
    try {
      if(window.history && typeof window.history[replace?'replaceState':'pushState']==='function') {
        window.history[replace?'replaceState':'pushState'](null,'',url);return;
      }
    } catch(_){}
    // Một số trình duyệt giới hạn History API khi mở bằng file://.
    try {
      if(replace && typeof window.location.replace==='function') window.location.replace(url);
      else window.location.hash=new URL(url).hash;
    } catch(_){}
  }
  function restoreProductAddress() {
    if(!isProductHash(currentHash())) return;
    try {const url=new URL(window.location.href);url.hash=detailReturnHash;writeAddress(url.href,true);} catch(_){}
  }
  function showRouteWarning(key,message) {
    if(routeWarning===key) return;
    routeWarning=key;toast(message);
  }
  function syncProductRoute() {
    if(!routeReady || !state.catalog) return;
    const hash=currentHash();
    if(!isProductHash(hash)) {
      routeWarning='';detailReturnHash=hash || '#san-pham';
      if(detailRouteBound && $('product-dialog').open) closeDialog($('product-dialog'),true);
      return;
    }
    if(state.loadingApi) return;
    if(config.apiUrl && state.usingFallback) {
      if($('product-dialog').open) closeDialog($('product-dialog'),true);
      showRouteWarning(hash+':fallback','Chưa tải được sản phẩm trong liên kết. Hãy tải lại trang khi kết nối ổn định.');
      return;
    }
    const id=C.productIdFromHash(hash),p=id && findProduct(id);
    if(!p || !C.isVisible(p)) {
      if($('product-dialog').open) closeDialog($('product-dialog'),true);
      showRouteWarning(hash+':missing','Sản phẩm trong liên kết không còn hiển thị. Bạn có thể xem các sản phẩm khác trong cửa hàng.');
      return;
    }
    routeWarning='';
    if(state.detail===id && $('product-dialog').open) {detailRouteBound=true;return;}
    showDetail(id,true);
  }
  function renderShareLink(p) {
    const enabled=canShareCatalog();
    $('share-product').disabled=!enabled;
    $('share-product').removeAttribute('aria-busy');
    $('share-product').querySelector('span').textContent='Sao chép liên kết';
    $('share-link-fallback').hidden=true;
    $('product-link').value=enabled?C.productLink(window.location.href,p.id):'';
    text('share-status',state.loadingApi?'Đang tải dữ liệu cửa hàng. Liên kết sẽ sẵn sàng sau khi tải xong.':!enabled?'Chưa thể chia sẻ sản phẩm mẫu khi kết nối dữ liệu cửa hàng bị gián đoạn.':'');
  }
  async function copyProductLink() {
    const id=state.detail,p=findProduct(id);
    if(!p || !C.isVisible(p) || !canShareCatalog()) return;
    const url=C.productLink(window.location.href,id);
    if(!url){text('share-status','Chưa tạo được liên kết sản phẩm. Hãy mở lại website và thử lại.');return;}
    const button=$('share-product');button.disabled=true;button.setAttribute('aria-busy','true');
    let copied=false;
    try {if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(url);copied=true;}} catch(_){}
    if(state.detail!==id || !$('product-dialog').open) return;
    if(!copied) {
      const temp=document.createElement('textarea');temp.value=url;temp.setAttribute('readonly','');temp.style.cssText='position:fixed;left:0;top:0;opacity:0;width:1px;height:1px;';
      $('product-dialog').appendChild(temp);temp.focus();temp.select();
      try {copied=document.execCommand('copy');} catch(_){}temp.remove();
    }
    button.removeAttribute('aria-busy');button.disabled=!canShareCatalog();
    if(copied) {
      button.querySelector('span').textContent='Đã sao chép liên kết';
      text('share-status','Bạn có thể dán liên kết để mở đúng sản phẩm này.');button.focus();
      toast('Đã sao chép liên kết sản phẩm.');
    } else {
      $('product-link').value=url;$('share-link-fallback').hidden=false;
      $('product-link').focus();$('product-link').select();
      text('share-status','Liên kết đã được chọn để bạn sao chép thủ công.');
    }
  }
  function showDetail(id,fromRoute) {
    const p=findProduct(id);if(!p || !C.isVisible(p)) return;
    if(!fromRoute && canShareCatalog()) {
      const hash=currentHash();if(!isProductHash(hash)) detailReturnHash=hash || '#san-pham';
      writeAddress(C.productLink(window.location.href,id),false);detailRouteBound=true;
    } else detailRouteBound=!!fromRoute;
    if($('cart-dialog').open) closeDialog($('cart-dialog'));
    if($('filters').classList.contains('open')) toggleFilters(false);
    state.detail=id;renderDetail(p,true);openDialog($('product-dialog'));
  }
  function updateDetailQuantity(delta) {
    const p=findProduct(state.detail);if(!p) return;
    const limit=C.quantityLimit(p,config.maxOrderQuantity);
    const qty=Math.min(Math.max(1,limit),Math.max(1,Math.floor(Number($('detail-quantity').value)||1)+(delta||0)));
    $('detail-quantity').value=qty;$('detail-minus').disabled=qty<=1 || !limit;$('detail-plus').disabled=qty>=limit || !limit;
  }
  function openCart() {
    if($('product-dialog').open) closeDialog($('product-dialog'));
    renderCart();openDialog($('cart-dialog'));
  }
  async function copyOrder() {
    if(!state.cart.length) return;
    const order=$('order-text').value;
    let copied=false;
    try { if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(order);copied=true;} } catch(_){}
    if(!copied) {
      const temp=document.createElement('textarea');temp.value=order;temp.setAttribute('readonly','');temp.style.cssText='position:fixed;left:0;top:0;opacity:0;width:1px;height:1px;';
      $('cart-dialog').appendChild(temp);temp.focus();temp.select();
      try {copied=document.execCommand('copy');} catch(_){}temp.remove();
    }
    if(copied) {
      $('copy-order').querySelector('span').textContent='Đã sao chép nội dung đơn';
      toast('Đã sao chép. Mở kênh liên hệ rồi dán và gửi nội dung cho cửa hàng.');
    } else {
      document.querySelector('.order-preview').open=true;$('order-text').focus();$('order-text').select();
      toast('Nội dung đã được chọn. Nhấn ⌘C trên Mac (Ctrl+C trên Windows) để sao chép.');
    }
  }
  function toggleFilters(open) {
    $('filters').classList.toggle('open',open);$('filter-shade').hidden=!open;
    $('filter-open').setAttribute('aria-expanded',String(open));
    if(open) {document.body.classList.add('modal-open');$('filter-close').focus();}
    else {if(!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');$('filter-open').focus();}
  }
  function installEvents() {
    $('search-form').addEventListener('submit',event=>{event.preventDefault();clearTimeout(searchTimer);state.query=$('search-input').value.trim();state.page=1;renderProducts();scrollCatalog();});
    $('search-input').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=window.setTimeout(()=>{state.query=$('search-input').value.trim();state.page=1;renderProducts();},220);});
    $('filters').addEventListener('change',event=>{
      const input=event.target;
      if(input.name==='category') {
        if(!input.value) state.categories=[];
        else if(input.checked) state.categories.push(input.value);
        else state.categories=state.categories.filter(c=>c!==input.value);
        renderFilterOptions();
      }
      if(input.name==='price') state.price=input.value;
      if(input.name==='sort') state.sort=input.value;
      state.page=1;renderProducts();
    });
    $('reset-filters').addEventListener('click',resetFilters);$('empty-reset').addEventListener('click',resetFilters);
    $('product-grid').addEventListener('click',event=>{
      const detail=event.target.closest('[data-detail]'),add=event.target.closest('[data-add]');
      if(detail) showDetail(detail.dataset.detail);else if(add && !add.disabled) addCart(add.dataset.add,1);
    });
    $('pagination').addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(button&&!button.disabled){state.page=Number(button.dataset.page);renderProducts();scrollCatalog();}});
    $('cart-open').addEventListener('click',openCart);$('footer-cart').addEventListener('click',openCart);
    $('cart-items').addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b || b.disabled) return;
      const id=b.dataset.cartMinus || b.dataset.cartPlus || b.dataset.cartRemove;
      const item=state.cart.find(i=>i.id===id);if(!item) return;
      if(b.hasAttribute('data-cart-remove')) changeCart(id,0);
      else changeCart(id,item.quantity+(b.hasAttribute('data-cart-plus')?1:-1));
    });
    $('cart-items').addEventListener('change',event=>{const input=event.target;if(input.hasAttribute('data-cart-quantity')) {const qty=Number(input.value);changeCart(input.dataset.cartQuantity,input.value===''?1:Math.max(1,qty));}});
    $('detail-minus').addEventListener('click',()=>updateDetailQuantity(-1));$('detail-plus').addEventListener('click',()=>updateDetailQuantity(1));
    $('detail-quantity').addEventListener('change',()=>updateDetailQuantity());
    $('detail-add').addEventListener('click',()=>{updateDetailQuantity();addCart(state.detail,Number($('detail-quantity').value));});
    installGalleryEvents();
    document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDialog($(button.dataset.close))));
    document.querySelectorAll('dialog').forEach(dialog=>{
      dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);}});
      dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
      dialog.addEventListener('close',()=>{if(dialog.open)return;if(!document.querySelector('dialog[open]') && !$('filters').classList.contains('open'))document.body.classList.remove('modal-open');if(dialog.id==='product-dialog')state.detail=null;});
    });
    $('share-product').addEventListener('click',copyProductLink);
    $('copy-order').addEventListener('click',copyOrder);
    $('contact-order').addEventListener('click',event=>{
      const s=state.catalog.settings,url=C.safeLink((s.channels || {})[s.contactChannel]);
      if(config.demoMode || state.usingFallback || !url) {event.preventDefault();toast(state.usingFallback?'Trang đang dùng sản phẩm mẫu do chưa tải được dữ liệu thật. Giỏ hàng thật của bạn vẫn được lưu.':config.demoMode?'Đây là bản xem thử. Hãy cấu hình kênh nhận đơn và tắt demoMode trên hosting phù hợp để liên hệ thật.':'Cửa hàng chưa cấu hình kênh nhận đơn. Bạn có thể sao chép nội dung để gửi thủ công.');}
    });
    $('filter-open').addEventListener('click',()=>toggleFilters(true));
    ['filter-close','filter-shade','filter-done'].forEach(id=>$(id).addEventListener('click',()=>toggleFilters(false)));
    $('hero-explore').addEventListener('click',()=>{state.categories=[['Macbook','Tai nghe thể thao','Phụ kiện khác'][state.slide]];state.query='';state.price='';state.page=1;$('search-input').value='';renderFilterOptions();renderProducts();scrollCatalog();});
    document.querySelectorAll('.hero-dot').forEach(dot=>dot.addEventListener('click',()=>setSlide(Number(dot.dataset.slide))));
    $('nav-products').addEventListener('click',()=>{resetFilters();$('nav-products').classList.add('active');$('nav-contact').classList.remove('active');});
    $('nav-contact').addEventListener('click',()=>{$('nav-contact').classList.add('active');$('nav-products').classList.remove('active');});
    document.addEventListener('keydown',event=>{
      const dialog=document.querySelector('dialog[open]');
      const container=dialog || ($('filters').classList.contains('open') ? $('filters') : null);
      if(event.key==='Escape' && !dialog && container){event.preventDefault();toggleFilters(false);}
      if(event.key==='Escape' && dialog && typeof dialog.showModal!=='function'){event.preventDefault();closeDialog(dialog);}
      if(event.key==='Tab' && container){
        const focusable=Array.from(container.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea,summary,[tabindex="0"]')).filter(el=>el.getClientRects().length && !el.closest('[hidden]'));
        const first=focusable[0],last=focusable[focusable.length-1];
        if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
        if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
      }
    });
    window.addEventListener('resize',()=>{if(window.innerWidth>760 && $('filters').classList.contains('open')) toggleFilters(false);});
    window.addEventListener('storage',event=>{
      if(event.key===state.cartKey){state.cart=C.reconcileCart(parseJSON(event.newValue,[]),state.catalog.products,config.maxOrderQuantity);renderCart();}
      if(event.key===config.localDataKey && config.useLocalAdminData && !config.apiUrl) reloadLocal();
    });
    window.addEventListener('focus',reloadLocal);
    window.addEventListener('hashchange',syncProductRoute);
    window.addEventListener('popstate',syncProductRoute);
  }
  function reloadLocal() {
    if(config.apiUrl || !config.useLocalAdminData) return;
    const next=readStorage(config.localDataKey) || '';
    if(next!==localSnapshot){
      localSnapshot=next;
      const parsed=parseJSON(next,null);
      if(next && (!parsed || !Array.isArray(parsed.products))){toast('Dữ liệu Admin tại máy chưa hợp lệ. Trang giữ danh mục đang hiển thị; hãy kiểm tra lại file JSON.',true);return;}
      try{loadCatalog(parsed || seed);}catch(_){toast('Chưa đọc được cập nhật từ Admin. Hãy kiểm tra lại dữ liệu sản phẩm.',true);}
    }
  }
  function fetchJSONP(url) {
    return new Promise((resolve,reject)=>{
      let endpoint;
      try {endpoint=new URL(url);if(!/^https:$/.test(endpoint.protocol))throw new Error('URL API phải sử dụng HTTPS.');}
      catch(error){reject(new Error('URL Public API không hợp lệ.'));return;}
      const callback='wsCatalog_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');let done=false;
      const finish=(error,data)=>{
        if(done)return;done=true;clearTimeout(timer);script.remove();
        window[callback]=function(){};window.setTimeout(()=>{delete window[callback];},30000);
        if(error)reject(error);else resolve(data);
      };
      const timer=window.setTimeout(()=>finish(new Error('Quá thời gian tải dữ liệu.')),Math.max(1000,Number(config.apiTimeout)||10000));
      window[callback]=data=>{
        if(!data || data.error || !Array.isArray(data.products))finish(new Error('Public API trả dữ liệu không hợp lệ.'));
        else finish(null,data);
      };
      endpoint.searchParams.set('callback',callback);script.src=endpoint.toString();script.async=true;script.referrerPolicy='no-referrer';
      script.addEventListener('error',()=>finish(new Error('Không kết nối được Public API.')));document.head.appendChild(script);
    });
  }
  async function boot() {
    state.cart=parseJSON(readStorage(state.cartKey),[]);
    loadCatalog(currentData());installEvents();bindImages(document);
    routeReady=true;syncProductRoute();
    if(config.apiUrl) {
      $('product-grid').setAttribute('aria-busy','true');
      text('api-notice','Đang tải dữ liệu cửa hàng… Giỏ hàng đã lưu sẽ xuất hiện sau khi kết nối thành công.');$('api-notice').hidden=false;
      try {
        const data=await fetchJSONP(config.apiUrl);
        state.loadingApi=false;state.usingFallback=false;state.cartKey=config.cartKey;
        state.cart=parseJSON(readStorage(state.cartKey),[]);
        loadCatalog(data);$('api-notice').hidden=true;
      }
      catch(error){
        state.loadingApi=false;state.usingFallback=true;state.cartKey=config.cartKey+'.fallback';
        state.cart=parseJSON(readStorage(state.cartKey),[]);loadCatalog(seed);
        text('api-notice','Chưa tải được dữ liệu mới từ cửa hàng. Trang đang hiển thị sản phẩm mẫu. Giỏ hàng thật vẫn được giữ nguyên; giỏ thử nghiệm được lưu riêng.');$('api-notice').hidden=false;
      }
      finally {$('product-grid').setAttribute('aria-busy','false');}
    }
  }
  boot().catch(()=>{text('api-notice','Không thể khởi tạo dữ liệu. Hãy kiểm tra assets/js/data.js hoặc mở lại dự án bằng CHAY_TREN_MAC.command.');$('api-notice').hidden=false;});
})();
