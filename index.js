var merge    = require('deeply')
  , typeOf   = require('precise-typeof')
  , asynckit = require('asynckit')
  , firstOut = require('asynckit/stream').parallel
  , adapters = require('./adapters.js')
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
  // internal failure status
  failure: 500,
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

  // decouple checks object
  // to allow it's modifications downstream
  checks = merge(checks);

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

  runChecks.call(context, checks, function(code, result)
  {
    // if no code, or
    // if it's internal error,
    // use default failure code
    if (!code || typeOf(code) == 'error')
    {
      // if `code` is  falsy - return undefined, to as generic no-useful-result
      callback(context.defaults.failure || healthkit.defaults.failure, code || undefined);
    }
    else
    {
      callback(code, result);
    }
  });
}

/**
 * Runs provided checks one by one
 *
 * @this  healthkit
 * @param {array} checks - list of checks to run
 * @param {function} callback - invoked after all checks completed
 */
function runChecks(checks, callback)
{
  asynckit.serial(checks, function(check, cb)
  {
    var stream;

    // allow each check to be an array
    // set of parallel first-out checks
    if (typeOf(check) != 'array')
    {
      check = [check];
    }

    // gets first successful check
    stream = firstOut(check, checksIterator.bind(this), function(err, response)
    {
      // don't bother if stream got destroyed
      if (stream.destroyed) return;
      cb(err, response);
    });

    stream.on('data', function(result)
    {
      if (stream.destroyed) return;

      if (result.value.failed)
      {
        // skip failed results
        // wait for the good one
        return;
      }

      // got first successful one
      // stop the rest
      stream.destroy();

      // successful check result goes here:

      // at this point return proper health check status
      callback(result.value.context.status
        || (result.value.context.defaults && result.value.context.defaults.status)
        || (this.defaults && this.defaults.status)
        || healthkit.defaults.status, result.value.data);
    }.bind(this));

    // catch stream errors
    stream.on('error', function(error)
    {
      // shouldn't even get here
      // probably better to stop right here
      stream.destroy();
      cb(error);
    });

  // no successful checks found
  }.bind(this), callback);
}

/**
 * Iterates over individual checks
 *
 * @this    healthkit
 * @param   {object} check - check data object
 * @param   {function} callback - invoked after check is done
 * @returns {function} - check abort function
 */
function checksIterator(check, callback)
{
  var tId
    , abort
    , context
    ;

  // only deal with objects at this point
  if (typeOf(check) != 'object')
  {
    // shortcut to failed response
    // and only "global" context
    callback(null, {failed: true, context: merge(this)});
    return;
  }

  context = merge(this, getCheckProps.call(this, check));

  // if there are no endpoints to check
  if (!Object.keys(check).length)
  {
    // shortcut to successful response
    callback(null, {failed: false, context: context});
    return;
  }

  // returns terminator function
  abort = asynckit.parallel(check, function(location, proto, cb)
  {
    if (typeof(context.adapters[proto]) != 'function')
    {
      cb(new Error('Protocol <' + proto + '> is not supported.'), location);
      return;
    }

    return checkResources(context.adapters[proto], location, cb);
  },
  // `asynckit.parallel` final callback ^
  function(failed, gatheredData)
  {
    clearTimeout(tId);
    callback(null, {failed: failed, data: gatheredData, context: context});
  });

  // wait only specified amount of time
  tId = setTimeout(function()
  {
    abort();
    callback(null, {failed: new Error('Check timed out'), data: check, context: context});
  }, context.timeout || context.defaults.timeout);

  return abort;
}

/**
 * Checks resources with provided adapter in parallel
 *
 * @param   {function} adapter - adapter function to run with
 * @param   {array|string} resources - list (or one) of resources to check
 * @param   {function} callback - invoked after check is done
 * @returns {function} - check abort function
 */
function checkResources(adapter, resources, callback)
{
  if (typeOf(resources) != 'array')
  {
    resources = [resources];
  }

  return asynckit.parallel(resources, function(src, cb)
  {
    return adapter(src, function(checkResult, data)
    {
      var combinedResponse = {resource: src, result: data};

      if (typeOf(checkResult) == 'boolean')
      {
        cb(checkResult ? null : new Error('Unable to access <' + src + '>'), combinedResponse);
      }
      // must be internal/adapter error
      else
      {
        cb(checkResult, combinedResponse);
      }
    });
  }, callback);
}

/**
 * Takes setting properties from the check object
 * leaving it with list of adapters only
 *
 * @this    healthkit
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
