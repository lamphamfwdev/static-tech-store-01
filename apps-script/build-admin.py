#!/usr/bin/env python3
"""Regenerate the self-contained Apps Script HTML after editing local Admin files.

No packages required. Run from any directory:
    python3 apps-script/build-admin.py
This does not build the storefront or require Node.
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / 'admin.html').read_text(encoding='utf-8')
css = (root / 'assets/css/admin.css').read_text(encoding='utf-8')
js = (root / 'assets/js/admin.js').read_text(encoding='utf-8')

html = html.replace('<head>', '<head>\n  <base target="_top">', 1)
html = html.replace('  <link rel="stylesheet" href="assets/css/admin.css">', '<style>\n' + css.replace('@charset "UTF-8";', '') + '\n</style>')
html = html.replace('  <script src="assets/js/config.js"></script>', '<script>window.SHOP_CONFIG = {};</script>')
html = html.replace('  <script src="assets/js/data.js"></script>', '')
html = html.replace('  <script src="assets/js/admin.js"></script>', '<script>\n' + js.replace('</script', '<\\/script') + '\n</script>')
destination = root / 'apps-script/admin/Admin.html'
destination.write_text(html, encoding='utf-8')
print('Generated:', destination.relative_to(root))
