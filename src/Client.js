var extend = require('util')._extend;
var url = require('url');
var changeCase = require('change-case');
var deepmerge = require('deepmerge');


var request = require('superagent');
var Promise = require('bluebird');
var ArgumentError = require('./exceptions').ArgumentError;
var APIError = require('./exceptions').APIError;
var defaultOptions = require('./defaultOptions');
var goToPath = require('./utils').goToPath;
var isFunction = require('./utils').isFunction;

// Add proxy support to the request library.
require('superagent-proxy')(request);

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

  this.options = deepmerge(defaultOptions, options || {}, true);

  this.url = url.parse(resourceUrl);
};


/**
 * Get a list of instances of the specified resource from the API.
 *
 * @method
 * @param   {Function} [callback]   Callback to pass the response.
 * @return  {Promise}               Promise that resolve to a list.
 */
Client.prototype.getAll = function (/* [params], [callback] */) {
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
    params = arguments[0];
  }

  // Prevent the getURL function from modifying this object.
  params = extend({}, params);

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
  // Prevent the getURL function from modifying this object.
  params = extend({}, params);

  var options = {
    url: this.getURL(params || {}),
    method: 'GET'
  };

  return this.request(options, params || {}, callback);
};

/**
 * Send a POST request.
 *
 * @param   {Object}    params  URL params or query string params.
 * @param   {Object}    data    The data to be included in the body.
 * @return  {Promise}           Resolves to the response body.
 */
Client.prototype.post = function (/* [params,] data, callback */) {
  var params = {};
  var data = {};
  var callback = null;

  // Signature post(params, data, callback).
  if (arguments.length === 3) {
    params = arguments[0];
    data = arguments[1];
    callback = arguments[2];

  // Signature post(data, callback).
  } else if (arguments.length === 2 && arguments[1] instanceof Function) {
    data = arguments[0];
    callback = arguments[1];

  // Signature post(params, data).
  } else if (arguments.length === 2) {
    params = arguments[0];
    data = arguments[1];

  // Signature post(data).
  } else {
    data = arguments[0];
  }

  if (typeof data !== 'object') {
    throw new ArgumentError('Missing data object');
  }

  // Prevent the getURL function from modifying this object.
  params = extend({}, params);

  var options = {
    url : this.getURL(params),
    method: 'POST',
    data: data
  };

  return this.request(options, params, callback);
};

/**
 * Send a request to create a new resource.
 *
 * This method is just an alias for Client#post() method.
 *
 * @param   {Object}    params  URL params or query string params.
 * @param   {Object}    data    The data for the new resource.
 * @return  {Promise}           Resolves to the just created object.
 */
Client.prototype.create = Client.prototype.post;

/**
 * Update an existing resource by its ID.
 *
 * @param   {Object}    params      Object containing URL resource params.
 * @param   {Object}    data        The new data.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Resolves to the updated resource.
 */
Client.prototype.patch = function (params, data, callback) {
  // Prevent the getURL function from modifying this object.
  params = extend({}, params) || {};

  if (typeof data !== 'object') {
    throw new ArgumentError('The data must be an object');
  }

  var options = {
    method: 'PATCH',
    url: this.getURL(params),
    data: data
  };

  return this.request(options, params, callback);
};

/**
 * Send a PUT request.
 *
 * @param   {Object}    params      Object containing querystring params.
 * @param   {Object}    data        The data to be sent in the body of the req.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Resolves to the response body.
 */
Client.prototype.put = function (params, data, callback) {
  // Prevent the getURL function from modifying this object.
  params = extend({}, params) || {};

  if (typeof data !== 'object') {
    throw new ArgumentError('The data must be an object');
  }

  var options = {
    method: 'PUT',
    url: this.getURL(params),
    data: data
  };

  return this.request(options, params, callback);
};

/**
 * Update an existing resource by its ID. Using the method PUT, because of
 * semantic use, this function should be used instead of the simple one: patch,
 * to perform a complete replacement of the element
 *
 * This function is just an alias for Client#put() method.
 *
 * @param   {Object}    params      Object containing URL resource params.
 * @param   {Object}    data        The new data.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Resolves to the updated resource.
 */
Client.prototype.update = Client.prototype.put;

/**
 * Delete a resource by its ID.
 *
 * @param   {Number}    id          The ID of the resource.
 * @param   {Function}  [callback]  Callback function.
 * @return  {Promise}               Deletion promise.
 */
Client.prototype.delete = function (/* [urlParams], [callback] */) {
  var callback = null;
  var body = {};
  var params = {};

  // Signature delete(urlParams, body, callback).
  if (arguments.length === 3) {
    params = arguments[0];
    body = arguments[1];
    callback = arguments[2];

  // Signature delete(urlParams, callback).
  } else if (arguments.length === 2 && arguments[1] instanceof Function) {
    params = arguments[0];
    callback = arguments[1];

  // Signature deletee(urlParams, body).
  } else if (arguments.length === 2) {
    params = arguments[0];
    body = arguments[1];

  // Signature delete(callback).
  } else if (arguments.length === 1 && arguments[0] instanceof Function) {
    callback = arguments[0];

  // Signature delete(urlParams).
  } else {
    params = arguments[0];
  }

  // Prevent the getURL function from modifying this object.
  params = extend({}, params);

  var options = {
    method: 'DEL',
    data: body,
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
  var errorFormatter = this.options.errorFormatter || null;
  var paramsCase = this.options.query.convertCase;
  var bodyCase = this.options.request.body.convertCase;
  var responseCase = this.options.response.body.convertCase;
  var queryParams = {};
  var convertCaseParams = paramsCase ? changeCase[paramsCase] : null;
  var convertCaseBody = bodyCase ? changeCase[bodyCase] : null;
  var convertCaseRes = responseCase ? changeCase[responseCase] : null;
  var reqCustomizer = this.options.request.customizer;
  var proxy = this.options.proxy;
  var newKey = null;
  var value = null;

  for (var prevKey in params) {
    value = params[prevKey];

    if (isFunction(value)) {
      continue;
    }

    // If the user specified a convertion case (e.g. 'snakeCase') convert the
    // query string params names to the given case.
    newKey = convertCaseParams ? convertCaseParams(prevKey) : prevKey;


    // If the repeatParams flag is set to false, encode arrays in
    // the querystring as comma separated values.
    // e.g. ?a=1,2,3
    if (Array.isArray(value) && !this.options.query.repeatParams) {
      value = value.join(',');
    }

    queryParams[newKey] = value;
  }

  if (convertCaseBody) {
    for (var key in options.data) {
      if (options.data.hasOwnProperty(key)) {
        options.data[convertCaseBody(key)] = options.data[key];
        delete options.data[key];
      }
    }
  }

  var promise = new Promise(function (resolve, reject) {
    var method = options.method.toLowerCase();

    // Set methods and attach the body of the request (if this is a POST request).
    var req = request[method](options.url);

    if (proxy) {
      req = req.proxy(proxy);
    }

    req = req.send(options.data);

    // Add request headers.
    for (var header in headers) {
      req = req.set(header, headers[header]);
    }

    // Add all the given parameters to the querystring.
    req = req.query(queryParams);

    if (isFunction(reqCustomizer)) {
      reqCustomizer(req, params);
    }

    if (isFunction(params._requestCustomizer)) {
      params._requestCustomizer(req, params);
    }

    // Send the request.
    req
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) {
          var reqinfo = { method : method, url : options.url };
          var response = err.response || {};
          var data = response.body;
          var status = err.status;
          var error;

          if (errorFormatter && errorFormatter.hasOwnProperty('name') &&
              errorFormatter.hasOwnProperty('message')) {
             var name = goToPath(errorFormatter.name, data);
             var message = data ? goToPath(errorFormatter.message, data) : err.message;
             error = new APIError(name, message, status, reqinfo, err);
          } else {
            error = new APIError('APIError', data ? JSON.stringify(data) : err.message, status, reqinfo, err);
          }

          return reject(error);
        }

        // If case conversion is enabled for the body of the response, convert
        // the properties of the body to the specified case.
        if (convertCaseRes) {
          for (var key in res.body) {
            if (res.body.hasOwnProperty(key)) {
              res.body[convertCaseRes(key)] = res.body[key];

              if (key !== convertCaseRes(key)) {
                delete res.body[key];
              }
            }
          }
        }

        resolve(res.body, res.header);
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
