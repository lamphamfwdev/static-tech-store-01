'use strict';

// Server tĩnh nhỏ, không dependency; tương thích Node 14.
const fs = require('fs');
const path = require('path');
const http = require('http');
const childProcess = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_PORT = 4173;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function requestFile(requestUrl) {
  if (typeof requestUrl !== 'string' || !requestUrl.startsWith('/') || requestUrl.startsWith('//')) return null;
  let pathname;
  try {
    // Kiểm tra đường dẫn gốc trước khi bất kỳ URL parser nào chuẩn hoá dấu .. .
    pathname = decodeURIComponent(requestUrl.split('?')[0].split('#')[0]);
  } catch (_) {
    return null;
  }
  if (/[\u0000-\u001f\u007f\\]/.test(pathname)) return null;
  const segments = pathname.split('/');
  if (segments.some(function (part) { return part.startsWith('.'); })) return null;
  if (pathname === '/') return 'index.html';
  if (pathname === '/index.html' || pathname === '/admin.html' || pathname === '/favicon.ico') return pathname.slice(1);
  if (!pathname.startsWith('/assets/') || pathname.endsWith('/')) return null;
  if (!MIME[path.extname(pathname).toLowerCase()]) return null;
  return pathname.slice(1);
}

function fileWithoutSymlinks(root, relativeFile) {
  let cursor = root;
  for (const segment of relativeFile.split('/')) {
    if (!segment) continue;
    cursor = path.join(cursor, segment);
    const stat = fs.lstatSync(cursor);
    if (stat.isSymbolicLink()) throw new Error('Symlink is not served');
  }
  if (!fs.statSync(cursor).isFile()) throw new Error('Not a file');
  return cursor;
}

function createHandler(root) {
  const canonicalRoot = fs.realpathSync(root || PROJECT_ROOT);
  return function handle(req, res) {
    const baseHeaders = {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
    function fail(status, message, extra) {
      const body = Buffer.from(message + '\n');
      res.writeHead(status, Object.assign({}, baseHeaders, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': body.length
      }, extra || {}));
      res.end(req.method === 'HEAD' ? undefined : body);
    }

    const host = req.headers && req.headers.host;
    if (host && !/^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(host)) {
      return fail(403, 'Only localhost is allowed');
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return fail(405, 'Method not allowed', { Allow: 'GET, HEAD' });
    }
    const relativeFile = requestFile(req.url);
    if (!relativeFile) return fail(404, 'Not found');

    let filename;
    try {
      filename = fileWithoutSymlinks(canonicalRoot, relativeFile);
    } catch (_) {
      return fail(404, 'Not found');
    }
    fs.readFile(filename, function (error, body) {
      if (error) return fail(404, 'Not found');
      res.writeHead(200, Object.assign({}, baseHeaders, {
        'Content-Type': MIME[path.extname(filename).toLowerCase()] || 'application/octet-stream',
        'Content-Length': body.length
      }));
      res.end(req.method === 'HEAD' ? undefined : body);
    });
  };
}

function listenOnce(server, port) {
  return new Promise(function (resolve, reject) {
    function cleanup() {
      server.removeListener('error', onError);
      server.removeListener('listening', onListening);
    }
    function onError(error) { cleanup(); reject(error); }
    function onListening() { cleanup(); resolve(server.address().port); }
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '127.0.0.1');
  });
}

async function listenAvailable(server, preferredPort) {
  for (let offset = 0; offset < 20; offset += 1) {
    const port = preferredPort + offset;
    if (port > 65535) break;
    try {
      return await listenOnce(server, port);
    } catch (error) {
      if (error.code !== 'EADDRINUSE') throw error;
    }
  }
  // Nếu dải cổng mặc định đều bận, để hệ điều hành chọn một cổng còn trống.
  return listenOnce(server, 0);
}

async function main() {
  if (!fs.existsSync(path.join(PROJECT_ROOT, 'index.html'))) {
    throw new Error('Không tìm thấy index.html. Hãy giải nén đầy đủ dự án.');
  }
  const configuredPort = process.env.SHOP_PORT;
  const port = configuredPort ? Number(configuredPort) : DEFAULT_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SHOP_PORT phải là số nguyên từ 1 đến 65535.');
  }
  const server = http.createServer(createHandler(PROJECT_ROOT));
  const activePort = await listenAvailable(server, port);
  const url = 'http://127.0.0.1:' + activePort + '/';
  process.stdout.write('\nWebsite đã chạy: ' + url + '\n');
  process.stdout.write('Admin mẫu:       ' + url + 'admin.html\n');
  process.stdout.write('Ctrl+C để dừng server này.\n\n');

  if (process.argv.includes('--open') && process.platform === 'darwin') {
    const opener = childProcess.spawn('/usr/bin/open', [url], { stdio: 'ignore' });
    opener.on('error', function () {
      process.stdout.write('Hãy tự mở địa chỉ phía trên trong trình duyệt.\n');
    });
  }

  let shuttingDown = false;
  function stop() {
    if (shuttingDown) return;
    shuttingDown = true;
    process.stdout.write('\nĐang dừng WebShop100...\n');
    server.close(function () { process.exit(0); });
    const shutdownTimer = setTimeout(function () { process.exit(0); }, 1500);
    shutdownTimer.unref();
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  process.on('SIGHUP', stop);
  server.on('error', function (error) {
    process.stderr.write('Server gặp lỗi: ' + error.message + '\n');
    process.exitCode = 1;
    stop();
  });
}

module.exports = { requestFile, createHandler, listenAvailable, DEFAULT_PORT };
if (require.main === module) {
  main().catch(function (error) {
    process.stderr.write('\nKhông thể chạy WebShop100: ' + error.message + '\n');
    process.stderr.write('Bạn vẫn có thể mở trực tiếp file index.html để xem giao diện mẫu.\n');
    process.exitCode = 1;
  });
}
