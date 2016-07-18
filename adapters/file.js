var fs   = require('fs')
  , path = require('path')
  ;

module.exports = fileAdapter;

/**
 * Checks provided file resource
 * Will be called in parallel for each resource
 * that needed to be checked
 *
 * @param   {string} resource - resource to check
 * @param   {function} callback - invoked when all resources responded
 * @returns {function} - cancel function
 */
function fileAdapter(resource, callback)
{
  exists(resource, function(err, result, stats)
  {
    // not really interested in errors at this point
    // TODO: provide logging functionality - bole?
    if (err || !result)
    {
      callback(false);
    }
    else
    {
      callback(true, {size: stats.size, ctime: stats.ctime, mtime: stats.mtime});
    }
  });

  // nothing to cancel here
  return function(){};
}

/**
 * Checks if provided path exists
 * Replacement for fs.exists since it's been deprecated
 *
 * @param {string} filepath - path to check
 * @param {function} callback - invoked after fs ops are done
 */
function exists(filepath, callback)
{
  if (typeof filepath != 'string')
  {
    callback(new TypeError('path expected to be a string'));
    return;
  }

  fs.stat(path.resolve(filepath), function(err, stats)
  {
    if (err)
    {
      callback(err.code != 'ENOENT' ? err : null, false, stats);
    }
    else
    {
      callback(null, true, stats);
    }
  });
}
