// Turns a short request description into a Postman v2.1 item.
// Test and pre-request scripts are written as real functions (so they can be linted) and stored as their body lines.

function scriptLines(fn) {
  if (typeof fn === 'string') return fn.trim().split('\n');
  const source = fn.toString();
  const body = source.slice(source.indexOf('{') + 1, source.lastIndexOf('}'));
  const lines = body.split('\n');
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(indent)).filter((l, i, all) => l.trim() || (i > 0 && i < all.length - 1));
}

function event(listen, fn) {
  return { listen, script: { type: 'text/javascript', exec: scriptLines(fn) } };
}

function urlObject(raw) {
  const [base, query] = raw.split('?');
  const [host, ...path] = base.split('/').filter(Boolean);
  const url = { raw, host: [host], path };
  if (query) url.query = query.split('&').map((pair) => ({ key: pair.split('=')[0], value: pair.split('=').slice(1).join('=') }));
  return url;
}

function bodyObject(body) {
  if (!body) return undefined;
  if (body.form) return { mode: 'urlencoded', urlencoded: Object.entries(body.form).map(([key, value]) => ({ key, value, type: 'text' })) };
  const raw = typeof body.raw === 'string' ? body.raw : JSON.stringify(body.raw, null, 2);
  return { mode: 'raw', raw, options: { raw: { language: 'json' } } };
}

function item({ name, method = 'GET', url, headers = {}, body, tests, prerequest, description }) {
  const events = [];
  if (prerequest) events.push(event('prerequest', prerequest));
  if (tests) events.push(event('test', tests));
  return {
    name,
    event: events,
    request: {
      method,
      header: Object.entries(headers).map(([key, value]) => ({ key, value })),
      body: bodyObject(body),
      url: urlObject(url),
      description,
    },
  };
}

function folder(name, description, items) {
  return { name, description, item: items };
}

module.exports = { item, folder, event, scriptLines };
