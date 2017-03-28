var util = require('util');


var APIError = function(name, message, status){
  Error.captureStackTrace(this, this.constructor);
  this.name = name;
  this.message = message;
  this.statusCode = status;
};

util.inherits(APIError, Error);


module.exports = APIError;
