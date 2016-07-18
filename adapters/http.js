var url    = require('url')
  , http   = require('http')
  , https  = require('https')
  , merge  = require('deeply')
  , typeOf = require('precise-typeof')
  ;

module.exports = httpAdapter;

/**
 * Checks provided http resource
 * Will be called in parallel for each resource
 * that needed to be checked
 *
 * @param   {string|object} resource - resource to check
 * @param   {function} callback - invoked when all resources responded
 * @returns {function} - cancel function
 */
function httpAdapter(resource, callback)
{
  var clientRequest = request(resource);

  // not really interested in errors at this point
  // TODO: provide logging functionality - bole?
  if (!clientRequest)
  {
    callback(false);
    return;
  }

  clientRequest.on('error', function(error)
  {
    callback(false, error);
  });

  clientRequest.on('response', function(response)
  {
    var status = false;

    if (response.statusCode >= 200 && response.statusCode <= 299)
    {
      status = true;
    }

    clientRequest.abort();

    callback(status, {status: response.statusCode, headers: response.headers});
  });

  clientRequest.end();

  // allow it to be aborted
  return clientRequest.abort.bind(clientRequest);
}

/**
 * Creates http or https request to the provided endpoint
 *
 * @param   {string|object} resource - endpoint to hit
 * @returns {http#ClientRequest} - writeable stream of the ClientRequest instance
 */
function request(resource)
{
  var endpoint, client;

  try
  {
    endpoint = (typeOf(resource) != 'object') ? url.parse(resource) : resource;
  }
  catch (e)
  {
    return;
  }

  client = endpoint.protocol == 'https:' ? https : http;

  return client.request(merge({agent: false, method: 'GET'}, endpoint));
}
