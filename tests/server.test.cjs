'use strict';

// Kiểm tra request trực tiếp và giả lập socket. Không khởi động web server.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');
const serverModule = require('../scripts/local-server.cjs');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'WebShop test tiếng Việt-'));
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'index.html'), '<h1>Tiếng Việt</h1>');
fs.writeFileSync(path.join(root, 'admin.html'), 'Local admin');
fs.writeFileSync(path.join(root, 'assets', 'main.js'), 'window.fixture = true;');
fs.writeFileSync(path.join(root, 'secret.txt'), 'must not be served');
fs.symlinkSync(path.join(root, 'secret.txt'), path.join(root, 'assets', 'leak.js'));
const handler = serverModule.createHandler(root);
let checks = 0;

function check(value, expected, name) {
  assert.deepStrictEqual(value, expected, name);
  checks += 1;
}

function inject(url, method, host) {
  return new Promise(function (resolve, reject) {
    const response = {};
    const res = {
      writeHead: function (status, headers) { response.status = status; response.headers = headers; },
      end: function (body) {
        response.body = body === undefined ? '' : body.toString('utf8');
        resolve(response);
      }
    };
    try { handler({ url: url, method: method || 'GET', headers: { host: host || '127.0.0.1:4173' } }, res); }
    catch (error) { reject(error); }
  });
}

class FakeServer extends EventEmitter {
  constructor(unavailable) { super(); this.unavailable = unavailable; this.calls = []; this.port = null; }
  listen(port, host) {
    this.calls.push({ port: port, host: host });
    process.nextTick(() => {
      if (this.unavailable(port)) this.emit('error', Object.assign(new Error('busy'), { code: 'EADDRINUSE' }));
      else { this.port = port === 0 ? 51234 : port; this.emit('listening'); }
    });
    return this;
  }
  address() { return { port: this.port }; }
}

async function run() {
  check(serverModule.requestFile('/?sort=price'), 'index.html', 'root route');
  check(serverModule.requestFile('/assets/main.js?version=1'), 'assets/main.js', 'asset query');
  check(serverModule.requestFile('/admin.html'), 'admin.html', 'local admin route');
  const blocked = [
    '/../secret.txt', '/assets/../../secret.txt', '/assets/%2e%2e/secret.txt',
    '/assets/%2E%2E%2fsecret.txt', '/assets%5c..%5csecret.txt', '/assets/a%00.js',
    '/assets/.env', '/.git/config', '//example.com/index.html', '/assets/%E0%A4%A',
    '/scripts/local-server.cjs', '/apps-script/admin/Code.gs', '/docs/GITHUB_PAGES.md',
    '/README.md', '/assets/'
  ];
  blocked.forEach(function (url) { check(serverModule.requestFile(url), null, 'blocked: ' + url); });
  const page = await inject('/');
  check(page.status, 200, 'page served');
  check(page.body, '<h1>Tiếng Việt</h1>', 'UTF-8 body and unicode directory');
  check(page.headers['X-Content-Type-Options'], 'nosniff', 'safe content header');
  const head = await inject('/assets/main.js', 'HEAD');
  check(head.status, 200, 'HEAD served');
  check(head.body, '', 'HEAD has no body');
  check(head.headers['Content-Length'], Buffer.byteLength('window.fixture = true;'), 'HEAD length');
  check((await inject('/assets/nope.png')).status, 404, 'missing file');
  check((await inject('/assets/leak.js')).status, 404, 'symlink cannot expose other content');
  check((await inject('/admin.html')).status, 200, 'local admin is reachable');
  check((await inject('/', 'POST')).status, 405, 'read-only server');
  check((await inject('/', 'GET', 'evil.example')).status, 403, 'reject external Host header');
  check((await inject('/', 'GET', 'localhost:4173')).status, 200, 'localhost allowed');

  const occupied = new FakeServer(function (port) { return port < 4175; });
  check(await serverModule.listenAvailable(occupied, 4173), 4175, 'skip ports owned by other processes');
  check(occupied.calls.map(function (call) { return call.port; }), [4173, 4174, 4175], 'deterministic port retry');
  check(occupied.calls.every(function (call) { return call.host === '127.0.0.1'; }), true, 'loopback binding only');
  const allBusy = new FakeServer(function (port) { return port !== 0; });
  check(await serverModule.listenAvailable(allBusy, 4173), 51234, 'fallback to OS selected port');
  check(allBusy.calls.length, 21, 'finite number of retries');
  process.stdout.write('PASS: ' + checks + ' server checks (request injection; no listening socket).\n');
}

function cleanup(directory) {
  fs.readdirSync(directory).forEach(function (name) {
    const file = path.join(directory, name);
    const stat = fs.lstatSync(file);
    if (stat.isDirectory() && !stat.isSymbolicLink()) cleanup(file);
    else fs.unlinkSync(file);
  });
  fs.rmdirSync(directory);
}

run().catch(function (error) {
  process.stderr.write(error.stack + '\n');
  process.exitCode = 1;
}).finally(function () { cleanup(root); });
