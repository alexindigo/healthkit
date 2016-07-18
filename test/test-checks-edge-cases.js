var healthkit = require('../');
var test      = require('tape');

// --- Test

test('edge case: no successful checks', function(t)
{
  t.plan(2);

  healthkit([{status: 200, http: 'http://nope.no.nay/never'}, {status: 300, file: '/non/existent/file/I/hope'}], function(code, result)
  {
    t.equal(code, healthkit.defaults.failure, 'should return default failure status code `' + healthkit.defaults.failure + '`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });
});

test('edge case: not array checks', function(t)
{
  t.plan(1);

  t.throws(function()
  {
    healthkit({status: 200, anything: 'will://throw'}, function()
    {
      t.fail('should not get to this point');
    });
  }, /TypeError: expecting `checks` to be an array/, 'should throw on non-array checks object');

});

test('edge case: check adapter fails', function(t)
{
  t.plan(2);

  healthkit([{status: 200, someProto: 'will://fail'}], {adapters: {someProto: customAdapter}}, function(code, result)
  {
    t.equal(code, healthkit.defaults.failure, 'should return default failure status code `' + healthkit.defaults.failure + '`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });

  /**
   * Fails check with error, instead of proper status
   *
   * @param   {string} value - resource to check
   * @param   {function} cb - invoke after check is through
   */
  function customAdapter(value, cb)
  {
    cb(new Error('Could not make it, sorry'));
  }
});

test('edge case: adapter times out', function(t)
{
  t.plan(2);

  healthkit([{status: 200, someProto: 'will://timeout'}], {adapters: {someProto: customAdapter}}, function(code, result)
  {
    t.equal(code, healthkit.defaults.failure, 'should return default failure status code `' + healthkit.defaults.failure + '`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });

  /**
   * Will never return
   *
   * @param   {string} value - resource to check
   * @param   {function} cb - invoke after check is through
   */
  function customAdapter()
  {
    // don't ever return
  }
});

test('edge case: successful check, no status, default context status', function(t)
{
  t.plan(2);

  healthkit([{someProto: 'will://succeed'}], {adapters: {someProto: customAdapter}, defaults: {status: null}}, function(code, result)
  {
    t.equal(code, healthkit.defaults.status, 'should return default status code `' + healthkit.defaults.status + '`');
    t.deepEqual(result, { someProto: [ { resource: 'will://succeed', result: undefined } ] }, 'should have check results returned.');
  });

  /**
   * Immediately succeeds
   *
   * @param   {string} value - resource to check
   * @param   {function} cb - invoke after check is through
   */
  function customAdapter(value, cb)
  {
    cb(true);
  }
});

test('edge case: invalid defaults', function(t)
{
  t.plan(2);

  healthkit([{someProto: 'will://barf'}], {defaults: {status: false, failure: 0}}, function(code, result)
  {
    t.equal(code, healthkit.defaults.failure, 'should return default failure status code `' + healthkit.defaults.failure + '`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });
});

test('edge case: invalid adapter', function(t)
{
  t.plan(2);

  healthkit([{status: 200, someProto: 'will://barf'}], {adapters: {someProto: 42}}, function(code, result)
  {
    t.equal(code, healthkit.defaults.failure, 'should return default failure status code `' + healthkit.defaults.failure + '`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });
});

test('edge case: invalid check', function(t)
{
  t.plan(2);

  healthkit([{status: 200, someProto: 'will://barf'}, 42], function(code, result)
  {
    t.equal(code, healthkit.defaults.failure, 'should return default failure status code `' + healthkit.defaults.failure + '`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });
});

test('edge case: invalid options', function(t)
{
  t.plan(2);

  healthkit([{status: 200, someProto: 'will://barf'}], 42, function(code, result)
  {
    t.equal(code, healthkit.defaults.failure, 'should return default failure status code `' + healthkit.defaults.failure + '`');
    t.deepEqual(result, undefined, 'should not have any extra results returned.');
  });
});
