var extend = require('util')._extend;
var url = require('url');
var changeCase = require('change-case');
var deepmerge = require('deepmerge');


var request = require('superagent');
var ArgumentError = require('./exceptions').ArgumentError;
var APIError = require('./exceptions').APIError;
var defaultOptions = require('./defaultOptions');
var resolveAPIErrorArg = require('./utils').resolveAPIErrorArg;
var isFunction = require('./utils').isFunction;

const HttpsAgent = require('https').Agent;
const keepAliveAgent = new HttpsAgent({
  keepAlive: true,
});


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

  this.options = deepmerge(defaultOptions, options || {}, { clone: false });

  this.url = url.parse(resourceUrl);
  
  if (this.options.proxy) {
    // Add proxy support to the request library.
    require('superagent-proxy')(request);
  }
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

  if (typeof data !== 'object' && typeof data !== 'string') {
    throw new ArgumentError('The data must be an object or a serialized json');
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

  if (typeof data !== 'object' && typeof data !== 'string') {
    throw new ArgumentError('The data must be an object or a serialized json');
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

  if (typeof data !== 'object' && typeof data !== 'string') {
    throw new ArgumentError('The data must be an object or a serialized json');
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
  var errorFormatter = this.options.errorFormatter || {};
  var errorConstructor = this.options.errorCustomizer || APIError;
  var paramsCase = this.options.query.convertCase;
  var bodyCase = this.options.request.body.convertCase;
  var responseCase = this.options.response.body.convertCase;
  var reqType = this.options.request.type || 'json';
  var queryParams = {};
  var convertCaseParams = paramsCase ? changeCase[paramsCase] : null;
  var convertCaseBody = bodyCase ? changeCase[bodyCase] : null;
  var convertCaseRes = responseCase ? changeCase[responseCase] : null;
  var reqCustomizer = this.options.request.customizer;
  var proxy = this.options.proxy;
  var newKey = null;
  var value = null;
  var useKeepAlive = this.options.keepAlive;

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

  if (convertCaseBody && typeof options.data === 'object') {
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

    req = req.type(reqType);

    if (proxy) {
      req = req.proxy(proxy);
    }

    if (useKeepAlive) {
      req = req.agent(keepAliveAgent);
    }

    req = req.send(options.data);

    // Add request headers.
    for (var header in headers) {
      req = req.set(header, headers[header]);
    }

    // Add all the given parameters to the querystring.
    req = req.query(queryParams);

    // Run request customizer (from constructor options)
    if (isFunction(reqCustomizer)) {
      if (reqCustomizer.length === 3) { // check if callback has been defined
        reqCustomizer(req, params, runParamsRequestCustomizer);
      } else {
        // if no callback (run synchronously)
        reqCustomizer(req, params);
        runParamsRequestCustomizer();
      }
    } else {
      runParamsRequestCustomizer();
    }

    // Run request customizer (from request params)
    function runParamsRequestCustomizer(err) {
      if (err) {
        return reject(err);
      }

      if (isFunction(params._requestCustomizer)) {
        if (params._requestCustomizer.length === 3) { // check if callback has been defined
          params._requestCustomizer(req, params, sendRequest);
        } else {
          // if no callback (run synchronously)
          params._requestCustomizer(req, params);
          sendRequest();
        }
      } else {
        sendRequest();
      }
    }

    // send the request
    function sendRequest(err) {
      if (err) {
        return callback ? callback(err) : reject(err);
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

            var name = resolveAPIErrorArg(errorFormatter.name, data, 'APIError');
            var message = resolveAPIErrorArg(errorFormatter.message, data, [data, err.message]);
            var error = new errorConstructor(name, message, status, reqinfo, err);

            return callback ? callback(error) : reject(error);
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

          if (callback) callback(null, res.body, res.headers);
          else resolve(res.body);
        });
      }
    });

  if (!callback) return promise;
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
