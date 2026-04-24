require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const BASE_URL = 'https://fixjson-api.vercel.app';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("❌ Error: process.env.API_KEY is not defined.");
  console.error("Please add API_KEY to your .env.local file or pass it directly in your terminal.");
  process.exit(1);
}

let totalTests = 0;
let totalFailures = 0;

const assert = (condition, message) => {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
};

const validateSuccessStructure = (data) => {
  assert(typeof data === 'object' && data !== null, "response must be a JSON object");
  assert(typeof data.success === 'boolean', "success must be a boolean");
  assert(
    (typeof data.repaired_json === 'object' && data.repaired_json !== null) || data.repaired_json === null,
    "repaired_json must be an object or null"
  );
  assert(typeof data.normalized_json === 'string' || data.normalized_json === null, "normalized_json must be a string or null");
  assert(Array.isArray(data.errors), "errors must be an array");
  assert(Array.isArray(data.changes), "changes must be an array");
  assert(typeof data.plan === 'string', "plan must be a string");
  assert(typeof data.remaining_requests === 'number', "remaining_requests must be a number");
};

const validateErrorStructure = (data) => {
  assert(typeof data === 'object' && data !== null, "error response must be a JSON object");
  assert(typeof data.error === 'string', "error must be a string");
  if (data.plan !== undefined) {
    assert(typeof data.plan === 'string', "plan must be a string if present");
  }
};

async function runTest(testName, { method, path, headers = {}, body, expectedStatus, assertFn }) {
  console.log(`\n--- Test: ${testName} ---`);
  totalTests++;

  const startTime = Date.now();

  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${path}`,
      headers,
      data: body,
      validateStatus: () => true
    });

    const latency = Date.now() - startTime;
    const status = response.status;
    const data = response.data;
    const contentType = response.headers['content-type'];

    assert(
      contentType && contentType.toLowerCase().includes('application/json'),
      "Response Content-Type must include application/json"
    );

    console.log(`Expected Status: ${expectedStatus} | Actual Status: ${status} | Latency: ${latency}ms`);

    assert(status === expectedStatus, `Expected status ${expectedStatus} but got ${status}`);

    if (expectedStatus >= 400 && expectedStatus <= 500) {
      validateErrorStructure(data);
    }

    if (assertFn) {
      await assertFn(data);
    }

    console.log(`✅ PASS (${latency}ms)`);
    return data;
  }
  catch (error) {
    if (error.response) {
      console.error(`❌ FAIL: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    else {
      console.error(`❌ FAIL: ${error.message}`);
    }
    totalFailures++;
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Test Suite...');

  // 1. Health check
  await runTest('Health Check', {
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200,
    assertFn: (data) => assert(data.status === 'ok', "Expected status 'ok'")
  });

  // 2. Valid malformed JSON
  await runTest('Valid Malformed JSON', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: { json: "{ name: 'John', age: 30, }" },
    expectedStatus: 200,
    assertFn: (data) => {
      validateSuccessStructure(data);
      assert(data.success === true, "Expected success to be true");
      assert(data.repaired_json && data.repaired_json.name === 'John', "Expected repaired_json to contain valid data");
    }
  });

  // 3. Valid JSON
  await runTest('Valid JSON (Already correct)', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: { json: '{"name": "John", "age": 30}' },
    expectedStatus: 200,
    assertFn: (data) => {
      validateSuccessStructure(data);
      assert(data.success === true, "Expected success to be true");
    }
  });

  // 4. Completely broken JSON
  await runTest('Completely Broken JSON (Unrepairable)', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: { json: '[1, 2] { "a": 3 }' },
    expectedStatus: 200,
    assertFn: (data) => {
      validateSuccessStructure(data);
      assert(data.success === false, "Expected success to be false");
      assert(data.repaired_json === null, "Expected repaired_json to be null");
      assert(Array.isArray(data.errors) && data.errors.length > 0, "Expected errors array");
    }
  });

  // 5. Escaped characters edge case
  await runTest('Escaped Characters in JSON', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: { json: '{ name: "John \\"Doe\\"" }' },
    expectedStatus: 200,
    assertFn: (data) => {
      validateSuccessStructure(data);
      assert(data.success === true, "Expected success to be true");
      assert(data.repaired_json && data.repaired_json.name === 'John "Doe"', "Expected properly escaped data");
    }
  });

  // 6. Missing API key
  await runTest('Missing API Key', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json' },
    body: { json: "{}" },
    expectedStatus: 401,
    assertFn: (data) => assert(data.error !== undefined, "Expected an error message")
  });

  // 7. Invalid API key
  await runTest('Invalid API Key', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'invalid_key_123' },
    body: { json: "{}" },
    expectedStatus: 401,
    assertFn: (data) => assert(data.error !== undefined, "Expected an error message")
  });

  // 8. Payload too large
  const massiveString = "x".repeat(10001);
  await runTest('Payload Too Large', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: { json: massiveString },
    expectedStatus: 400,
    assertFn: (data) => assert(data.error !== undefined, "Expected an error message")
  });

  // 9. Empty payload
  await runTest('Empty Payload', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: {},
    expectedStatus: 400,
    assertFn: (data) => assert(data.error !== undefined, "Expected an error message")
  });

  // 10. Non-string JSON field
  await runTest('Non-string JSON Field', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: { json: { name: "I am an object, not a string" } },
    expectedStatus: 400,
    assertFn: (data) => assert(data.error !== undefined, "Expected an error message")
  });

  // 11. Rate limit decrement check
  let initialRemaining = null;

  await runTest('Rate Limit Check - Step 1', {
    method: 'POST',
    path: '/api/v1/fixjson',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: { json: "{}" },
    expectedStatus: 200,
    assertFn: (data) => {
      validateSuccessStructure(data);
      initialRemaining = data.remaining_requests;
    }
  });

  if (typeof initialRemaining === 'number') {
    await runTest('Rate Limit Check - Step 2', {
      method: 'POST',
      path: '/api/v1/fixjson',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: { json: "{}" },
      expectedStatus: 200,
      assertFn: (data) => {
        validateSuccessStructure(data);
        assert(
          data.remaining_requests === initialRemaining - 1,
          `Expected remaining requests to be ${initialRemaining - 1}, but got ${data.remaining_requests}`
        );
      }
    });
  }

  console.log('\n=======================================');
  console.log(`🏁 Test Suite Finished`);
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalTests - totalFailures}`);
  console.log(`❌ Failed: ${totalFailures}`);
  console.log('=======================================');

  process.exit(totalFailures > 0 ? 1 : 0);
}

runAllTests();