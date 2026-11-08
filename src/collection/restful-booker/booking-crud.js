const { item, folder } = require('../postman-item');
const { JSON_HEADERS, withToken, withBasicAuth } = require('./headers');
const { BOOKING_BODY, prepareBooking } = require('./booking-body');

const listBookings = item({
  name: 'List all booking IDs',
  url: '{{baseUrl}}/booking',
  headers: JSON_HEADERS,
  tests: function () {
    const body = pm.response.json();
    pm.test('Status is 200', function () {
      pm.response.to.have.status(200);
    });
    pm.test('Body is a non-empty array of booking IDs', function () {
      pm.expect(body).to.be.an('array').that.is.not.empty;
      pm.expect(body[0].bookingid).to.be.a('number');
    });
  },
});

const createBooking = item({
  name: 'Create booking',
  method: 'POST',
  url: '{{baseUrl}}/booking',
  headers: JSON_HEADERS,
  body: { raw: BOOKING_BODY },
  prerequest: prepareBooking,
  tests: function () {
    const body = pm.response.json();
    pm.test('Status is 200 (as documented)', function () {
      pm.response.to.have.status(200);
    });
    pm.test('Response matches the created-booking schema', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('createdBookingSchema')));
    });
    pm.test('Saved data echoes the request', function () {
      pm.expect(body.booking.firstname).to.eql(pm.environment.get('firstname'));
      pm.expect(body.booking.lastname).to.eql(pm.environment.get('lastname'));
      pm.expect(body.booking.totalprice).to.eql(Number(pm.environment.get('totalprice')));
      pm.expect(body.booking.bookingdates.checkin).to.eql(pm.environment.get('checkin'));
    });
    pm.environment.set('bookingId', body.bookingid);
  },
});

const getBooking = item({
  name: 'Get the created booking',
  url: '{{baseUrl}}/booking/{{bookingId}}',
  headers: JSON_HEADERS,
  tests: function () {
    const body = pm.response.json();
    pm.test('Status is 200', function () {
      pm.response.to.have.status(200);
    });
    pm.test('Booking matches the schema', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('bookingSchema')));
    });
    pm.test('Booking has the data that was created', function () {
      pm.expect(body.firstname).to.eql(pm.environment.get('firstname'));
      pm.expect(body.bookingdates.checkout).to.eql(pm.environment.get('checkout'));
      pm.expect(body.additionalneeds).to.eql('Breakfast');
    });
  },
});

const filterByName = item({
  name: 'Filter bookings by first and last name',
  url: '{{baseUrl}}/booking?firstname={{firstname}}&lastname={{lastname}}',
  headers: JSON_HEADERS,
  tests: function () {
    const ids = pm.response.json().map(function (b) {
      return b.bookingid;
    });
    pm.test('Status is 200', function () {
      pm.response.to.have.status(200);
    });
    pm.test('Result contains the created booking', function () {
      pm.expect(ids).to.include(Number(pm.environment.get('bookingId')));
    });
  },
});

const filterByDate = item({
  name: 'Filter bookings by check-in date',
  url: '{{baseUrl}}/booking?checkin={{checkin}}',
  headers: JSON_HEADERS,
  tests: function () {
    pm.test('Status is 200 and body is an array', function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json()).to.be.an('array');
    });
  },
});

const updateBooking = item({
  name: 'Update booking (PUT, token cookie)',
  method: 'PUT',
  url: '{{baseUrl}}/booking/{{bookingId}}',
  headers: withToken,
  body: { raw: BOOKING_BODY.replace('"{{additionalneeds}}"', '"Airport pickup"').replace('{{totalprice}}', '{{updatedPrice}}') },
  prerequest: function () {
    pm.environment.set('updatedPrice', '480');
  },
  tests: function () {
    const body = pm.response.json();
    pm.test('Status is 200', function () {
      pm.response.to.have.status(200);
    });
    pm.test('Changed fields are updated', function () {
      pm.expect(body.totalprice).to.eql(480);
      pm.expect(body.additionalneeds).to.eql('Airport pickup');
    });
  },
});

const verifyUpdate = item({
  name: 'Get booking after update',
  url: '{{baseUrl}}/booking/{{bookingId}}',
  headers: JSON_HEADERS,
  tests: function () {
    pm.test('Update was stored', function () {
      pm.expect(pm.response.json().totalprice).to.eql(480);
      pm.expect(pm.response.json().additionalneeds).to.eql('Airport pickup');
    });
  },
});

const partialUpdate = item({
  name: 'Partial update (PATCH firstname and price)',
  method: 'PATCH',
  url: '{{baseUrl}}/booking/{{bookingId}}',
  headers: withToken,
  body: { raw: { firstname: 'Farhana', totalprice: 333 } },
  tests: function () {
    const body = pm.response.json();
    pm.test('Status is 200', function () {
      pm.response.to.have.status(200);
    });
    pm.test('Only the sent fields change', function () {
      pm.expect(body.firstname).to.eql('Farhana');
      pm.expect(body.totalprice).to.eql(333);
      pm.expect(body.lastname).to.eql(pm.environment.get('lastname'));
      pm.expect(body.additionalneeds).to.eql('Airport pickup');
    });
  },
});

const deleteBooking = item({
  name: 'Delete booking',
  method: 'DELETE',
  url: '{{baseUrl}}/booking/{{bookingId}}',
  headers: { Cookie: 'token={{token}}' },
  tests: function () {
    pm.test('Status is 201 (as documented in /apidoc)', function () {
      pm.response.to.have.status(201);
    });
  },
});

const verifyDelete = item({
  name: 'Get deleted booking returns 404',
  url: '{{baseUrl}}/booking/{{bookingId}}',
  headers: JSON_HEADERS,
  tests: function () {
    pm.test('Status is 404 Not Found', function () {
      pm.response.to.have.status(404);
    });
  },
});

const createSecond = item({
  name: 'Create second booking for Basic auth checks',
  method: 'POST',
  url: '{{baseUrl}}/booking',
  headers: JSON_HEADERS,
  body: { raw: BOOKING_BODY },
  prerequest: prepareBooking,
  tests: function () {
    pm.test('Status is 200', function () {
      pm.response.to.have.status(200);
    });
    pm.environment.set('basicBookingId', pm.response.json().bookingid);
  },
});

const patchWithBasicAuth = item({
  name: 'Partial update with Basic auth header',
  method: 'PATCH',
  url: '{{baseUrl}}/booking/{{basicBookingId}}',
  headers: withBasicAuth,
  body: { raw: { additionalneeds: 'Extra pillow' } },
  tests: function () {
    pm.test('Status is 200 and field updated', function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json().additionalneeds).to.eql('Extra pillow');
    });
  },
});

const deleteWithBasicAuth = item({
  name: 'Delete with Basic auth header',
  method: 'DELETE',
  url: '{{baseUrl}}/booking/{{basicBookingId}}',
  headers: { Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM=' },
  tests: function () {
    pm.test('Status is 201 (as documented)', function () {
      pm.response.to.have.status(201);
    });
  },
});

module.exports = folder('Booking CRUD', 'Full chain: create -> get -> filter -> update -> partial update -> delete -> verify 404.', [
  listBookings,
  createBooking,
  getBooking,
  filterByName,
  filterByDate,
  updateBooking,
  verifyUpdate,
  partialUpdate,
  deleteBooking,
  verifyDelete,
  createSecond,
  patchWithBasicAuth,
  deleteWithBasicAuth,
]);
