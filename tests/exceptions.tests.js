var expect = require('chai').expect;
var exceptions = require('../src/exceptions');

var ArgumentError = exceptions.ArgumentError;
var APIError = exceptions.APIError;

module.exports = {
  'AgrumentError': {
    '#constructor': {
      beforeEach: function() {
        this.error = new ArgumentError('Missing data object');
      },

      'should be an instance of the builtin Error':
        function () {
          expect(this.error).to.be.an.instanceof(Error);
        },

      'should be an instance of its class':
        function () {
          expect(this.error).to.be.an.instanceof(ArgumentError);
        },

      'should have a name':
        function () {
          expect(this.error.name).to.eql('ArgumentError');
        },

      'should have a message':
        function () {
          expect(this.error.message).to.eql('Missing data object');
        },

      'should have a stack with the message and location the error was created':
        function () {
          expect(this.error.stack).to.exist;
          var stackLines = this.error.stack.split('\n');
          expect(stackLines[0]).to.eql('ArgumentError: Missing data object');
          expect(stackLines[1]).to.include('tests/exceptions.tests.js:11');
        }
    }
  },

  'APIError': {
    '#constructor': {
      beforeEach: function() {
        this.error = new APIError('Unauthorized', 'Invalid token', 401);
      },

      'should be an instance of the builtin Error':
        function () {
          expect(this.error).to.be.an.instanceof(Error);
        },

      'should be an instance of its class':
        function () {
          expect(this.error).to.be.an.instanceof(APIError);
        },

      'should have a name':
        function () {
          expect(this.error.name).to.eql('Unauthorized');
        },

      'should have a message':
        function () {
          expect(this.error.message).to.eql('Invalid token');
        },

      'should have a statusCode':
        function () {
          expect(this.error.statusCode).to.eql(401);
        },

      'should have a stack with the message and location the error was created':
        function () {
          expect(this.error.stack).to.exist;
          var stackLines = this.error.stack.split('\n');
          expect(stackLines[0]).to.eql('Unauthorized: Invalid token');
          expect(stackLines[1]).to.include('tests/exceptions.tests.js:47');
        }
    }
  }
};
