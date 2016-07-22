# healthkit [![NPM Module](https://img.shields.io/npm/v/healthkit.svg?style=flat)](https://www.npmjs.com/package/healthkit)

Health check utility library

[![Linux Build](https://img.shields.io/travis/alexindigo/healthkit/v0.1.2.svg?label=linux:0.12-6.x&style=flat)](https://travis-ci.org/alexindigo/healthkit)
[![Windows Build](https://img.shields.io/appveyor/ci/alexindigo/healthkit/v0.1.2.svg?label=windows:0.12-6.x&style=flat)](https://ci.appveyor.com/project/alexindigo/healthkit)

[![Coverage Status](https://img.shields.io/coveralls/alexindigo/healthkit/v0.1.2.svg?label=code+coverage&style=flat)](https://coveralls.io/github/alexindigo/healthkit?branch=master)
[![Dependency Status](https://img.shields.io/david/alexindigo/healthkit/v0.1.2.svg?style=flat)](https://david-dm.org/alexindigo/healthkit)
[![bitHound Overall Score](https://www.bithound.io/github/alexindigo/healthkit/badges/score.svg)](https://www.bithound.io/github/alexindigo/healthkit)

<!-- [![Readme](https://img.shields.io/badge/readme-tested-brightgreen.svg?style=flat)](https://www.npmjs.com/package/reamde) -->

## Install

```
npm install --save healthkit
```

## Example

Checks for signal file and if it exists responds with `404` code
(to signal to load balancer to drain incoming requests),
if signal file doesn't exist, checks for upstream endpoint,
and returns `200` if endpoint is reachable and responds with successful http response.
Otherwise returns `500` code when all previous checks fail.

```javascript
var healthkit = require('healthkit');

var myAppChecks = [
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

// Express handler
app.get('/health', function(req, res)
{
  healthkit(myAppChecks, function(code, result)
  {
    res.status(code).send(result);
  });
});

```

## Want to Know More?

More examples can be found in [test folder](test/).

Or open an [issue](https://github.com/alexindigo/healthkit/issues) with questions and/or suggestions.

## License

HealthKit is licensed under the MIT license.
