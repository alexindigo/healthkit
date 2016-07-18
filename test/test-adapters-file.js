var fs          = require('fs')
  , path        = require('path')
  , test        = require('tape')
  , platform    = require('os').platform()
  , fileAdapter = require('../adapters/file.js')
  ;

test('checks file existence', function(t)
{
  t.plan(1);

  fileAdapter('README.md', function(ok)
  {
    t.ok(ok, 'should return true for existing file');
  });
});

test('fails on non-existent file', function(t)
{
  t.plan(1);

  var filename = 'non-existent' + Math.random();

  fileAdapter(filename, function(ok)
  {
    t.notOk(ok, 'should return false for non-existing file');
  });
});

test('checks absolute path', function(t)
{
  t.plan(1);

  var filepath = path.resolve('README.md');

  fileAdapter(filepath, function(ok)
  {
    t.ok(ok, 'should return true for existing file ' + filepath);
  });
});

test('does not throw on inaccessible file', function(t)
{
  // no luck on windows
  // re: https://github.com/nodejs/node-v0.x-archive/issues/4812
  if (platform == 'win32')
  {
    t.skip();
    return;
  }

  t.plan(1);

  var basedir  = path.resolve('test/fixtures/protected')
    , filepath = path.resolve(basedir, 'inaccessible.file')
    ;

  fs.chmod(basedir, '000', function()
  {
    fileAdapter(filepath, function(ok)
    {
      t.notOk(ok, 'should return false for inaccessible file ' + filepath);

      fs.chmod(basedir, '755');
    });
  });

});

test('does not throw on malformed path', function(t)
{
  t.plan(1);

  fileAdapter(42, function(ok)
  {
    t.notOk(ok, 'should return false for malformed path');
  });
});
