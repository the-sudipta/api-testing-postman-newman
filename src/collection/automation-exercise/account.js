const { item, folder } = require('../postman-item');

// Fake account data; the email is unique per run and the account is deleted at the end of the chain.
const ACCOUNT_FORM = {
  name: 'Tanvir',
  email: '{{aeEmail}}',
  password: '{{aePassword}}',
  title: 'Mr',
  birth_date: '10',
  birth_month: 'May',
  birth_year: '1998',
  firstname: 'Tanvir',
  lastname: 'Ahmed',
  company: 'QA Practice',
  address1: 'House 12, Road 5',
  address2: 'Dhanmondi',
  country: 'India',
  zipcode: '1207',
  state: 'Dhaka',
  city: 'Dhaka',
  mobile_number: '01712345678',
};

const LOGIN_FORM = { email: '{{aeEmail}}', password: '{{aePassword}}' };

// Builds a test script (as text) that checks the body responseCode and message.
function expectMessage(code, text) {
  return `
const body = pm.response.json();
pm.test('Body responseCode is ${code}', function () {
  pm.expect(body.responseCode).to.eql(${code});
});
pm.test('Message is "${text}"', function () {
  pm.expect(body.message).to.eql(${JSON.stringify(text)});
});
pm.test('Message response matches the schema', function () {
  pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('aeMessageSchema')));
});`;
}

const call = (name, method, path, form, code, text, extra = {}) =>
  item({ name, method, url: `{{aeBaseUrl}}/${path}`, body: form ? { form } : undefined, tests: expectMessage(code, text), ...extra });

const createAccount = call('API 11 - Create account', 'POST', 'createAccount', ACCOUNT_FORM, 201, 'User created!', {
  prerequest: function () {
    pm.environment.set('aeEmail', 'qa.portfolio.' + Date.now() + '@example.com');
    pm.environment.set('aePassword', 'Test@' + Math.floor(1000 + Math.random() * 9000));
  },
});

const userDetails = item({
  name: 'API 14 - Get user detail by email',
  url: '{{aeBaseUrl}}/getUserDetailByEmail?email={{aeEmail}}',
  tests: function () {
    const user = pm.response.json().user;
    pm.test('responseCode 200 and the updated city', function () {
      pm.expect(pm.response.json().responseCode).to.eql(200);
      pm.expect(user.email).to.eql(pm.environment.get('aeEmail'));
      pm.expect(user.city).to.eql('Chattogram');
    });
    pm.test('[F-16] Known issue: response uses first_name/birth_day while requests use firstname/birth_date', function () {
      pm.expect(user).to.have.property('first_name');
      pm.expect(user).to.not.have.property('firstname');
      pm.expect(user).to.have.property('birth_day');
    });
  },
});

module.exports = folder('Account lifecycle', 'Create -> duplicate -> login -> update -> read -> delete (APIs 7-14).', [
  createAccount,
  call('Create account with an existing email', 'POST', 'createAccount', ACCOUNT_FORM, 400, 'Email already exists!'),
  call('API 7 - Verify login with valid details', 'POST', 'verifyLogin', LOGIN_FORM, 200, 'User exists!'),
  call(
    'API 8 - Verify login without email',
    'POST',
    'verifyLogin',
    { password: '{{aePassword}}' },
    400,
    'Bad request, email or password parameter is missing in POST request.',
  ),
  call('API 9 - DELETE to verifyLogin is not supported', 'DELETE', 'verifyLogin', null, 405, 'This request method is not supported.'),
  call(
    'API 10 - Verify login with invalid details',
    'POST',
    'verifyLogin',
    { email: 'nobody.qa.portfolio@example.com', password: 'Wrong@123' },
    404,
    'User not found!',
  ),
  call('API 13 - Update account', 'PUT', 'updateAccount', { ...ACCOUNT_FORM, city: 'Chattogram' }, 200, 'User updated!'),
  userDetails,
  call('API 12 - Delete account', 'DELETE', 'deleteAccount', LOGIN_FORM, 200, 'Account deleted!'),
  call('Delete the same account again', 'DELETE', 'deleteAccount', LOGIN_FORM, 404, 'Account not found!'),
  call(
    'Get user detail for unknown email',
    'GET',
    'getUserDetailByEmail?email=nobody.qa.portfolio@example.com',
    null,
    404,
    'Account not found with this email, try another email!',
  ),
]);
