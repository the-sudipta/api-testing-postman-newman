# API Test Cases

Generated from the collections (`npm run build:docs`). Every request also checks the response time
(collection-level test). Checks starting with **[F-xx]** document a known issue — see [findings.md](findings.md).

Total: **63 requests**.

## Restful Booker API (41 requests)

| ID | Folder | Request | Method | Endpoint | Checks |
|---|---|---|---|---|---|
| RB-01 | Auth | Health check - GET /ping returns 201 | GET | `/ping` | Status is 201 Created (as documented in /apidoc)<br>Body says Created |
| RB-02 | Auth | Create token with valid credentials | POST | `/auth` | Status is 200<br>Token is a non-empty string<br>Token response matches the schema |
| RB-03 | Auth | Create token with wrong password | POST | `/auth` | No token is returned<br>Reason is "Bad credentials"<br>[F-01] Known issue: status is 200 instead of 401 |
| RB-04 | Auth | Create token with empty body | POST | `/auth` | No token is returned<br>[F-01] Known issue: status is 200 instead of 400/401 |
| RB-05 | Booking CRUD | List all booking IDs | GET | `/booking` | Status is 200<br>Body is a non-empty array of booking IDs |
| RB-06 | Booking CRUD | Create booking | POST | `/booking` | Status is 200 (as documented)<br>Response matches the created-booking schema<br>Saved data echoes the request |
| RB-07 | Booking CRUD | Get the created booking | GET | `/booking/{{bookingId}}` | Status is 200<br>Booking matches the schema<br>Booking has the data that was created |
| RB-08 | Booking CRUD | Filter bookings by first and last name | GET | `/booking?firstname={{firstname}}&lastname={{lastname}}` | Status is 200<br>Result contains the created booking |
| RB-09 | Booking CRUD | Filter bookings by check-in date | GET | `/booking?checkin={{checkin}}` | Status is 200 and body is an array |
| RB-10 | Booking CRUD | Update booking (PUT, token cookie) | PUT | `/booking/{{bookingId}}` | Status is 200<br>Changed fields are updated |
| RB-11 | Booking CRUD | Get booking after update | GET | `/booking/{{bookingId}}` | Update was stored |
| RB-12 | Booking CRUD | Partial update (PATCH firstname and price) | PATCH | `/booking/{{bookingId}}` | Status is 200<br>Only the sent fields change |
| RB-13 | Booking CRUD | Delete booking | DELETE | `/booking/{{bookingId}}` | Status is 201 (as documented in /apidoc) |
| RB-14 | Booking CRUD | Get deleted booking returns 404 | GET | `/booking/{{bookingId}}` | Status is 404 Not Found |
| RB-15 | Booking CRUD | Create second booking for Basic auth checks | POST | `/booking` | Status is 200 |
| RB-16 | Booking CRUD | Partial update with Basic auth header | PATCH | `/booking/{{basicBookingId}}` | Status is 200 and field updated |
| RB-17 | Booking CRUD | Delete with Basic auth header | DELETE | `/booking/{{basicBookingId}}` | Status is 201 (as documented) |
| RB-18 | Negative | Setup - create a booking for negative checks | POST | `/booking` | Setup booking created |
| RB-19 | Negative | Update without token | PUT | `/booking/{{negativeBookingId}}` | Status is 403 Forbidden<br>Body is "Forbidden" |
| RB-20 | Negative | Update with invalid token | PUT | `/booking/{{negativeBookingId}}` | Status is 403 Forbidden<br>Body is "Forbidden" |
| RB-21 | Negative | Partial update without token | PATCH | `/booking/{{negativeBookingId}}` | Status is 403 Forbidden<br>Body is "Forbidden" |
| RB-22 | Negative | Delete without token | DELETE | `/booking/{{negativeBookingId}}` | Status is 403 Forbidden<br>Body is "Forbidden" |
| RB-23 | Negative | Get non-existing booking ID | GET | `/booking/999999999` | Status is 404 Not Found |
| RB-24 | Negative | Get booking with non-numeric ID | GET | `/booking/abc` | Status is 404 Not Found |
| RB-25 | Negative | Create booking without firstname | POST | `/booking` | [F-05] Known issue: missing required field gives 500 instead of 400 |
| RB-26 | Negative | Create booking with totalprice as text | POST | `/booking` | [F-06] Known issue: accepted with 200 and totalprice stored as null |
| RB-27 | Negative | Create booking with negative totalprice | POST | `/booking` | [F-07] Known issue: negative price is accepted |
| RB-28 | Negative | Create booking with checkout before checkin | POST | `/booking` | [F-08] Known issue: reversed dates are accepted |
| RB-29 | Negative | Create booking with invalid date text | POST | `/booking` | [F-09] Known issue: invalid date stored as "0NaN-aN-aN" |
| RB-30 | Negative | Create booking with depositpaid as text | POST | `/booking` | [F-10] Known issue: "yes" is silently converted to true |
| RB-31 | Negative | Create booking with malformed JSON | POST | `/booking` | Status is 400 Bad Request |
| RB-32 | Negative | Create booking asking for text/plain | POST | `/booking` | [F-11] Known issue: unsupported Accept returns 418 I'm a Teapot instead of 406 |
| RB-33 | Negative | PATCH on the booking collection (method not allowed) | PATCH | `/booking` | [F-12] Known issue: returns 404 instead of 405 Method Not Allowed |
| RB-34 | Negative | Teardown - delete the setup booking | DELETE | `/booking/{{negativeBookingId}}` | Status is 201 |
| RB-35 | Negative | Delete the same booking again | DELETE | `/booking/{{negativeBookingId}}` | [F-04] Known issue: deleting a missing booking returns 405 instead of 404 |
| RB-36 | Contract | Setup - create a booking for contract checks | POST | `/booking` | POST /booking response follows the created-booking contract |
| RB-37 | Contract | GET /booking/{id} follows the booking contract | GET | `/booking/{{contractBookingId}}` | Body matches the strict booking schema (no extra fields)<br>Dates use the YYYY-MM-DD format |
| RB-38 | Contract | GET /booking follows the ID list contract | GET | `/booking` | Body matches the booking ID list schema |
| RB-39 | Contract | GET /booking/{id} returns JSON headers | GET | `/booking/{{contractBookingId}}` | Content-Type is application/json; charset=utf-8<br>Response is not cached by intermediaries without control (has ETag) |
| RB-40 | Contract | POST /auth follows the token contract | POST | `/auth` | Body matches the token schema |
| RB-41 | Contract | Teardown - delete the contract booking | DELETE | `/booking/{{contractBookingId}}` | Status is 201 |

## Automation Exercise API (18 requests)

| ID | Folder | Request | Method | Endpoint | Checks |
|---|---|---|---|---|---|
| AE-01 | Catalogue | API 1 - Get all products | GET | `/productsList` | HTTP 200 and responseCode 200<br>Product list matches the schema<br>Product IDs are unique<br>[F-14] Known issue: JSON is served as text/html |
| AE-02 | Catalogue | API 2 - POST to productsList is not supported | POST | `/productsList` | Body responseCode is 405 with the documented message<br>[F-13] Known issue: HTTP status is 200 although the body says 405 |
| AE-03 | Catalogue | API 3 - Get all brands | GET | `/brandsList` | Brand list matches the schema<br>[F-15] Known issue: the same brand name appears under several IDs |
| AE-04 | Catalogue | API 4 - PUT to brandsList is not supported | PUT | `/brandsList` | Body responseCode is 405 with the documented message<br>[F-13] Known issue: HTTP status is 200 although the body says 405 |
| AE-05 | Catalogue | API 5 - Search product "top" | POST | `/searchProduct` | responseCode 200 and at least one product<br>Every result relates to "top" (name or category) |
| AE-06 | Catalogue | Search product with no match | POST | `/searchProduct` | responseCode 200 and an empty list |
| AE-07 | Catalogue | API 6 - Search product without parameter | POST | `/searchProduct` | Body responseCode 400 with a clear message<br>Message response matches the schema |
| AE-08 | Account lifecycle | API 11 - Create account | POST | `/createAccount` | Body responseCode is 201<br>Message is "User created!"<br>Message response matches the schema |
| AE-09 | Account lifecycle | Create account with an existing email | POST | `/createAccount` | Body responseCode is 400<br>Message is "Email already exists!"<br>Message response matches the schema |
| AE-10 | Account lifecycle | API 7 - Verify login with valid details | POST | `/verifyLogin` | Body responseCode is 200<br>Message is "User exists!"<br>Message response matches the schema |
| AE-11 | Account lifecycle | API 8 - Verify login without email | POST | `/verifyLogin` | Body responseCode is 400<br>Message is "Bad request, email or password parameter is missing in POST request."<br>Message response matches the schema |
| AE-12 | Account lifecycle | API 9 - DELETE to verifyLogin is not supported | DELETE | `/verifyLogin` | Body responseCode is 405<br>Message is "This request method is not supported."<br>Message response matches the schema |
| AE-13 | Account lifecycle | API 10 - Verify login with invalid details | POST | `/verifyLogin` | Body responseCode is 404<br>Message is "User not found!"<br>Message response matches the schema |
| AE-14 | Account lifecycle | API 13 - Update account | PUT | `/updateAccount` | Body responseCode is 200<br>Message is "User updated!"<br>Message response matches the schema |
| AE-15 | Account lifecycle | API 14 - Get user detail by email | GET | `/getUserDetailByEmail?email={{aeEmail}}` | responseCode 200 and the updated city<br>[F-16] Known issue: response uses first_name/birth_day while requests use firstname/birth_date |
| AE-16 | Account lifecycle | API 12 - Delete account | DELETE | `/deleteAccount` | Body responseCode is 200<br>Message is "Account deleted!"<br>Message response matches the schema |
| AE-17 | Account lifecycle | Delete the same account again | DELETE | `/deleteAccount` | Body responseCode is 404<br>Message is "Account not found!"<br>Message response matches the schema |
| AE-18 | Account lifecycle | Get user detail for unknown email | GET | `/getUserDetailByEmail?email=nobody.qa.portfolio@example.com` | Body responseCode is 404<br>Message is "Account not found with this email, try another email!"<br>Message response matches the schema |

## Restful Booker - data-driven bookings (4 requests)

| ID | Folder | Request | Method | Endpoint | Checks |
|---|---|---|---|---|---|
| DD-01 | Data-driven bookings | Create booking from data row | POST | `/booking` | Row <br>Row  |
| DD-02 | Data-driven bookings | Read booking back | GET | `/booking/{{rowBookingId}}` | Row  |
| DD-03 | Data-driven bookings | Get token | POST | `/auth` |  |
| DD-04 | Data-driven bookings | Delete booking | DELETE | `/booking/{{rowBookingId}}` | Row  |
