// Re-sends the request behind every finding in docs/findings.md and records the raw status, headers and body
// in docs/evidence/findings-evidence.md, so each finding can be reproduced and checked by anyone.
const fs = require('fs');
const path = require('path');

const RB = 'https://restful-booker.herokuapp.com';
const AE = 'https://automationexercise.com/api';
const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };
const booking = (overrides) => ({
  firstname: 'Ayesha',
  lastname: 'Rahman',
  totalprice: 250,
  depositpaid: true,
  bookingdates: { checkin: '2027-03-10', checkout: '2027-03-13' },
  additionalneeds: 'Late checkout',
  ...overrides,
});
const post = (body, headers = JSON_HEADERS) => ({ method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });

const CASES = [
  ['F-01', 'POST /auth with a wrong password', `${RB}/auth`, post({ username: 'admin', password: 'wrong' })],
  ['F-02', 'POST /booking with valid data', `${RB}/booking`, post(booking({}))],
  ['F-03', 'GET /ping', `${RB}/ping`, {}],
  [
    'F-04',
    'DELETE /booking/999999999 with a valid token',
    `${RB}/booking/999999999`,
    { method: 'DELETE', headers: { Cookie: 'token={{token}}' } },
  ],
  ['F-05', 'POST /booking without firstname', `${RB}/booking`, post(booking({ firstname: undefined }))],
  ['F-06', 'POST /booking with totalprice "abc"', `${RB}/booking`, post(booking({ totalprice: 'abc' }))],
  ['F-07', 'POST /booking with totalprice -50', `${RB}/booking`, post(booking({ totalprice: -50 }))],
  [
    'F-08',
    'POST /booking with checkout before checkin',
    `${RB}/booking`,
    post(booking({ bookingdates: { checkin: '2027-02-10', checkout: '2027-02-01' } })),
  ],
  [
    'F-09',
    'POST /booking with checkin "not-a-date"',
    `${RB}/booking`,
    post(booking({ bookingdates: { checkin: 'not-a-date', checkout: '2027-02-01' } })),
  ],
  ['F-10', 'POST /booking with depositpaid "yes"', `${RB}/booking`, post(booking({ depositpaid: 'yes' }))],
  [
    'F-11',
    'POST /booking with Accept: text/plain',
    `${RB}/booking`,
    post(booking({}), { 'Content-Type': 'application/json', Accept: 'text/plain' }),
  ],
  ['F-12', 'PATCH /booking (collection URL)', `${RB}/booking`, { method: 'PATCH', headers: JSON_HEADERS, body: '{}' }],
  ['F-13', 'POST /productsList (not supported)', `${AE}/productsList`, { method: 'POST' }],
  ['F-14', 'GET /productsList (Content-Type)', `${AE}/productsList`, {}],
  ['F-15', 'GET /brandsList', `${AE}/brandsList`, {}],
];

async function token() {
  const response = await fetch(`${RB}/auth`, post({ username: 'admin', password: 'password123' }));
  return (await response.json()).token;
}

async function record([id, title, url, init], authToken) {
  const headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k, v.replace('{{token}}', authToken)]));
  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  const body = text.length > 600 ? `${text.slice(0, 600)} … (${text.length} chars)` : text;
  return [
    `### ${id} — ${title}`,
    '',
    `\`${init.method || 'GET'} ${url}\``,
    '',
    '```http',
    `HTTP ${response.status} ${response.statusText}`,
    `Content-Type: ${response.headers.get('content-type')}`,
    '',
    body,
    '```',
    '',
  ].join('\n');
}

async function main() {
  const authToken = await token();
  const parts = [`# Evidence for findings`, '', `Captured ${new Date().toISOString()} with \`node scripts/capture-evidence.js\`.`, ''];
  for (const testCase of CASES) parts.push(await record(testCase, authToken));
  const file = path.resolve(__dirname, '../docs/evidence/findings-evidence.md');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, parts.join('\n'));
  console.log(`evidence written for ${CASES.length} requests`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
