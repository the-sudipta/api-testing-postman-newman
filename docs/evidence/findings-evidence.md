# Evidence for findings

Captured 2026-11-08T14:16:19.737Z with `node scripts/capture-evidence.js`.

### F-01 — POST /auth with a wrong password

`POST https://restful-booker.herokuapp.com/auth`

```http
HTTP 200 OK
Content-Type: application/json; charset=utf-8

{"reason":"Bad credentials"}
```

### F-02 — POST /booking with valid data

`POST https://restful-booker.herokuapp.com/booking`

```http
HTTP 200 OK
Content-Type: application/json; charset=utf-8

{"bookingid":2829,"booking":{"firstname":"Ayesha","lastname":"Rahman","totalprice":250,"depositpaid":true,"bookingdates":{"checkin":"2027-03-10","checkout":"2027-03-13"},"additionalneeds":"Late checkout"}}
```

### F-03 — GET /ping

`GET https://restful-booker.herokuapp.com/ping`

```http
HTTP 201 Created
Content-Type: text/plain; charset=utf-8

Created
```

### F-04 — DELETE /booking/999999999 with a valid token

`DELETE https://restful-booker.herokuapp.com/booking/999999999`

```http
HTTP 405 Method Not Allowed
Content-Type: text/plain; charset=utf-8

Method Not Allowed
```

### F-05 — POST /booking without firstname

`POST https://restful-booker.herokuapp.com/booking`

```http
HTTP 500 Internal Server Error
Content-Type: text/plain; charset=utf-8

Internal Server Error
```

### F-06 — POST /booking with totalprice "abc"

`POST https://restful-booker.herokuapp.com/booking`

```http
HTTP 200 OK
Content-Type: application/json; charset=utf-8

{"bookingid":2837,"booking":{"firstname":"Ayesha","lastname":"Rahman","totalprice":null,"depositpaid":true,"bookingdates":{"checkin":"2027-03-10","checkout":"2027-03-13"},"additionalneeds":"Late checkout"}}
```

### F-07 — POST /booking with totalprice -50

`POST https://restful-booker.herokuapp.com/booking`

```http
HTTP 200 OK
Content-Type: application/json; charset=utf-8

{"bookingid":2842,"booking":{"firstname":"Ayesha","lastname":"Rahman","totalprice":-50,"depositpaid":true,"bookingdates":{"checkin":"2027-03-10","checkout":"2027-03-13"},"additionalneeds":"Late checkout"}}
```

### F-08 — POST /booking with checkout before checkin

`POST https://restful-booker.herokuapp.com/booking`

```http
HTTP 200 OK
Content-Type: application/json; charset=utf-8

{"bookingid":2845,"booking":{"firstname":"Ayesha","lastname":"Rahman","totalprice":250,"depositpaid":true,"bookingdates":{"checkin":"2027-02-10","checkout":"2027-02-01"},"additionalneeds":"Late checkout"}}
```

### F-09 — POST /booking with checkin "not-a-date"

`POST https://restful-booker.herokuapp.com/booking`

```http
HTTP 200 OK
Content-Type: application/json; charset=utf-8

{"bookingid":2860,"booking":{"firstname":"Ayesha","lastname":"Rahman","totalprice":250,"depositpaid":true,"bookingdates":{"checkin":"0NaN-aN-aN","checkout":"2027-02-01"},"additionalneeds":"Late checkout"}}
```

### F-10 — POST /booking with depositpaid "yes"

`POST https://restful-booker.herokuapp.com/booking`

```http
HTTP 200 OK
Content-Type: application/json; charset=utf-8

{"bookingid":2862,"booking":{"firstname":"Ayesha","lastname":"Rahman","totalprice":250,"depositpaid":true,"bookingdates":{"checkin":"2027-03-10","checkout":"2027-03-13"},"additionalneeds":"Late checkout"}}
```

### F-11 — POST /booking with Accept: text/plain

`POST https://restful-booker.herokuapp.com/booking`

```http
HTTP 418 I'm a teapot
Content-Type: text/plain; charset=utf-8

I'm a Teapot
```

### F-12 — PATCH /booking (collection URL)

`PATCH https://restful-booker.herokuapp.com/booking`

```http
HTTP 404 Not Found
Content-Type: text/plain; charset=utf-8

Not Found
```

### F-13 — POST /productsList (not supported)

`POST https://automationexercise.com/api/productsList`

```http
HTTP 200 OK
Content-Type: text/html; charset=utf-8

{"responseCode": 405, "message": "This request method is not supported."}
```

### F-14 — GET /productsList (Content-Type)

`GET https://automationexercise.com/api/productsList`

```http
HTTP 200 OK
Content-Type: text/html; charset=utf-8

{"responseCode": 200, "products": [{"id": 1, "name": "Blue Top", "price": "Rs. 500", "brand": "Polo", "category": {"usertype": {"usertype": "Women"}, "category": "Tops"}}, {"id": 2, "name": "Men Tshirt", "price": "Rs. 400", "brand": "H&M", "category": {"usertype": {"usertype": "Men"}, "category": "Tshirts"}}, {"id": 3, "name": "Sleeveless Dress", "price": "Rs. 1000", "brand": "Madame", "category": {"usertype": {"usertype": "Women"}, "category": "Dress"}}, {"id": 4, "name": "Stylish Dress", "price": "Rs. 1500", "brand": "Madame", "category": {"usertype": {"usertype": "Women"}, "category": "Dres … (5549 chars)
```

### F-15 — GET /brandsList

`GET https://automationexercise.com/api/brandsList`

```http
HTTP 200 OK
Content-Type: text/html; charset=utf-8

{"responseCode": 200, "brands": [{"id": 1, "brand": "Polo"}, {"id": 2, "brand": "H&M"}, {"id": 3, "brand": "Madame"}, {"id": 4, "brand": "Madame"}, {"id": 5, "brand": "Mast & Harbour"}, {"id": 6, "brand": "H&M"}, {"id": 7, "brand": "Madame"}, {"id": 8, "brand": "Polo"}, {"id": 11, "brand": "Babyhug"}, {"id": 12, "brand": "Babyhug"}, {"id": 13, "brand": "Allen Solly Junior"}, {"id": 14, "brand": "Kookie Kids"}, {"id": 15, "brand": "Babyhug"}, {"id": 16, "brand": "Babyhug"}, {"id": 18, "brand": "Kookie Kids"}, {"id": 19, "brand": "Allen Solly Junior"}, {"id": 20, "brand": "Kookie Kids"}, {"id":  … (1121 chars)
```
