var extend = require('util')._extend;
var url = require('url');

var request = require('superagent');
var Promise = require('bluebird');

var ArgumentError = require('./exceptions').ArgumentError;


/**
 * @class
 * Facade pattern for REST API endpoint consumption.
 * @constructor
 *
 * @param {String} resourceUrl  The URL for the REST ednpoint.
 */
var Client = function (resourceUrl) {
  if (!resourceUrl) {
    throw new ArgumentError('Missing REST endpoint URL')
  }

  this.url = url.parse(resourceUrl);
};


/**
 * Get a list of instances of the specified resource from the API.
 *
 * @method
 * @param   {Function} [callback]   Callback to pass the response.
 * @return  {Promise}               Promise that resolve to a list.
 */
Client.prototype.getAll = function (callback) {
  return this.get(undefined, callback);
};

/**
 * Get a resource from the API by ID.
 *
 * @method
 * @param   {Number}    id          The id of the resource to be requested.
 * @param   {Function}  [callback]  A callback to be called
 */
Client.prototype.get = function (id, callback) {
  var url = this.getURL(id);

  return this.request(url, 'GET', callback);
};

/**
 * Perform a request of the givne method, to the given URL.
 *
 * @method
 * @param   {String}    url         The URL to be requested.
 * @param   {String}    method      The type of request to be done.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Resolves to response body.
 */
Client.prototype.request = function (url, method, callback) {
  var promise = new Promise(function (resolve, reject) {
    method = method.toLowerCase();

    request[method](url)
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) return reject(err);

        resolve(res.body);
      });
  });

  if (!callback) return promise;


  promise
    .then(function (response) {
      callback(null, response);
    })
    .catch(callback);
};

/**
 * Return the endpoint URL for the given id (if any).
 *
 * @param   {any}     [id]  The id for the requested resource.
 * @return  {String}        The URL for the requested resource.
 */
Client.prototype.getURL = function (id) {
  var url = this.url.protocol + '//' + this.url.host + this.url.path;

  if (id !== null && id !== undefined) {
    url += '/' + id;
  }

  return url;
}


module.exports = Client;
