// Public API
module.exports =
{
  getResources: getResources
};

/**
 * Normalizes resources
 *
 * @param   {array|string} resources - resource(s) to normalize
 * @returns {array} - always returns an array
 */
function getResources(resources)
{
  return Array.isArray(resources) ? resources : [resources];
}
