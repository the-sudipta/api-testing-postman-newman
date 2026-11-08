const { item, folder } = require('../postman-item');
const { JSON_HEADERS } = require('./headers');

const healthCheck = item({
  name: 'Health check - GET /ping returns 201',
  url: '{{baseUrl}}/ping',
  tests: function () {
    pm.test('Status is 201 Created (as documented in /apidoc)', function () {
      pm.response.to.have.status(201);
    });
    pm.test('Body says Created', function () {
      pm.expect(pm.response.text()).to.eql('Created');
    });
  },
});

const createToken = item({
  name: 'Create token with valid credentials',
  method: 'POST',
  url: '{{baseUrl}}/auth',
  headers: JSON_HEADERS,
  body: { raw: { username: '{{username}}', password: '{{password}}' } },
  tests: function () {
    const body = pm.response.json();
    pm.test('Status is 200', function () {
      pm.response.to.have.status(200);
    });
    pm.test('Token is a non-empty string', function () {
      pm.expect(body.token).to.be.a('string').and.not.empty;
    });
    pm.test('Token response matches the schema', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('tokenSchema')));
    });
    pm.environment.set('token', body.token);
  },
});

const wrongPassword = item({
  name: 'Create token with wrong password',
  method: 'POST',
  url: '{{baseUrl}}/auth',
  headers: JSON_HEADERS,
  body: { raw: { username: '{{username}}', password: 'wrong-password' } },
  tests: function () {
    pm.test('No token is returned', function () {
      pm.expect(pm.response.json()).to.not.have.property('token');
    });
    pm.test('Reason is "Bad credentials"', function () {
      pm.expect(pm.response.json().reason).to.eql('Bad credentials');
    });
    pm.test('[F-01] Known issue: status is 200 instead of 401', function () {
      pm.response.to.have.status(200);
    });
  },
});

const emptyBody = item({
  name: 'Create token with empty body',
  method: 'POST',
  url: '{{baseUrl}}/auth',
  headers: JSON_HEADERS,
  body: { raw: {} },
  tests: function () {
    pm.test('No token is returned', function () {
      pm.expect(pm.response.json()).to.not.have.property('token');
    });
    pm.test('[F-01] Known issue: status is 200 instead of 400/401', function () {
      pm.response.to.have.status(200);
    });
  },
});

module.exports = folder('Auth', 'Health check and token creation (POST /auth).', [healthCheck, createToken, wrongPassword, emptyBody]);
