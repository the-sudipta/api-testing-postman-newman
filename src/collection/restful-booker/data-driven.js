const { item, folder } = require('../postman-item');
const { JSON_HEADERS } = require('./headers');
const { BOOKING_BODY } = require('./booking-body');

// Runs once per row of data/bookings.csv; {{firstname}} etc. come from the data file.

const create = item({
  name: 'Create booking from data row',
  method: 'POST',
  url: '{{baseUrl}}/booking',
  headers: JSON_HEADERS,
  body: { raw: BOOKING_BODY },
  tests: function () {
    const booking = pm.response.json().booking;
    pm.test('Row ' + pm.info.iteration + ': status is 200', function () {
      pm.response.to.have.status(200);
    });
    pm.test('Row ' + pm.info.iteration + ': stored values equal the data row', function () {
      pm.expect(booking.firstname).to.eql(pm.iterationData.get('firstname'));
      pm.expect(booking.lastname).to.eql(pm.iterationData.get('lastname'));
      pm.expect(booking.totalprice).to.eql(Number(pm.iterationData.get('totalprice')));
      pm.expect(booking.depositpaid).to.eql(String(pm.iterationData.get('depositpaid')) === 'true');
      pm.expect(booking.bookingdates).to.eql({ checkin: pm.iterationData.get('checkin'), checkout: pm.iterationData.get('checkout') });
      pm.expect(booking.additionalneeds).to.eql(pm.iterationData.get('additionalneeds'));
    });
    pm.environment.set('rowBookingId', pm.response.json().bookingid);
  },
});

const read = item({
  name: 'Read booking back',
  url: '{{baseUrl}}/booking/{{rowBookingId}}',
  headers: JSON_HEADERS,
  tests: function () {
    pm.test('Row ' + pm.info.iteration + ': booking can be read back with the same name', function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json().firstname).to.eql(pm.iterationData.get('firstname'));
    });
  },
});

const token = item({
  name: 'Get token',
  method: 'POST',
  url: '{{baseUrl}}/auth',
  headers: JSON_HEADERS,
  body: { raw: { username: '{{username}}', password: '{{password}}' } },
  tests: function () {
    pm.environment.set('token', pm.response.json().token);
  },
});

const remove = item({
  name: 'Delete booking',
  method: 'DELETE',
  url: '{{baseUrl}}/booking/{{rowBookingId}}',
  headers: { Cookie: 'token={{token}}' },
  tests: function () {
    pm.test('Row ' + pm.info.iteration + ': booking deleted (201)', function () {
      pm.response.to.have.status(201);
    });
  },
});

module.exports = folder('Data-driven bookings', 'Create, read and delete one booking per CSV row.', [create, read, token, remove]);
