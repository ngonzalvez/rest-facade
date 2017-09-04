var util = require('util');


var APIError = function(name, message, status, originalError){
  this.name = name || this.constructor.name || this.constructor.prototype.name || '';
  this.message = message || '';
  this.statusCode = status || (originalError && originalError.code);
  this.originalError = originalError;

  Error.captureStackTrace(this, this.constructor);
};

util.inherits(APIError, Error);


module.exports = APIError;
