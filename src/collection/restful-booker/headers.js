// Common headers for the Restful Booker API.
const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };
const withToken = { ...JSON_HEADERS, Cookie: 'token={{token}}' };
// Basic auth with the demo credentials published in the API documentation (admin / password123).
const withBasicAuth = { ...JSON_HEADERS, Authorization: 'Basic YWRtaW46cGFzc3dvcmQxMjM=' };

module.exports = { JSON_HEADERS, withToken, withBasicAuth };
