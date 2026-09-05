// GitHub Pages用にファイルをコピーするだけです。元のHTMLは変更しません。
import fs from 'node:fs';
import path from 'node:path';
const output = '_site';
fs.mkdirSync(output, { recursive: true });
const pages = fs.readdirSync('.').filter(file => file.endsWith('.html'));
for (const file of [...pages, 'style.css', 'script.js']) {
  fs.copyFileSync(file, path.join(output, file));
}
for (const dir of ['images', 'works', 'members']) fs.cpSync(dir, path.join(output, dir), { recursive: true });
for (const file of ['sitemap.xml', 'robots.txt']) {
  if (fs.existsSync(file)) fs.copyFileSync(file, path.join(output, file));
}
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log('Static files copied to _site/. Source HTML was not changed.');
