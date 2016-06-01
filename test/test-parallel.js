var test     = require('tape')
  , parallel = require('../lib/parallel.js')
  ;

test('iterates over array', function(t)
{
  var subject  = [1, 2, 3, 4, 3, 2, 1]
    , expected = ['A', 'B', 'C', 'D', 'C', 'B', 'A']
    , start    = process.hrtime()
    ;

  t.plan(subject.length + 3);

  parallel(subject, function(item, cb)
  {
    t.ok(subject.indexOf(item) != -1, 'expect item (' + item + ') to exist in the subject array');

    setTimeout(cb.bind(null, null, String.fromCharCode(64 + item)), 200 * item);
  },
  function(err, result)
  {
    var diff = process.hrtime(start);

    t.ok(diff[0] < 1, 'expect response time (' + diff[0] + 's, ' + diff[1] + 'ns) to be less than 1 second');
    t.error(err, 'expect no errors');
    t.deepEqual(result, expected, 'expect result to be an ordered letters array');
  });
});

test('longest finishes last', function(t)
{
  var source   = [1, 1, 4, 16, 64, 32, 8, 2]
    , expected = [1, 1, 2, 4, 8, 16, 32, 64]
    , target   = []
    ;

  t.plan(source.length + 3);

  parallel(source, function(item, cb)
  {
    setTimeout(function()
    {
      // just "hardcode" first element
      var sum = target.reduce(function(acc, num){ return acc + num; }, 0) || 1;

      t.equal(sum, item, 'expect sum (' + sum + ') to be equal current number (' + item + ')');

      target.push(item);

      cb(null, item);
    }, 25 * item);
  },
  function(err, result)
  {
    t.error(err, 'expect no errors');
    t.deepEqual(result, source, 'expect result to be same as source array');
    t.deepEqual(target, expected, 'expect target to contain ordered numbers');
  });
});

test.only('terminates early', function(t)
{
  var source   = [1, 1, 4, 16, 64, 32, 8, 2]
    , expected = [1, 1, 2, 4, 8]
    , target   = []
    ;

  t.plan(7);

  parallel(source, function(item, cb)
  {
    var id = setTimeout(function()
    {
      // just "hardcode" first element
      var sum = target.reduce(function(acc, num){ return acc + num; }, 0) || 1;

      t.equal(sum, item, 'expect sum (' + sum + ') to be equal current number (' + item + ')');

      if (item < 10)
      {
        target.push(item);
        cb(null, item);
      }
      // return error on big numbers
      else
      {
        cb({item: item});
      }
    }, 25 * item);

    return clearTimeout.bind(null, id);
  },
  function(err, result)
  {
    t.equal(err.item, 16, 'expect to error out on 16');
//    t.deepEqual(result, source, 'expect result to be same as source array');
    t.deepEqual(target, expected, 'expect target to contain passed numbers');
  });
});
