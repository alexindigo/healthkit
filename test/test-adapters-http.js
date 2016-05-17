var test         = require('tape')
  , createServer = require('./mocks/http-server.js')
  , httpAdapter  = require('../adapters/http.js')
  , port         = 9876
  ;

test('checks http server', function(t)
{
  t.plan(2);

  var server = createServer(function(request)
  {
    t.equal(request.method, 'GET', 'expects default method to be GET');
  });

  server.listen(port, function()
  {
    httpAdapter('http://localhost:' + port + '/health', function(ok)
    {
      t.ok(ok, 'should return true');
      server.close();
    });
  });
});

test('fails on non-existent url', function(t)
{
  t.plan(2);

  var urlPath = '/non-existent/' + Math.random();

  var server = createServer(function(request)
  {
    t.equal(request.url, urlPath, 'expects specified url ' + urlPath);
  });

  server.listen(port, function()
  {
    httpAdapter('http://localhost:' + port + urlPath, function(ok)
    {
      t.notOk(ok, 'should return false');
      server.close();
    });
  });
});

test('does not wait for full response to come in', function(t)
{
  t.plan(3);

  var urlPath = '/slow';
  var begin = process.hrtime();

  var server = createServer(function(request)
  {
    // nodejs doesn't flush headers for HEAD requests
    t.equal(request.method, 'GET', 'expects default method to be GET');
  });

  server.listen(port, function()
  {
    httpAdapter('http://localhost:' + port + urlPath, function(ok)
    {
      var diff = process.hrtime(begin);
      t.ok(diff[0] < 2, 'expect response time to be less than 2 seconds');
      t.ok(ok, 'should return true');
      server.close();
    });
  });
});

test('does not throw on malformed url', function(t)
{
  t.plan(1);

  var notUrl = '-- totally not an url --' + Math.random();

  var server = createServer(function()
  {
    t.fail('does not expect to go that far');
  });

  server.listen(port, function()
  {
    httpAdapter(notUrl, function(ok)
    {
      t.notOk(ok, 'should return false on non-url');
      server.close();
    });
  });
});

test('does not throw on unsupported type', function(t)
{
  t.plan(1);

  var notUrlType = Math.random();

  var server = createServer(function()
  {
    t.fail('does not expect to go that far');
  });

  server.listen(port, function()
  {
    httpAdapter(notUrlType, function(ok)
    {
      t.notOk(ok, 'should return false on non-url-type ' + notUrlType);
      server.close();
    });
  });
});
