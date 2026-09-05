import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const files = [...fs.readdirSync('.').filter(f => f.endsWith('.html')), ...['works', 'members'].flatMap(dir => fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => `${dir}/${f}`))];
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /<title>[\s\S]+?<\/title>/);
  for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(link)) continue;
    const [target, anchor] = link.split('#');
    let resolved = path.resolve(path.dirname(file), target || path.basename(file));
    assert.ok(resolved.startsWith(root + path.sep) || resolved === root, `Outside project: ${link}`);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) resolved = path.join(resolved, 'index.html');
    assert.ok(fs.existsSync(resolved), `Broken link: ${file} -> ${link}`);
    if (anchor) assert.ok(fs.readFileSync(resolved, 'utf8').includes(`id="${anchor}"`), `Missing anchor: ${link}`);
  }
}
console.log(`Passed: ${files.length} HTML pages; local links, images and anchors.`);
