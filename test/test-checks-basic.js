var healthkit = require('../');
var test      = require('tape');

var expectedCode = 500;

var basicChecks = [
	// first check for lets-drain signal file
  {
    status: 404, // respond with 404 if file present
    file: '/etc/consul/test_file.exists'
  },
  // second check for underlying endpoint
  // proceeded here if previous check failed
  {
    status: 200, // respond with 200 if endpoint responds with successful code (200-299)
    http: 'http://simple.url/endpoint'
  },
  // third (empty, default) check
  // proceeded here if previous check failed
  {
    status: 500 // everything failed, fail the health check
  }
];

// --- Test

test('running basic check', function(t)
{
  t.plan(2);

  healthkit(basicChecks, function(code, result)
  {
    t.equal(code, expectedCode, 'should return status code `' + expectedCode + '`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });
});
