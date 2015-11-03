var extend = require('util')._extend;
var url = require('url');
var changeCase = require('change-case');

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
var Client = function (resourceUrl, options) {
  if (!resourceUrl) {
    throw new ArgumentError('Missing REST endpoint URL')
  }

  this.options = options || {};
  this.options.query = this.options.query || { convertCase: null };
  this.url = url.parse(resourceUrl);
};


/**
 * Get a list of instances of the specified resource from the API.
 *
 * @method
 * @param   {Function} [callback]   Callback to pass the response.
 * @return  {Promise}               Promise that resolve to a list.
 */
Client.prototype.getAll = function (/* params, callback */) {
  var params = {};
  var callback = null;

  // Signature getAll(urlParams, callback).
  if (arguments.length === 2) {
    params = arguments[0];
    callback = arguments[1];

  // Signature getAll(callback).
  } else if (arguments[0] instanceof Function) {
    callback = arguments[0];

  // Signature getAll(urlParams).
  } else if (typeof arguments[0] === 'object') {
    parmas = arguments[0];
  }

  return this.get(params, callback);
};

/**
 * Get a resource from the API by ID.
 *
 * @method
 * @param   {Number}    id          The id of the resource to be requested.
 * @param   {Function}  [callback]  A callback to be called
 */
Client.prototype.get = function (params, callback) {
  var options = {
    url: this.getURL(params || {}),
    method: 'GET'
  };

  return this.request(options, params || {}, callback);
};

/**
 * Send a request to create a new resource.
 *
 * @param   {Object}    params  URL params or query string params.
 * @param   {Object}    data    The data for the new resource.
 * @return  {Promise}           Resolves to the just created object.
 */
Client.prototype.create = function (/* [params,] data, callback */) {
  var params = {};
  var data = {};
  var callback = null;

  // Signature create(params, data, callback).
  if (arguments.length === 3) {
    params = arguments[0];
    data = arguments[1];
    callback = arguments[2];

  // Signature create(data, callback).
  } else if (arguments.length === 2 && arguments[1] instanceof Function) {
    data = arguments[0];
    callback = arguments[1];

  // Signature create(params, data).
  } else if (arguments.length === 2) {
    params = arguments[0];
    data = arguments[1];

  // Signature create(data).
  } else {
    data = arguments[0];
  }

  if (typeof data !== 'object') {
    throw new ArgumentError('Missing data object');
  }

  var options = {
    url : this.getURL(params),
    method: 'POST',
    data: data
  };

  return this.request(options, params, callback);
};

/**
 * Update an existing resource by its ID.
 *
 * @param   {Object}    params      Object containing URL resource params.
 * @param   {Number}    params.id   The ID of the resource to be updated.
 * @param   {Object}    data        The new data.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Resolves to the updated resource.
 */
Client.prototype.update = function (params, data, callback) {
  params = params || {};

  if (params.id === null || params.id === undefined) {
    throw new ArgumentError('A resource ID is required');
  }

  if (typeof data !== 'object') {
    throw new ArgumentError('The data must be an object');
  }

  var options = {
    method: 'POST',
    url: this.getURL(params),
    data: data
  };

  return this.request(options, params, callback);
};

/**
 * Delete a resource by its ID.
 *
 * @param   {Number}    id          The ID of the resource.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Deletion promise.
 */
Client.prototype.delete = function (/* [urlParams], [callback] */) {
  var callback = null;
  var params = {};

  // Signature delete(urlParams, callback).
  if (arguments.length === 2) {
    params = arguments[0];
    callback = arguments[1];

  // Signature delete(callback).
  } else if (arguments.length === 1 && arguments[1] instanceof Function) {
    callback = arguments[0];

  // Signature delete(urlParams).
  } else {
    params = arguments[0];
  }


  if (params.id === null || params.id === undefined) {
    throw new ArgumentError('The resource ID cannot be null or undefined');
  }

  var options = {
    method: 'DEL',
    url: this.getURL(params)
  };

  return this.request(options, params, callback);
};

/**
 * Perform a request of the given method, to the given URL.
 *
 * @method
 * @param   {Object}    options             Request options object.
 * @param   {String}    options.url         The URL to be requested.
 * @param   {String}    options.method      The type of request to be done.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Resolves to response body.
 */
Client.prototype.request = function (options, params, callback) {
  var headers = this.options.headers || {};
  var selectedCase = this.options.query.convertCase;
  var queryParams = {};
  var convertCase = null;
  var newKey = null;

  // If the user specified a convertion case (e.g. 'snakeCase') convert all the
  // query string params names to the given case.
  if (selectedCase) {
    convertCase = changeCase[selectedCase];

    for (var prevKey in params) {
      newKey = convertCase(prevKey);
      queryParams[newKey] = params[prevKey];
    }
  }

  var promise = new Promise(function (resolve, reject) {
    var method = options.method.toLowerCase();

    // Set methods and attach the body of the request (if this is a POST request).
    var req = request[method](options.url).send(options.data);

    // Add request headers.
    for (var header in headers) {
      req = req.set(header, headers[header]);
    }

    // Add all the given parameters to the querystring.
    req = req.query(queryParams);

    // Send the request.
    req
      .set('Accept', 'application/json')
      .end(function (err, res) {
        return err ? reject(err) : resolve(res.body);
      });
  });

  if (!callback) return promise;

  promise
    .then(callback.bind(null, null))
    .catch(callback);
};

/**
 * Return the endpoint URL for the given id (if any).
 *
 * @param   {any}     [id]  The id for the requested resource.
 * @return  {String}        The URL for the requested resource.
 */
Client.prototype.getURL = function (params) {
  var url = this.url.protocol + '//' + this.url.host + this.url.path;

  if (typeof params  !== 'object') return url;

  for (var key in params) {
    if (url.indexOf(':' + key) > -1) {
      url = url.replace(':' + key, params[key]);
      delete params[key];
    }
  }

  url = url.replace(/\/:[^\/]+/g, '');

  return url;
};


module.exports = Client;
