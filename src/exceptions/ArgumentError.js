var util = require('util');


var ArgumentError = function(message){
  this.name = 'ArgumentError';
  this.message = message || '';

  Error.captureStackTrace(this, this.constructor);
};

util.inherits(ArgumentError, Error);


module.exports = ArgumentError;
