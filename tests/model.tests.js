var expect = require('chai').expect;
var sinon = require('sinon');
var nock = require('nock');
var http = require('http');
var Promise = require('bluebird');

var Model  = require('../src/model');
var ArgumentError = require('../src/exceptions').ArgumentError;


module.exports = {
  'Model': {
    '#constructor': {
      'should require a URL as first parameter': function () {
        expect(Model ).to.throw(ArgumentError);
      },

      'should not error when a valid URL is provided': function () {
        expect(Model ).to.throw(ArgumentError);
      }
    },

    '#getAll': {
      before: function () {
        this.domain = 'http://domain.com';
        this.endpoint = 'endpoint';

        // Mock the REST resource endpoint.
        this.nock = nock(this.domain).get('/' + this.endpoint).reply(200, []);
      },

      beforeEach: function () {
        this.client = new Model (this.domain, this.endpoint);
      },

      'should be defined': function () {
        expect(this.client.getAll).to.exist;
        expect(this.client.getAll).to.be.a('Function');
      },

      'should return a promise': function () {
        var returnValue = this.client.getAll();

        expect(returnValue).to.be.an.instanceOf(Promise);
      },

      'should accept a callback': function (done) {
        this.client.getAll(function (err, clients) {
          expect(clients).to.be.an.instanceOf(Array);
          done();
        });
      },

      'should perform a GET /endpoint request': function () {
        var request = null;

        this.client.getAll(function (err, clients) {
          expect(err).to.not.exist;
          expect(http.request.calledOne).to.be.true;

          request = http.request.args[0];

          expect(request.domain).to.equal(this.domain);
          expect(request.path).to.equal('/' + this.endpoint);
        });
      },

      'should pass the error to the rejected promise': function (done) {
        this.nock = nock(this.domain).get('/' + this.endpoint).reply(500);

        this.client
          .getAll()
          .then(function (clients) {
            done(new Error('Shouldn\'t resolve when there is an Error response'));
          })
          .catch(function (err) {
            expect(err).to.exist;
            expect(err).to.be.an.instanceOf(Error);
            done();
          });
      }
    }
  }
};
