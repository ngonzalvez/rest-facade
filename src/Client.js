var http = require('http');
var url = require('url');
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
  var requestOptions = {
    protocol: this.url.protocol,
    host: this.url.host,
    path: this.url.path,
    method: 'GET'
  };

  return new Promise(function (resolve, reject) {
    var req = http.request(requestOptions, function (res) {
      var content = '';

      res.setEncoding('utf8');
      res.on('data', appendToContent);
      res.on('end', resolveJSON);

      /**
       * Append the given data chunk to the content string.
       *
       * @param {String} datum  A chunk of content.
       */
      function appendToContent (datum) {
        content += datum;
      }

      /**
       * Parse the content string as JSON and resolve the promise with it.
       */
      function resolveJSON () {
        var data = content ? JSON.parse(content) : {};

        if (callback) callback(null, data);
        resolve(data);
      }
    });

    // Handle errors.
    req.on('error', function (err) {
      if (callback) callback(err);
      reject(err);
    });

    // Send the request.
    req.end();
  });
};


module.exports = Client;
