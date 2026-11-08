// Runs the collections with Newman and writes CLI, HTML (htmlextra) and JUnit reports to reports/.
// Usage: node scripts/run-newman.js [restful-booker|automation-exercise|data-driven]
// NEWMAN_ENV=ci selects environments/ci.postman_environment.json (default: local).
// In CI only, a collection that fails is run once more to rule out a network blip; both runs are logged.
const path = require('path');
const newman = require('newman');

const ROOT = path.resolve(__dirname, '..');
const ENV = process.env.NEWMAN_ENV || 'local';
const RETRIES = process.env.CI ? 1 : 0;
const RUNS = {
  'restful-booker': {},
  'automation-exercise': {},
  'data-driven': { iterationData: path.join(ROOT, 'data/bookings.csv') },
};

function options(name) {
  return {
    collection: path.join(ROOT, `collections/${name}.postman_collection.json`),
    environment: path.join(ROOT, `environments/${ENV}.postman_environment.json`),
    reporters: ['cli', 'htmlextra', 'junit'],
    reporter: {
      htmlextra: { export: path.join(ROOT, `reports/${name}.html`), title: `${name} - API test report`, browserTitle: name },
      junit: { export: path.join(ROOT, `reports/${name}.xml`) },
    },
    delayRequest: 100,
    timeoutRequest: 30000,
    ...RUNS[name],
  };
}

function runOnce(name) {
  return new Promise((resolve, reject) => {
    newman.run(options(name), (error, summary) => (error ? reject(error) : resolve(summary)));
  });
}

function failedCount(summary) {
  return summary.run.failures.length;
}

async function runWithRetry(name) {
  let summary = await runOnce(name);
  for (let attempt = 1; attempt <= RETRIES && failedCount(summary) > 0; attempt += 1) {
    console.log(`${name}: ${failedCount(summary)} failure(s), retry ${attempt} of ${RETRIES} (CI only)`);
    summary = await runOnce(name);
  }
  return summary;
}

async function main() {
  const selected = process.argv[2] ? [process.argv[2]] : Object.keys(RUNS);
  let failures = 0;
  for (const name of selected) {
    const summary = await runWithRetry(name);
    const { requests, assertions } = summary.run.stats;
    failures += failedCount(summary);
    console.log(`${name}: requests=${requests.total} assertions=${assertions.total} failed=${assertions.failed}`);
  }
  process.exitCode = failures ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
