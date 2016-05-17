var url    = require('url')
  , extend = require('util')._extend
  ;

module.exports = setupOutgoing;

/**
 * Copies the right headers from `options` and `req` to
 * `outgoing` which is then used to fire the proxied
 * request.
 *
 * Examples:
 *
 *    common.setupOutgoing(outgoing, options, req)
 *    // => { host: ..., hostname: ...}
 *
 * @param {Object} Options Config object passed to the proxy
 * @param {ClientRequest} Req Request Object
 *
 * @return {Object} Outgoing Object with all required properties set
 *
 * @api private
 */

function setupOutgoing(options, req)
{
  var outgoing = {};

  outgoing.port = options['target'].port || 80;

  ['host', 'hostname', 'socketPath', 'pfx', 'key',
    'passphrase', 'cert', 'ca', 'ciphers', 'secureProtocol'].forEach(
    function(e) { outgoing[e] = options['target'][e]; }
  );

  outgoing.method = req.method;
  outgoing.headers = extend({}, req.headers);

  if (options.headers) {
    extend(outgoing.headers, options.headers);
  }

  if (options.auth) {
    outgoing.auth = options.auth;
  }

  outgoing.agent = options.agent || false;
  outgoing.localAddress = options.localAddress;

  outgoing.path = options['target'].path || '/';

  return outgoing;
};
