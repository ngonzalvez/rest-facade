var util = require('util');


var APIError = function(name, message, status){
  this.name = name || '';
  this.message = message || '';
  this.statusCode = status;

  Error.captureStackTrace(this, this.constructor);
};

util.inherits(APIError, Error);


module.exports = APIError;
