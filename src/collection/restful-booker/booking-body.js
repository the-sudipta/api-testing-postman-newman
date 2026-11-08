// Request bodies and the pre-request script that prepares fresh, realistic (fake) booking data.

const BOOKING_BODY = `{
  "firstname": "{{firstname}}",
  "lastname": "{{lastname}}",
  "totalprice": {{totalprice}},
  "depositpaid": {{depositpaid}},
  "bookingdates": { "checkin": "{{checkin}}", "checkout": "{{checkout}}" },
  "additionalneeds": "{{additionalneeds}}"
}`;

function prepareBooking() {
  const isoDate = function (daysAhead) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().slice(0, 10);
  };
  const stayStart = 30 + Math.floor(Math.random() * 60);
  pm.environment.set('firstname', pm.variables.replaceIn('{{$randomFirstName}}'));
  pm.environment.set('lastname', pm.variables.replaceIn('{{$randomLastName}}'));
  pm.environment.set('totalprice', String(100 + Math.floor(Math.random() * 400)));
  pm.environment.set('depositpaid', 'true');
  pm.environment.set('checkin', isoDate(stayStart));
  pm.environment.set('checkout', isoDate(stayStart + 3));
  pm.environment.set('additionalneeds', 'Breakfast');
}

function bodyWith(overrides) {
  const base = {
    firstname: 'Ayesha',
    lastname: 'Rahman',
    totalprice: 250,
    depositpaid: true,
    bookingdates: { checkin: '2027-03-10', checkout: '2027-03-13' },
    additionalneeds: 'Late checkout',
  };
  return { ...base, ...overrides };
}

module.exports = { BOOKING_BODY, prepareBooking, bodyWith };
