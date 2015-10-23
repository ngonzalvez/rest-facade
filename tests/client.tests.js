var expect = require('chai').expect;
var sinon = require('sinon');
var nock = require('nock');
var http = require('http');
var Promise = require('bluebird');

var Client  = require('../src/Client');
var ArgumentError = require('../src/exceptions').ArgumentError;

var domain = 'http://domain.com';
var endpoint = '/endpoint';


module.exports = {
  'Client': {
    beforeEach:
      function () {
        this.client = new Client (domain + endpoint);
      },

    '#constructor': {
      'should require a URL as first parameter':
        function () {
          expect(Client).to.throw(ArgumentError);
        },

      'should not error when a valid URL is provided':
        function () {
          var client = Client.bind(null, 'http://domain.com/endpoint');

          expect(client).to.not.throw(ArgumentError);
        }
    },

    '#getAll': {
      beforeEach:
        function () {
          // Mock the REST resource endpoint.
          this.nock = nock(domain).get(endpoint).reply(200, []);
        },

      afterEach:
        function () {
          nock.cleanAll();
        },

      'should be defined':
        function () {
          expect(this.client.getAll).to.exist;
          expect(this.client.getAll).to.be.a('Function');
        },

      'should return a promise':
        function () {
          var returnValue = this.client.getAll();

          expect(returnValue).to.be.an.instanceOf(Promise);
        },

      'should accept a callback':
        function (done) {
          this.client.getAll(function (err, clients) {
            if (err) return done(err);
            done();
          });
        },

      'should perform a GET /endpoint request':
        function () {
          var request = null;
          var endpoint = this.nock;

          this.client.getAll(function (err, clients) {
            expect(err).to.not.exist;
            expect(endpoint.isDone()).to.be.true;
          });
        },

      'should pass errors to the rejected promise':
        function (done) {
          nock.cleanAll();
          this.nock = nock(domain).get(endpoint).replyWithError('Internal error');

          this.client
            .getAll()
            .catch(function (err) {
              expect(err).to.exist;
              expect(err).to.be.an.instanceOf(Error);
              done();
            });
        },

      'should pass the response of the API to the resolved promise':
        function (done) {
          nock.cleanAll();
          this.nock = nock(domain)
            .get(endpoint)
            .reply(200, [{ id: 5, name: 'Test' }]);

          this.client
            .getAll()
            .then(function (objects) {
              expect(objects).to.be.an.instanceOf(Array);
              expect(objects.length).to.equal(1);
              expect(objects[0].name).to.equal('Test');
              expect(objects[0].id).to.equal(5);
              done();
            });
        }
    },

    '#get': {
      beforeEach:
        function () {
          this.data = { name: 'Test' };
          this.successReq = nock(domain).get(endpoint + '/OK').reply(200, this.data);
          this.errorReq = nock(domain).get(endpoint + '/FAIL').replyWithError();
        },

      afterEach:
        function () {
          nock.cleanAll();
        },

      'should be defined':
        function () {
          expect(this.client.get).to.exist;
          expect(this.client.get).to.be.an.instanceOf(Function);
        },

      'should accept a callback':
        function (done) {
          this.client.get('OK', done.bind(null, null));
        },

      'should return a promise when no callback is given':
        function (done) {
          var promise = this.client
            .get('OK')
            .then(done.bind(null, null))
            .catch(done);

          expect(promise).to.be.an.instanceOf(Promise);
        },

      'should perform a GET /endpoint/:id request':
        function (done) {
          var req = this.successReq;

          this.client.get('OK', function (err) {
            if (err) return done(err);

            expect(req.isDone()).to.be.true;
            done();
          });
        },

        'should pass the response body to the callback':
          function (done) {
            var actual = null;
            var expected = JSON.stringify(this.data);

            this.client.get('OK', function (err, response) {
              if (err) return done(err);

              actual = JSON.stringify(response);

              expect(actual).to.equal(expected);
              done();
            });
          },

        'should pass the response body to the promise':
          function (done) {
            var expected = JSON.stringify(this.data);

            this.client
              .get('OK')
              .then(function (res) {
                var response = JSON.stringify(res);

                expect(response).to.equal(expected);
                done();
              })
              .catch(done);
          },

        'should pass the errors to the callback':
          function (done) {
            var req = this.errorReq;

            done();
          }
    }
  }
};
