var util = require('util');


var ArgumentError = function(message){
  Error.captureStackTrace(this, this.constructor);
  this.name = 'ArgumentError';
  this.message = message;
};

util.inherits(ArgumentError, Error);


module.exports = ArgumentError;
