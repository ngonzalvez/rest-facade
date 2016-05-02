var util = require('util');


var ArgumentError = function(name, message, status){
  Error.captureStackTrace(this, this.constructor);
  this.name = name;
  this.message = message;
  this.statusCode = status;
};

util.inherits(ArgumentError, Error);


module.exports = ArgumentError;
