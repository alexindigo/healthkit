var healthkit = require('../');
var test      = require('tape');

var expectedCode = 202;
var expectedUrl  = 'http://another-one-of-peer.dependencies';

var advancedChecks = [
  // first check for different components of the site
  {
    status: 200, // respond with 200, if all of the resources return successful code
    // accessed in parallel
    http: 'https://example.com/health',
    file: '/var/www/index.html',
    memcache: '127.0.0.1:11211'
  },
  // second check to see all the apps are responding
  // proceeded here if previous check failed
  {
    status: 200, // respond with 200 if all the endpoints had replied successfully
    timeout: 250, // wait for 8.25 seconds before failing
    // accessed in parallel
    http: [
      'http://127.0.0.1:100',
      'http://127.0.0.1:201',
      'http://127.0.0.1:302',
      'http://127.0.0.1:403'
    ]
  },
  // third check to see if at least one of the sub checks responded successfully
  // all the sub checks ran in parallel
  [
    {
      status: 201,
      http: 'http://one-of-peer.dependencies'
    },
    {
      status: 202,
      http: 'http://another-one-of-peer.dependencies'
    },
    {
      status: 203,
      http: 'http://third-of-peer.dependencies'
    }
  ],
  // fourth (empty) check
  {
    status: 501 // everything else failed
  }
];

// --- Test

test('running advanced check', function(t)
{
  t.plan(2);

  healthkit(advancedChecks, {defaults: {timeout: 1200, status: 208}, adapters: {http: onlyOne}}, function(code, result)
  {
    t.equal(code, expectedCode, 'should return status code `' + expectedCode + '`');
    t.deepEqual(result, {http: [ { resource: expectedUrl, result: { http: 'fake', response: 'object' } } ]}, 'should return `http` endpoint url `' + expectedUrl + '`');
  });
});

// --- Subroutines

/**
 * Test replacement for http checks hanlder
 *
 * @param   {string} value - resource identifier to check
 * @param   {function} cb - callback function to invoke upon check result
 * @returns {function} - abort trigger function
 */
function onlyOne(value, cb)
{
  var tId, port, response = {http: 'fake', 'response': 'object'};

  if (value.match(/another/))
  {
    tId = setTimeout(cb.bind(null, true, response), 100);
  }
  else if ((port = (value.match(/127\.0\.0\.1:(\d+)/) || [])[1]))
  {
    tId = setTimeout(cb.bind(null, true, response), port);

    // make some without abort mechanism
    if (port % 2) tId = null;
  }
  else
  {
    tId = setTimeout(cb.bind(null, true, response), 300);
  }

  return tId ? clearTimeout.bind(null, tId) : undefined;
}
