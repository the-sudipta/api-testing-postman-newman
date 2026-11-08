# API Findings

Real defects and inconsistencies found while testing. Each one was reproduced several times; the raw request
and response for every finding are in [evidence/findings-evidence.md](evidence/findings-evidence.md)
(re-create them with `npm run evidence`). In the collections, the matching check is named **[F-xx] Known issue**
and asserts today's behaviour — when the API is fixed, that check fails and tells me to retest and close it.

Severity scale: **Major** = wrong data can be stored or a client cannot rely on the response; **Minor** =
wrong status code or contract detail with a workaround; **Trivial** = cosmetic or naming.

## Restful Booker API — https://restful-booker.herokuapp.com

| ID | Finding | Request | Expected | Actual | Severity |
|---|---|---|---|---|---|
| F-01 | Wrong credentials return 200 | `POST /auth` with a wrong password or `{}` | 401 Unauthorized | 200 OK with `{"reason":"Bad credentials"}` | Minor |
| F-02 | Create returns 200, not 201 | `POST /booking` (valid) | 201 Created | 200 OK (matches /apidoc, but not REST convention) | Trivial |
| F-03 | Health check returns 201 | `GET /ping` | 200 OK | 201 Created (matches /apidoc) | Trivial |
| F-04 | Deleting a missing booking returns 405 | `DELETE /booking/999999999` with a valid token | 404 Not Found | 405 Method Not Allowed. A successful delete returns 201 Created (convention: 200/204) | Minor |
| F-05 | Missing required field crashes the server | `POST /booking` without `firstname` | 400 with a field message | 500 Internal Server Error | Major |
| F-06 | Text price is stored as null | `POST /booking` with `"totalprice": "abc"` | 400 | 200, booking saved with `totalprice: null` | Major |
| F-07 | Negative price accepted | `POST /booking` with `"totalprice": -50` | 400 | 200, booking saved with -50 | Major |
| F-08 | Check-out before check-in accepted | `POST /booking` with checkin 2027-02-10, checkout 2027-02-01 | 400 | 200, booking saved | Major |
| F-09 | Invalid date stored as garbage | `POST /booking` with `"checkin": "not-a-date"` | 400 | 200, booking saved with `checkin: "0NaN-aN-aN"` | Major |
| F-10 | Boolean field coerces text | `POST /booking` with `"depositpaid": "yes"` | 400 (type error) | 200, stored as `true` | Minor |
| F-11 | Unsupported Accept header returns 418 | `POST /booking` with `Accept: text/plain` | 406 Not Acceptable | 418 I'm a Teapot | Minor |
| F-12 | Wrong method on a collection returns 404 | `PATCH /booking` | 405 Method Not Allowed | 404 Not Found | Minor |

## Automation Exercise API — https://automationexercise.com/api_list

| ID | Finding | Request | Expected | Actual | Severity |
|---|---|---|---|---|---|
| F-13 | HTTP status is always 200 | `POST /api/productsList`, `PUT /api/brandsList`, invalid login … | HTTP status equals the error (400/404/405) | HTTP 200; the real code is only inside the body (`"responseCode": 405`) | Major |
| F-14 | JSON served as HTML | Any endpoint, e.g. `GET /api/productsList` | `Content-Type: application/json` | `Content-Type: text/html; charset=utf-8` | Minor |
| F-15 | Duplicate brand names | `GET /api/brandsList` | One ID per brand | "Polo", "H&M", "Madame", "Biba" … appear under several IDs (e.g. Polo × 6) | Trivial |
| F-16 | Request and response field names differ | `POST /api/createAccount` vs `GET /api/getUserDetailByEmail` | Same names both ways | Request uses `firstname`, `lastname`, `birth_date`; response uses `first_name`, `last_name`, `birth_day`; `mobile_number` is not returned | Trivial |

## Environment notes (not defects)

- Restful Booker is a shared public demo whose data is reset regularly. Once during development a booking
  created in the data-driven run could not be read back a moment later; a re-run passed. For this reason CI
  re-runs a failed collection once (and logs it), while local runs never retry.
- `PUT`/`PATCH`/`DELETE` without a token return 403 Forbidden. Some teams expect 401 for a missing token;
  I treat 403 as acceptable because the API documents it.

## Impact summary

The most important problems are on input validation (F-05 to F-10): the API stores bookings with null,
negative or impossible values, so every client must validate on its own. On Automation Exercise, F-13 means a
client that only checks the HTTP status will treat every error as success.
