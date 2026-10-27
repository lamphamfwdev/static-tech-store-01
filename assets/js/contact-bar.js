/* Thanh liên hệ dùng cấu hình cửa hàng hiện có. Không cần package hoặc backend mới. */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ShopContactBar = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function safeHttps(value) {
    if (typeof value !== 'string') return '';
    var raw = value.trim();
    if (!/^https:\/\//i.test(raw) || /[\u0000-\u0020\u007f<>"'\\`]/.test(raw)) return '';
    try {
      var url = new URL(raw);
      if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return '';
      return url.href;
    } catch (_) { return ''; }
  }

  function phoneNumber(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return '';
    var raw = String(value).trim();
    // Chấp nhận dấu cách, dấu chấm, gạch ngang và ngoặc của cách viết số điện thoại.
    // Không rút chữ số từ chuỗi tùy ý, không chấp nhận extension/lệnh quay số.
    if (/[\u0000-\u001f\u007f]/.test(raw) || !/^\+?[0-9 ().\-\u00a0]+$/.test(raw)) return '';
    var normalized = raw.replace(/[ ().\-\u00a0]/g, '');
    return /^\+?[0-9]{7,15}$/.test(normalized) ? normalized : '';
  }

  function getModel(settings, options) {
    settings = settings || {};
    options = options || {};
    var channels = settings.channels || {};
    var phone = phoneNumber(settings.phone);
    var status = options.loadingApi ? 'Đang tải thông tin liên hệ.' :
      options.usingFallback ? 'Đang dùng dữ liệu mẫu; liên hệ trực tiếp chưa bật.' :
      options.demoMode ? 'Bản xem thử: liên hệ trực tiếp chưa bật.' : '';
    var blocked = Boolean(status);
    var actions = [
      {id:'zalo', label:'Zalo', icon:'chat', href:safeHttps(channels.zalo) || safeHttps(channels.zaloOA), external:true},
      {id:'messenger', label:'Messenger', icon:'chat', href:safeHttps(channels.messenger), external:true},
      {id:'phone', label:'Gọi điện', icon:'phone', href:phone ? 'tel:' + phone : '', external:false}
    ];
    actions = actions.filter(function (action) { return blocked || Boolean(action.href); }).map(function (action) {
      return {id:action.id, label:action.label, icon:action.icon, href:blocked ? '' : action.href,
        external:action.external, disabled:blocked, description:status};
    });
    return {actions:actions, visible:actions.length > 0, blocked:blocked, status:status,
      caption:options.loadingApi ? 'Đang tải liên hệ' : blocked ? 'Liên hệ · Xem thử' : 'Liên hệ nhanh'};
  }

  function makeIcon(doc, name) {
    var svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }

  function render(settings, options) {
    var doc = root.document;
    if (!doc || !doc.body) return null;
    var model = getModel(settings, options);
    var nav = doc.getElementById('quick-contact');
    if (!nav) {
      nav = doc.createElement('nav');
      nav.id = 'quick-contact';
      nav.className = 'quick-contact';
      nav.setAttribute('aria-label', 'Liên hệ nhanh với cửa hàng');
      doc.body.appendChild(nav);
    }
    var focused = doc.activeElement;
    var focusKey = focused && nav.contains(focused) ? focused.getAttribute('data-contact') : '';
    while (nav.firstChild) nav.removeChild(nav.firstChild);
    nav.hidden = !model.visible;
    doc.body.classList.toggle('has-quick-contact', model.visible);
    if (!model.visible) return nav;

    var caption = doc.createElement('p');
    caption.className = 'quick-contact__caption';
    caption.textContent = model.caption;
    nav.appendChild(caption);
    if (model.status) {
      var status = doc.createElement('span');
      status.id = 'quick-contact-status';
      status.className = 'sr-only';
      status.textContent = model.status;
      nav.appendChild(status);
    }

    model.actions.forEach(function (action) {
      var link = doc.createElement(action.disabled ? 'button' : 'a');
      link.className = 'quick-contact__item quick-contact__item--' + action.id;
      link.setAttribute('data-contact', action.id);
      link.setAttribute('aria-label', action.disabled ? action.label + ' — ' + action.description :
        action.id === 'phone' ? 'Gọi điện cho cửa hàng' : 'Liên hệ cửa hàng qua ' + action.label);
      if (action.disabled) {
        link.type = 'button';
        link.disabled = true;
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('aria-describedby', 'quick-contact-status');
        link.title = action.description;
      } else {
        link.setAttribute('href', action.href);
        if (action.external) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
      var badge = doc.createElement('span');
      badge.className = 'quick-contact__icon';
      badge.appendChild(makeIcon(doc, action.icon));
      var label = doc.createElement('span');
      label.textContent = action.label;
      link.appendChild(badge);
      link.appendChild(label);
      nav.appendChild(link);
      if (focusKey === action.id && !action.disabled) link.focus();
    });
    return nav;
  }

  return {safeHttps:safeHttps, phoneNumber:phoneNumber, getModel:getModel, render:render};
});
