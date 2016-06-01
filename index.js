var merge    = require('deeply')
  , typeOf   = require('precise-typeof')
  , adapters = require('./adapters.js')
  , parallel = require('./lib/parallel')
  ;

// Public API
module.exports = healthkit;
// available adapters
healthkit.adapters = adapters;
// default values
healthkit.defaults =
{
  // http status for successful check
  status: 200,
  // set timeout to 1 second for all i/o
  timeout: 1000
};


/**
 * Runs provided health checks
 *
 * @param {array} checks - list of checks to run
 * @param {object} [options] - options specific to the run
 * @param {function} callback - invoked after all checks completed
 */
function healthkit(checks, options, callback)
{
  var context = {};

  // make `options` optional :)
  if (typeOf(options) == 'function')
  {
    callback = options;
    options  = undefined;
  }

  options = options || {};

  if (typeOf(checks) != 'array')
  {
    throw new TypeError('expecting `checks` to be an array.');
  }

  // create context for this run
  context.adapters = merge(healthkit.adapters, options.adapters || {});
  context.defaults = merge(healthkit.defaults, options.defaults || {});

  runChecks.call(context, checks, callback);
}

/**
 * Runs provided checks one by one
 *
 * @this  healthkit – augmented with runtime options
 * @param {array} checks - list of checks to run
 * @param {function} callback - invoked after all checks completed
 * @param {array} accumulator - stores checks' results
 */
function runChecks(checks, callback, accumulator)
{
  var check = checks.shift()
    , index = checks.length
    , context
    ;

  accumulator = accumulator || [];

  if (!check)
  {
    callback();
    return;
  }

  context = merge(this, getCheckProps.call(this, check));

  // Object.keys(check).forEach(function()
  // {
  //
  // });
}

/**
 * Takes setting properties from the check object
 * leaving it with list of adapters only
 *
 * @this    healthkit – augmented with runtime options
 * @param   {object} check - key-value pairs, which describe check job
 * @returns {object} - settings object for the particular check job
 */
function getCheckProps(check)
{
  var settings = {};

  Object.keys(this.defaults).forEach(function(name)
  {
    if (name in check)
    {
      settings[name] = check[name];
      delete check[name];
    }
  });

  return settings;
}

function iterator(items, adapter, callback)
{

}
