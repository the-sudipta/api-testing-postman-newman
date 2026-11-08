const { item, folder } = require('../postman-item');

function methodNotSupported(name, method, path) {
  return item({
    name,
    method,
    url: `{{aeBaseUrl}}/${path}`,
    tests: function () {
      const body = pm.response.json();
      pm.test('Body responseCode is 405 with the documented message', function () {
        pm.expect(body.responseCode).to.eql(405);
        pm.expect(body.message).to.eql('This request method is not supported.');
      });
      pm.test('[F-13] Known issue: HTTP status is 200 although the body says 405', function () {
        pm.response.to.have.status(200);
      });
    },
  });
}

const productsList = item({
  name: 'API 1 - Get all products',
  url: '{{aeBaseUrl}}/productsList',
  tests: function () {
    pm.test('HTTP 200 and responseCode 200', function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json().responseCode).to.eql(200);
    });
    pm.test('Product list matches the schema', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('aeProductsSchema')));
    });
    pm.test('Product IDs are unique', function () {
      const ids = pm.response.json().products.map(function (p) {
        return p.id;
      });
      pm.expect(new Set(ids).size).to.eql(ids.length);
    });
    pm.test('[F-14] Known issue: JSON is served as text/html', function () {
      pm.expect(pm.response.headers.get('Content-Type')).to.include('text/html');
    });
  },
});

const brandsList = item({
  name: 'API 3 - Get all brands',
  url: '{{aeBaseUrl}}/brandsList',
  tests: function () {
    const brands = pm.response.json().brands;
    pm.test('Brand list matches the schema', function () {
      pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('aeBrandsSchema')));
    });
    pm.test('[F-15] Known issue: the same brand name appears under several IDs', function () {
      const names = brands.map(function (b) {
        return b.brand;
      });
      pm.expect(new Set(names).size).to.be.below(names.length);
    });
  },
});

function search(name, form, tests) {
  return item({ name, method: 'POST', url: '{{aeBaseUrl}}/searchProduct', body: form ? { form } : undefined, tests });
}

const searchTop = search('API 5 - Search product "top"', { search_product: 'top' }, function () {
  const products = pm.response.json().products;
  pm.test('responseCode 200 and at least one product', function () {
    pm.expect(pm.response.json().responseCode).to.eql(200);
    pm.expect(products).to.be.an('array').that.is.not.empty;
  });
  pm.test('Every result relates to "top" (name or category)', function () {
    products.forEach(function (p) {
      const text = (p.name + ' ' + p.category.category).toLowerCase();
      pm.expect(text).to.include('top');
    });
  });
});

const searchNoMatch = search('Search product with no match', { search_product: 'zzzqqq' }, function () {
  pm.test('responseCode 200 and an empty list', function () {
    pm.expect(pm.response.json().responseCode).to.eql(200);
    pm.expect(pm.response.json().products).to.eql([]);
  });
});

const searchMissing = search('API 6 - Search product without parameter', null, function () {
  pm.test('Body responseCode 400 with a clear message', function () {
    pm.expect(pm.response.json().responseCode).to.eql(400);
    pm.expect(pm.response.json().message).to.include('search_product parameter is missing');
  });
  pm.test('Message response matches the schema', function () {
    pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('aeMessageSchema')));
  });
});

module.exports = folder('Catalogue', 'Products, brands and search (APIs 1-6).', [
  productsList,
  methodNotSupported('API 2 - POST to productsList is not supported', 'POST', 'productsList'),
  brandsList,
  methodNotSupported('API 4 - PUT to brandsList is not supported', 'PUT', 'brandsList'),
  searchTop,
  searchNoMatch,
  searchMissing,
]);
