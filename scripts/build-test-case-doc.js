// Generates docs/api-test-cases.md from the built collections, so the table always matches what runs.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['restful-booker', 'automation-exercise', 'data-driven'];
const PREFIX = { 'restful-booker': 'RB', 'automation-exercise': 'AE', 'data-driven': 'DD' };

function testNames(item) {
  const script = (item.event || []).find((e) => e.listen === 'test');
  if (!script) return [];
  const joined = script.script.exec.join('\n');
  return [...joined.matchAll(/pm\.test\((['"])(.*?)\1/g)].map((m) => m[2].replace(/'\s*\+\s*pm\.info\.iteration\s*\+\s*'/, 'N'));
}

const cell = (text) => String(text).replace(/\|/g, '\\|');

function rows(collectionName) {
  const collection = JSON.parse(fs.readFileSync(path.join(ROOT, `collections/${collectionName}.postman_collection.json`), 'utf8'));
  const lines = [];
  let n = 0;
  for (const folder of collection.item) {
    for (const item of folder.item) {
      n += 1;
      const id = `${PREFIX[collectionName]}-${String(n).padStart(2, '0')}`;
      const endpoint = item.request.url.raw.replace(/\{\{(baseUrl|aeBaseUrl)\}\}/, '');
      const checks = testNames(item).map(cell).join('<br>');
      lines.push(`| ${id} | ${folder.name} | ${cell(item.name)} | ${item.request.method} | \`${cell(endpoint)}\` | ${checks} |`);
    }
  }
  return { title: collection.info.name, lines, count: n };
}

function main() {
  const out = [
    '# API Test Cases',
    '',
    'Generated from the collections (`npm run build:docs`). Every request also checks the response time',
    '(collection-level test). Checks starting with **[F-xx]** document a known issue — see [findings.md](findings.md).',
    '',
  ];
  let total = 0;
  for (const file of FILES) {
    const { title, lines, count } = rows(file);
    total += count;
    out.push(
      `## ${title} (${count} requests)`,
      '',
      '| ID | Folder | Request | Method | Endpoint | Checks |',
      '|---|---|---|---|---|---|',
      ...lines,
      '',
    );
  }
  out.splice(5, 0, `Total: **${total} requests**.`, '');
  fs.writeFileSync(path.join(ROOT, 'docs/api-test-cases.md'), out.join('\n'));
  console.log(`api-test-cases.md written: ${total} requests`);
}

main();
