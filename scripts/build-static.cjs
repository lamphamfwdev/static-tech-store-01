'use strict';

// Không transpile hoặc cài package. Chỉ tạo thư mục frontend được phép công khai.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

function removeTree(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.lstatSync(target);
  if (stat.isDirectory() && !stat.isSymbolicLink()) {
    fs.readdirSync(target).forEach(function (name) { removeTree(path.join(target, name)); });
    fs.rmdirSync(target);
  } else {
    fs.unlinkSync(target);
  }
}

function copyTree(source, destination) {
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error('Không đưa symlink vào bản public: ' + path.relative(ROOT, source));
  const filename = path.basename(source);
  if (filename.startsWith('.') || /(^admin($|[.-])|\.map$)/i.test(filename)) return;
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    fs.readdirSync(source).sort().forEach(function (entry) {
      copyTree(path.join(source, entry), path.join(destination, entry));
    });
  } else if (stat.isFile()) {
    fs.copyFileSync(source, destination);
  }
}

function build() {
  const demo = process.argv.includes('--demo');
  const required = ['index.html', 'assets/js/config.js', 'assets/js/data.js'];
  required.forEach(function (relativeFile) {
    if (!fs.existsSync(path.join(ROOT, relativeFile))) throw new Error('Thiếu file: ' + relativeFile);
    if (fs.lstatSync(path.join(ROOT, relativeFile)).isSymbolicLink()) throw new Error('File public không được là symlink: ' + relativeFile);
  });
  removeTree(OUT);
  fs.mkdirSync(OUT, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(OUT, 'index.html'));
  copyTree(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  if (fs.existsSync(path.join(ROOT, 'favicon.ico'))) copyTree(path.join(ROOT, 'favicon.ico'), path.join(OUT, 'favicon.ico'));

  if (demo) {
    // GitHub Pages chỉ dùng để giới thiệu bản demo. Không thay config nguồn.
    const configFile = path.join(OUT, 'assets/js/config.js');
    fs.appendFileSync(configFile, '\n// GitHub Pages demo: không mở kênh nhận đơn thật.\nwindow.SHOP_CONFIG = Object.assign({}, window.SHOP_CONFIG, { demoMode: true, apiUrl: "", adminUrl: "", useLocalAdminData: false });\n');
  }

  let fileCount = 0;
  function countFiles(directory) {
    fs.readdirSync(directory).forEach(function (name) {
      const target = path.join(directory, name);
      if (fs.statSync(target).isDirectory()) countFiles(target);
      else fileCount += 1;
    });
  }
  countFiles(OUT);
  process.stdout.write('Đã tạo dist/ (' + fileCount + ' file' + (demo ? ', chế độ demo' : '') + ').\n');
  process.stdout.write('Chỉ có frontend công khai; không chứa admin.html, Apps Script hoặc tài liệu.\n');
}

try { build(); } catch (error) {
  process.stderr.write('Build thất bại: ' + error.message + '\n');
  process.exitCode = 1;
}
