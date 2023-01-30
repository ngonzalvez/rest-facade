var expect = require('chai').expect;
var utils = require('../src/utils');


module.exports = {
  'Utils': {
    'isObject': {
      'should be a function':
        function () {
          expect(utils.isObject).to.be.a('function');
        },

      'should return TRUE for object arguments':
        function () {
          expect(utils.isObject({})).to.be.true;
          expect(utils.isObject(function() {})).to.be.true;
          expect(utils.isObject([])).to.be.true;
        },

      'should return FALSE for non-object arguments':
        function () {
          expect(utils.isObject(null)).to.be.false;
          expect(utils.isObject(false)).to.be.false;
          expect(utils.isObject('hello')).to.be.false;
        },
    },

    'isFunction': {
      'should be a function':
        function () {
          expect(utils.isFunction).to.be.a('function');
        },

      'should return TRUE for function arguments':
        function () {
          expect(utils.isFunction(function() {})).to.be.true;
        },

      'should return FALSE for non-function arguments':
        function () {
          expect(utils.isFunction({})).to.be.false;
          expect(utils.isFunction(null)).to.be.false;
          expect(utils.isFunction(false)).to.be.false;
          expect(utils.isFunction(true)).to.be.false;
          expect(utils.isFunction([])).to.be.false;
          expect(utils.isFunction('hello')).to.be.false;
        },
    },

    'resolveAPIErrorArg': {
      'should be a function':
        function () {
          expect(utils.resolveAPIErrorArg).to.be.a('function');
        },

      'should return expected string values':
        function () {
          expect(utils.resolveAPIErrorArg('abc.def.0.g', {abc:{def:[{g:true}]}}, 'default!')).to.equal('true');
          expect(utils.resolveAPIErrorArg('abc.def.0.g', {abc:{def:[{g:null}]}}, 'default!')).to.equal('default!');
          expect(utils.resolveAPIErrorArg(function(d) { return d && d.a; }, {a:"hello"}, [null, "default!"])).to.equal('hello');
          expect(utils.resolveAPIErrorArg(function(d) { return d && d.b; }, {a:"hello"}, [null, "default!"])).to.equal('default!');
        },
    }
  }
};
