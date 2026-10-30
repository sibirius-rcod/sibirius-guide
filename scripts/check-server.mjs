import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';

const origin = process.argv[2] || 'http://127.0.0.1:5173';
const visited = new Set();
const queue = ['/src/main.tsx'];
const index = await fetch(origin);
assert.equal(index.status, 200);
assert.ok((await index.text()).includes('lang="ru"'));
while (queue.length) {
  const path = queue.shift();
  if (visited.has(path)) continue;
  visited.add(path);
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, `HTTP 200: ${path}`);
  const content = await response.text();
  for (const match of content.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g)) {
    const target = match[1];
    if (target.startsWith('/') || target.startsWith('./') || target.startsWith('../')) {
      const url = new URL(target, new URL(path, origin));
      if (url.origin === origin) queue.push(url.pathname + url.search);
    }
  }
}
for (const name of await readdir('src/assets/images')) {
  assert.equal((await fetch(`${origin}/src/assets/images/${name}`)).status, 200, name);
}
console.log(`OK: index, ${visited.size} модулей dev-сервера и все локальные изображения возвращают HTTP 200.`);
