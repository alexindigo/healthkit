var fs        = require('fs');
var healthkit = require('../');
var test      = require('tape');

var basicChecks = [
	// first check for lets-drain signal file
  {
    status: 404, // respond with 404 if file present
    file: 'test/fixtures/healthkit_test_file.exists'
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
    t.equal(code, 500, 'should return status code `500`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });
});

test('should return 404 if file exists', function(t)
{
  t.plan(2);

  fs.writeFileSync(basicChecks[0].file, '');

  healthkit(basicChecks, function(code, result)
  {
    t.equal(code, 404, 'should return status code `404`');
    t.equal(result.file[0].resource, basicChecks[0].file, 'should have file stats returned.');

    fs.unlinkSync(basicChecks[0].file);
  });
});
