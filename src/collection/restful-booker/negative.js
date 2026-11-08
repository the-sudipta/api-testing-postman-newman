const { item, folder } = require('../postman-item');
const { JSON_HEADERS, withToken } = require('./headers');
const { BOOKING_BODY, prepareBooking, bodyWith } = require('./booking-body');

// Requests marked [F-xx] assert the CURRENT behaviour of a known issue documented in docs/findings.md.
// If the API gets fixed, that assertion fails and tells us to retest and close the finding.

const setup = item({
  name: 'Setup - create a booking for negative checks',
  method: 'POST',
  url: '{{baseUrl}}/booking',
  headers: JSON_HEADERS,
  body: { raw: BOOKING_BODY },
  prerequest: prepareBooking,
  tests: function () {
    pm.test('Setup booking created', function () {
      pm.response.to.have.status(200);
    });
    pm.environment.set('negativeBookingId', pm.response.json().bookingid);
  },
});

function forbidden(name, method, headers, body) {
  return item({
    name,
    method,
    url: '{{baseUrl}}/booking/{{negativeBookingId}}',
    headers,
    body,
    tests: function () {
      pm.test('Status is 403 Forbidden', function () {
        pm.response.to.have.status(403);
      });
      pm.test('Body is "Forbidden"', function () {
        pm.expect(pm.response.text()).to.eql('Forbidden');
      });
    },
  });
}

function created(name, body, tests) {
  return item({ name, method: 'POST', url: '{{baseUrl}}/booking', headers: JSON_HEADERS, body: { raw: body }, tests });
}

const notFound = (name, id) =>
  item({
    name,
    url: `{{baseUrl}}/booking/${id}`,
    headers: JSON_HEADERS,
    tests: function () {
      pm.test('Status is 404 Not Found', function () {
        pm.response.to.have.status(404);
      });
    },
  });

const items = [
  setup,
  forbidden('Update without token', 'PUT', JSON_HEADERS, { raw: bodyWith({}) }),
  forbidden('Update with invalid token', 'PUT', { ...JSON_HEADERS, Cookie: 'token=invalid123' }, { raw: bodyWith({}) }),
  forbidden('Partial update without token', 'PATCH', JSON_HEADERS, { raw: { firstname: 'Hacker' } }),
  forbidden('Delete without token', 'DELETE', {}, undefined),
  notFound('Get non-existing booking ID', '999999999'),
  notFound('Get booking with non-numeric ID', 'abc'),
  created('Create booking without firstname', bodyWith({ firstname: undefined }), function () {
    pm.test('[F-05] Known issue: missing required field gives 500 instead of 400', function () {
      pm.response.to.have.status(500);
    });
  }),
  created('Create booking with totalprice as text', bodyWith({ totalprice: 'abc' }), function () {
    pm.test('[F-06] Known issue: accepted with 200 and totalprice stored as null', function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json().booking.totalprice).to.eql(null);
    });
  }),
  created('Create booking with negative totalprice', bodyWith({ totalprice: -50 }), function () {
    pm.test('[F-07] Known issue: negative price is accepted', function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json().booking.totalprice).to.eql(-50);
    });
  }),
  created(
    'Create booking with checkout before checkin',
    bodyWith({ bookingdates: { checkin: '2027-02-10', checkout: '2027-02-01' } }),
    function () {
      pm.test('[F-08] Known issue: reversed dates are accepted', function () {
        pm.response.to.have.status(200);
      });
    },
  ),
  created(
    'Create booking with invalid date text',
    bodyWith({ bookingdates: { checkin: 'not-a-date', checkout: '2027-02-01' } }),
    function () {
      pm.test('[F-09] Known issue: invalid date stored as "0NaN-aN-aN"', function () {
        pm.response.to.have.status(200);
        pm.expect(pm.response.json().booking.bookingdates.checkin).to.eql('0NaN-aN-aN');
      });
    },
  ),
  created('Create booking with depositpaid as text', bodyWith({ depositpaid: 'yes' }), function () {
    pm.test('[F-10] Known issue: "yes" is silently converted to true', function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json().booking.depositpaid).to.eql(true);
    });
  }),
  created('Create booking with malformed JSON', '{"firstname": ', function () {
    pm.test('Status is 400 Bad Request', function () {
      pm.response.to.have.status(400);
    });
  }),
  item({
    name: 'Create booking asking for text/plain',
    method: 'POST',
    url: '{{baseUrl}}/booking',
    headers: { 'Content-Type': 'application/json', Accept: 'text/plain' },
    body: { raw: bodyWith({}) },
    tests: function () {
      pm.test("[F-11] Known issue: unsupported Accept returns 418 I'm a Teapot instead of 406", function () {
        pm.response.to.have.status(418);
      });
    },
  }),
  item({
    name: 'PATCH on the booking collection (method not allowed)',
    method: 'PATCH',
    url: '{{baseUrl}}/booking',
    headers: withToken,
    body: { raw: { firstname: 'Nobody' } },
    tests: function () {
      pm.test('[F-12] Known issue: returns 404 instead of 405 Method Not Allowed', function () {
        pm.response.to.have.status(404);
      });
    },
  }),
  item({
    name: 'Teardown - delete the setup booking',
    method: 'DELETE',
    url: '{{baseUrl}}/booking/{{negativeBookingId}}',
    headers: { Cookie: 'token={{token}}' },
    tests: function () {
      pm.test('Status is 201', function () {
        pm.response.to.have.status(201);
      });
    },
  }),
  item({
    name: 'Delete the same booking again',
    method: 'DELETE',
    url: '{{baseUrl}}/booking/{{negativeBookingId}}',
    headers: { Cookie: 'token={{token}}' },
    tests: function () {
      pm.test('[F-04] Known issue: deleting a missing booking returns 405 instead of 404', function () {
        pm.response.to.have.status(405);
      });
    },
  }),
];

module.exports = folder('Negative', 'Missing/invalid token, invalid data, wrong types, non-existing IDs, method not allowed.', items);
