// Public API
module.exports = parallel;

/**
 * Runs iterator over provided array elements in parallel
 *
 * @param {array|object} list - array or object to iterate over
 * @param {function} iterator - iterator to run
 * @param {object} [status] - current job status
 * @param {function} callback - invoked when all elements processed
 */
function parallel(list, iterator, status, callback)
{
  var index;

  if (typeof status == 'function')
  {
    callback = status;
    status   = {index: 0, processed: 0, results: [], jobs: []};
  }

  // store current index
  index = status.index;

  status.processed++;

  status.jobs[index] = iterator(list[index], function(error, output)
  {
    status.processed--;

    // nothing to do here
    if (status.processed < 0)
    {
      return;
    }

    // clean up jobs
    delete status.jobs[index];

    if (error)
    {
      // don't process rest of the results
      status.processed = 0;
      status.jobs.forEach(function(i){i();});
      callback(error);
      return;
    }

    status.results[index] = output;

    // looks like it's the last one
    if (status.processed == 0)
    {
      callback(null, status.results);
      return;
    }
  });

  // prepare for the next step
  status.index++;

  // proceed to the next element
  if (status.index < list.length)
  {
    parallel(list, iterator, status, callback);
  }
}
