// Assembles the Postman v2.1 collections in collections/ from the modules in src/collection.
const fs = require('fs');
const path = require('path');
const { event } = require('./collection/postman-item');

const OUT = path.resolve(__dirname, '../collections');
const SCHEMAS = path.resolve(__dirname, 'schemas');
const SCHEMA_URL = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';

function loadSchema(file) {
  return JSON.parse(fs.readFileSync(path.join(SCHEMAS, file), 'utf8'));
}

function schemaVariables() {
  const booking = loadSchema('booking.schema.json');
  const created = loadSchema('created-booking.schema.json');
  created.definitions.booking = { ...booking, $schema: undefined };
  const list = {
    bookingSchema: booking,
    createdBookingSchema: created,
    bookingIdsSchema: loadSchema('booking-ids.schema.json'),
    tokenSchema: loadSchema('token.schema.json'),
    aeProductsSchema: loadSchema('ae-products.schema.json'),
    aeBrandsSchema: loadSchema('ae-brands.schema.json'),
    aeMessageSchema: loadSchema('ae-message.schema.json'),
  };
  return Object.entries(list).map(([key, value]) => ({ key, value: JSON.stringify(value), type: 'string' }));
}

// Runs after every request in the collection.
function commonChecks() {
  /* global pm */
  pm.test('Response time is below ' + pm.environment.get('maxResponseTime') + ' ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(Number(pm.environment.get('maxResponseTime')));
  });
}

function collection(name, description, folders) {
  return {
    info: { name, description, schema: SCHEMA_URL },
    item: folders,
    event: [event('test', commonChecks)],
    variable: schemaVariables(),
  };
}

const COLLECTIONS = {
  'restful-booker': collection(
    'Restful Booker API',
    'Auth, booking CRUD chain, negative and contract tests for https://restful-booker.herokuapp.com',
    ['auth', 'booking-crud', 'negative', 'contract'].map((f) => require(`./collection/restful-booker/${f}`)),
  ),
  'automation-exercise': collection(
    'Automation Exercise API',
    'Catalogue and account lifecycle tests for the documented API list at https://automationexercise.com/api_list',
    ['catalogue', 'account'].map((f) => require(`./collection/automation-exercise/${f}`)),
  ),
  'data-driven': collection('Restful Booker - data-driven bookings', 'Run with -d data/bookings.csv', [
    require('./collection/restful-booker/data-driven'),
  ]),
};

function countRequests(items) {
  return items.reduce((sum, i) => sum + (i.item ? countRequests(i.item) : 1), 0);
}

for (const [file, content] of Object.entries(COLLECTIONS)) {
  fs.writeFileSync(path.join(OUT, `${file}.postman_collection.json`), JSON.stringify(content, null, 2) + '\n');
  console.log(`${file}: ${countRequests(content.item)} requests`);
}
