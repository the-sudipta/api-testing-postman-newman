const { item, folder } = require('../postman-item');
const { JSON_HEADERS } = require('./headers');
const { BOOKING_BODY, prepareBooking } = require('./booking-body');

const setup = item({
  name: 'Setup - create a booking for contract checks',
  method: 'POST',
  url: '{{baseUrl}}/booking',
  headers: JSON_HEADERS,
  body: { raw: BOOKING_BODY },
  prerequest: prepareBooking,
  tests: function () {
    pm.test('POST /booking response follows the created-booking contract', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('createdBookingSchema')));
    });
    pm.environment.set('contractBookingId', pm.response.json().bookingid);
  },
});

const bookingContract = item({
  name: 'GET /booking/{id} follows the booking contract',
  url: '{{baseUrl}}/booking/{{contractBookingId}}',
  headers: JSON_HEADERS,
  tests: function () {
    pm.test('Body matches the strict booking schema (no extra fields)', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('bookingSchema')));
    });
    pm.test('Dates use the YYYY-MM-DD format', function () {
      pm.expect(pm.response.json().bookingdates.checkin).to.match(/^\d{4}-\d{2}-\d{2}$/);
    });
  },
});

const idsContract = item({
  name: 'GET /booking follows the ID list contract',
  url: '{{baseUrl}}/booking',
  headers: JSON_HEADERS,
  tests: function () {
    pm.test('Body matches the booking ID list schema', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('bookingIdsSchema')));
    });
  },
});

const headerContract = item({
  name: 'GET /booking/{id} returns JSON headers',
  url: '{{baseUrl}}/booking/{{contractBookingId}}',
  headers: JSON_HEADERS,
  tests: function () {
    pm.test('Content-Type is application/json; charset=utf-8', function () {
      pm.response.to.have.header('Content-Type', 'application/json; charset=utf-8');
    });
    pm.test('Response is not cached by intermediaries without control (has ETag)', function () {
      pm.response.to.have.header('ETag');
    });
  },
});

const tokenContract = item({
  name: 'POST /auth follows the token contract',
  method: 'POST',
  url: '{{baseUrl}}/auth',
  headers: JSON_HEADERS,
  body: { raw: { username: '{{username}}', password: '{{password}}' } },
  tests: function () {
    pm.test('Body matches the token schema', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('tokenSchema')));
    });
  },
});

const teardown = item({
  name: 'Teardown - delete the contract booking',
  method: 'DELETE',
  url: '{{baseUrl}}/booking/{{contractBookingId}}',
  headers: { Cookie: 'token={{token}}' },
  tests: function () {
    pm.test('Status is 201', function () {
      pm.response.to.have.status(201);
    });
  },
});

module.exports = folder('Contract', 'JSON schema and header contract checks for every resource.', [
  setup,
  bookingContract,
  idsContract,
  headerContract,
  tokenContract,
  teardown,
]);
