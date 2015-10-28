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
  var options = {
    url: this.getURL(id),
    method: 'GET'
  };

  return this.request(options, callback);
};

/**
 * Send a request to create a new resource.
 *
 * @param   {Object}    data    The data for the new resource.
 * @return  {Promise}           Resolves to the just created object.
 */
Client.prototype.create = function (data, callback) {
  if (typeof data !== 'object') {
    throw new ArgumentError('Missing data object');
  }

  var options = {
    url : this.getURL(),
    method: 'POST',
    data: data
  };

  return this.request(options, callback);
};

/**
 * Update an existing resource by its ID.
 *
 * @param   {Number}    id          The ID of the resource to be updated.
 * @param   {Object}    data        The new data.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Resolves to the updated resource.
 */
Client.prototype.update = function (id, data, callback) {
  if (id === null || id === undefined) {
    throw new ArgumentError('A resource ID is required');
  }

  if (typeof data !== 'object') {
    throw new ArgumentError('The data must be an object');
  }

  var options = {
    method: 'POST',
    url: this.getURL(id),
    data: data
  };

  return this.request(options, callback);
};

/**
 * Delete a resource by its ID.
 *
 * @param   {Number}    id          The ID of the resource.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Deletion promise.
 */
Client.prototype.delete = function (id, callback) {
  if (id === null || id === undefined) {
    throw new ArgumentError('The resource ID cannot be null or undefined');
  }

  var options = {
    method: 'DEL',
    url: this.getURL(id)
  };

  return this.request(options, callback);
};

/**
 * Perform a request of the givne method, to the given URL.
 *
 * @method
 * @param   {Object}    options             Request options object.
 * @param   {String}    options.url         The URL to be requested.
 * @param   {String}    options.method      The type of request to be done.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Resolves to response body.
 */
Client.prototype.request = function (options, callback) {
  var promise = new Promise(function (resolve, reject) {
    var method = options.method.toLowerCase();

    request[method](options.url)
      .set('Accept', 'application/json')
      .end(function (err, res) {
        return err ? reject(err) : resolve(res.body);
      });
  });

  if (!callback) return promise;

  promise
    .then(function (response) {
      callback(null, response);
    })
    .catch(function (err) {
      callback(err);
    });
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
};


module.exports = Client;
