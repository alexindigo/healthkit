var http = require('http');

module.exports = createServer;

/**
 * creates HTTP server with provided request handle
 *
 * @param   {function} preHandler - custom addition to the request handler
 * @returns {http#Server} - newly created HTTP server
 */
function createServer(preHandler)
{
  return http.createServer(requestHandler.bind(null, preHandler));
}

/**
 * Generic HTTP request handler
 *
 * @param {function} preHandler - custom addition to the request handler
 * @param {http#IncomingMessage} request - incoming http request object
 * @param {http#ServerResponse} response - outgoing http response object
 */
function requestHandler(preHandler, request, response)
{
  var status = 404
    , delay  = 0
    , timeout
    ;

  if (request.url == '/health')
  {
    status = 200;
  }

  if (request.url == '/slow')
  {
    status = 200;
    delay  = 2000;
  }

  // allow preHandler to modify status code
  status = preHandler(request, response) || status;

  response.writeHead(status);

  // initial response
  response.write('...');

  timeout = setTimeout(function()
  {
    response.end('...done');
  }, delay);

  response.on('close', function()
  {
    clearTimeout(timeout);
  });
}
