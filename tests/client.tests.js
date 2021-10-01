var extend = require('util')._extend;

var expect = require('chai').expect;
var sinon = require('sinon');
var nock = require('nock');
var http = require('http');

var Client  = require('../src/Client');
var ArgumentError = require('../src/exceptions').ArgumentError;

var request = require('superagent');

var domain = 'http://domain.com';
var endpoint = '/endpoint';


module.exports = {
  'Client': {
    beforeEach:
      function () {
        this.client = new Client(domain + endpoint + '/:id');
      },

    '#constructor': {
      'should require a URL as first parameter':
        function () {
          expect(Client).to.throw(ArgumentError);
        },

      'should not throw when a valid URL is provided':
        function () {
          var client = Client.bind(null, 'http://domain.com/endpoint/:id');

          expect(client).to.not.throw(ArgumentError);
        },
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
          var getAll = this.client.getAll.bind(this.client);

          expect(getAll).to.exist;
          expect(getAll).to.be.a('Function');
        },

      'should return a promise':
        function () {
          var returnValue = this.client.getAll();

          expect(returnValue).to.be.an.instanceOf(Promise);
        },

      'should accept a callback':
        function (done) {
          this.client.getAll({}, function (err, clients) {
            if (err) return done(err);
            done();
          });
        },

      'should perform a GET /endpoint request':
        function () {
          var request = null;
          var endpoint = this.nock;

          this.client.getAll({}, function (err, clients) {
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
        },

      'should pass the given params in the query-string':
        function (done) {
          var params = {
            first_name: 'john',
            last_name: 'doe'
          };

          nock.cleanAll();

          var request = nock(domain)
            .get(endpoint)
            .query(params)
            .reply(200);

          this.client
            .getAll(params)
            .then(function (objects) {
              expect(request.isDone()).to.be.true;
              done();
            });
        }
    },

    '#get': {
      beforeEach:
        function () {
          this.data = { name: 'Test' };
          this.headers = {
            'x-header-test': 'OK',
            'x-random-header': Math.random().toFixed(5),
          };
          this.successReq = nock(domain)
            .get(endpoint + '/OK')
            .reply(200, this.data, this.headers);
          this.errorReq = nock(domain)
            .get(endpoint + '/FAIL')
            .replyWithError({name: 'Unauthorized', message: 'Invalid token'});
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
          this.client.get({ id: 'OK' }, done.bind(null, null));
        },

      'should return a promise when no callback is given':
        function (done) {
          var promise = this.client
            .get({ id: 'OK' })
            .then(done.bind(null, null))
            .catch(done);

          expect(promise).to.be.an.instanceOf(Promise);
        },

      'should perform a GET /endpoint/:id request':
        function (done) {
          var req = this.successReq;

          this.client.get({ id: 'OK' }, function (err) {
            if (err) return done(err);

            expect(req.isDone()).to.be.true;
            done();
          });
        },

        'should pass the response body to the callback':
          function (done) {
            var actual = null;
            var expected = JSON.stringify(this.data);

            this.client.get({ id: 'OK' }, function (err, response) {
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
              .get({ id: 'OK' })
              .then(function (res) {
                var response = JSON.stringify(res);

                expect(response).to.equal(expected);
                done();
              })
              .catch(done);
          },

        'should pass the errors to the callback':
          function (done) {
            this.client.get({ id: 'FAIL' }, function (err) {
              expect(err).to.exist;
              done();
            });
          },
      'should pass the headers to the callback': 
        function (done) {
          var expectedHeaders = this.headers;

          this.client.get({ id: 'OK' }, function(err, body, headers) {
            expect(headers).to.exist;

            for (var key in expectedHeaders) {
              if (expectedHeaders.hasOwnProperty(key)) {
                expect(headers).to.have.property(key);
                expect(headers[key]).to.equal(expectedHeaders[key]);
              }
            }

            done();
          })
        },
    },

    '#post': {
      beforeEach:
        function () {
          this.resource = {
            name: 'Test coso'
          };

          // Mock the REST resource endpoint.
          this.nock = nock(domain).post(endpoint).reply(201, this.resource);
        },

      afterEach:
        function () {
          nock.cleanAll();
        },

      'should be defined':
        function () {
          expect(this.client.post).to.exist;
          expect(this.client.post).to.be.an.instanceOf(Function);
        },

      'should require a data object as first argument':
        function () {
          expect(this.client.post)
            .to.throw(ArgumentError, 'The data must be an object or a serialized json');
        },

      'should allow a callback as second argument':
        function (done) {
          var data = {
            name: 'Test resource'
          };

          this.client.post({}, data, function () {
            done();
          });
        },

      'should return a promise when no callback is provided':
        function () {
          var returnValue = this.client.post({}, { name: 'test' });

          expect(returnValue).to.be.an.instanceOf(Promise);
        },

      'should perform a POST /endpoint request':
        function (done) {
          var expectedName = this.resource.name;
          var request = this.nock;

          this.client
            .post({}, this.resource)
            .then(function (data) {
              expect(data).to.be.an.instanceOf(Object);
              expect(data.name).to.equal(expectedName);
              expect(request.isDone()).to.be.true;
              done();
            })
            .catch(done);
        },

      'should pass any errors to the callback function':
        function (done) {
          nock.cleanAll();
          this.nock = nock(domain).post(endpoint).reply(500);

          this.client.post({}, this.resource, function (err) {
            expect(err).to.exist;
            done();
          });
        },

      'should pass errors to the rejected promise':
        function (done) {
          nock.cleanAll();
          this.nock = nock(domain).post(endpoint).reply(500);

          this.client
            .post(this.resource)
            .catch(function (err) {
              expect(err).to.exist;
              done();
            });
        }
    },

    '#create': {
      'should be defined':
        function () {
          expect(this.client.create).to.exist;
        },
      'should be an alias for #post':
        function () {
          expect(this.client.create).to.equal(this.client.post);
        },
    },

    '#patch': {
      beforeEach:
        function () {
          this.id = 1;
          this.data = { name: 'Updated' };
          this.response = extend({ id: this.id }, this.data);

          this.nock = nock(domain)
            .patch(endpoint + '/' + this.id)
            .reply(200, this.response);
        },

      afterEach:
        function () {
          nock.cleanAll();
        },

      'should be defined':
        function () {
          expect(this.client.patch).to.exist;
        },

      'should accept a callback':
        function (done) {
          this.client.patch({ id: 1 }, {}, function () {
            done();
          });
        },

      'should require an object as second argument':
        function () {
          var updateWithoutData = this.client.patch.bind(this.client, { id: this.id });

          expect(updateWithoutData).to.throw(ArgumentError, 'The data must be an object or a serialized json');
        },

      'should perform a PATCH /endpoint/:id':
        function (done) {
          var request = this.nock;

          this.client
            .patch({ id: this.id }, this.data)
            .then(function () {
              expect(request.isDone()).to.be.true;
              done();
            })
            .catch(done);
        },

      'should pass the body of the response to the resolved promise':
        function (done) {
          var expectedData = JSON.stringify(this.response);

          this.client
            .patch({ id: this.id }, this.data)
            .then(function (data) {
              expect(JSON.stringify(data)).to.equal(expectedData);
              done();
            })
        },

      'should pass the body of the response to the callback':
        function (done) {
          var expectedData = JSON.stringify(this.response);

          this.client.patch({ id: this.id }, this.data, function (err, data) {
            expect(JSON.stringify(data)).to.equal(expectedData);
            done();
          });
        },

      'should pass any errors to the rejected promise':
        function (done) {
          nock.cleanAll();
          this.nock = nock(domain).post(endpoint + '/' + this.id).reply(500);

          this.client
            .patch({ id: this.id }, this.data)
            .catch(function (err) {
              expect(err).to.exist;
              done();
            });
        },

      'should pass any errors to the callback function':
        function (done) {
          nock.cleanAll();
          this.nock = nock(domain).post(endpoint + '/' + this.id).reply(500);

          this.client.patch({ id: this.id }, this.data, function (err) {
            expect(err).to.exist;
            done();
          });
        }
    },

    '#put': {
      beforeEach:
        function () {
          this.id = 1;
          this.data = { name: 'Updated' };
          this.response = extend({ id: this.id }, this.data);

          this.nock = nock(domain)
            .put(endpoint + '/' + this.id)
            .reply(200, this.response);
        },

      afterEach:
        function () {
          nock.cleanAll();
        },

      'should be defined':
        function () {
          expect(this.client.put).to.exist;
        },

      'should accept a callback':
        function (done) {
          this.client.put({ id: 1 }, {}, function () {
            done();
          });
        },

      'should require an object as second argument':
        function () {
          var updateWithoutData = this.client.put.bind(this.client, { id: this.id });

          expect(updateWithoutData).to.throw(ArgumentError, 'The data must be an object or a serialized json');
        },

      'should perform a PUT /endpoint/:id':
        function (done) {
          var request = this.nock;

          this.client
            .put({ id: this.id }, this.data)
            .then(function () {
              expect(request.isDone()).to.be.true;
              done();
            })
            .catch(done);
        },

      'should pass the body of the response to the resolved promise':
        function (done) {
          var expectedData = JSON.stringify(this.response);

          this.client
            .put({ id: this.id }, this.data)
            .then(function (data) {
              expect(JSON.stringify(data)).to.equal(expectedData);
              done();
            })
        },

      'should pass the body of the response to the callback':
        function (done) {
          var expectedData = JSON.stringify(this.response);

          this.client.put({ id: this.id }, this.data, function (err, data) {
            expect(JSON.stringify(data)).to.equal(expectedData);
            done();
          });
        },

      'should pass any errors to the rejected promise':
        function (done) {
          nock.cleanAll();
          this.nock = nock(domain).post(endpoint + '/' + this.id).reply(500);

          this.client
            .put({ id: this.id }, this.data)
            .catch(function (err) {
              expect(err).to.exist;
              done();
            });
        },

      'should pass any errors to the callback function':
        function (done) {
          nock.cleanAll();
          this.nock = nock(domain).post(endpoint + '/' + this.id).reply(500);

          this.client.put({ id: this.id }, this.data, function (err) {
            expect(err).to.exist;
            done();
          });
        }
    },

    '#update': {
      'should be defined':
        function () {
          expect(this.client.update).to.exist;
        },
      'should be an alias for #put':
        function () {
          expect(this.client.update).to.equal(this.client.put);
        },
    },

    '#delete': {
      beforeEach:
        function () {
          this.id = 1;
          this.nock = nock(domain).delete(endpoint + '/' + this.id).reply(200);
        },

      afterEach:
        function () {
          nock.cleanAll();
        },

      'should be defined':
        function () {
          expect(this.client.delete).to.exist;
          expect(this.client.delete).to.be.an.instanceOf(Function);
        },

      'should require an id as first argument':
        function () {
          var deleteFunc = this.client.delete.bind(this.client);

          expect(deleteFunc).to.throw;
        },

      'should accept a callback':
        function (done) {
          this.client.delete({ id: 1 }, function () {
            done();
          });
        },

      'should return a promise if no callback is given':
        function () {
          var returnValue = this.client.delete({ id: 1 });

          expect(returnValue).to.be.an.instanceOf(Promise);
        },

      'should pass any errors to the rejected promise':
        function (done) {
          nock.cleanAll();
          var request = nock(domain).delete(endpoint + '/1').reply(500);

          this.client.delete({ id: 1 }).catch(function (err) {
            expect(err).to.exist;
            done();
          });
        },

      'should pass any errors to the callback function':
        function (done) {
          nock.cleanAll();
          var request = nock(domain).delete(endpoint + '/1').reply(500);

          this.client.delete({ id: 1 }, function (err) {
            expect(err).to.exist;
            done();
          });
        }
    },

    '#request': {
      beforeEach: function () {
        nock.cleanAll();
      },

      'should convert the body of the request when case-conversion is enabled':
        function (done) {
          var options = { request: { body: { convertCase: 'snakeCase' }}};
          var expected = { first_name: 'John', last_name: 'Doe' };
          var client = this.client = new Client(domain + endpoint, options);
          var request = nock(domain).post(endpoint, expected).reply(200);

          client.create({ firstName: 'John', lastName: 'Doe' }, function (err) {
            expect(request.isDone()).to.be.true;
            done();
          });
        },

      'should convert the body of the response when case-conversion is enabled':
        function (done) {
          var options = { response: { body: { convertCase: 'camelCase' }}};
          var id = 1;
          var original = { first_name: 'John', last_name: 'Doe' };
          var client = this.client = new Client(domain + endpoint + '/:id', options);
          var request = nock(domain).get(endpoint + '/' + id).reply(200, original);

          client
            .get({ id: id })
            .then(function(data) {
              expect(data.first_name).to.be.undefined;
              expect(data.last_name).to.be.undefined;
              expect(data.firstName).to.equal('John');
              expect(data.lastName).to.equal('Doe');
              done();
            });
        },

      'should allow for a request customizer, that is called for each request, in constructor options':
        function (done) {

          var options = { request: { customizer : function(req, params) {
            req.send({alias: 'John Doe'});
          } }};

          var expected = { first_name: 'Kevin', last_name: 'Spacey', alias: 'John Doe' };
          var client = this.client = new Client(domain + endpoint, options);
          var request = nock(domain).post(endpoint, expected).reply(200);

          client.create({ first_name: 'Kevin', last_name: 'Spacey' }, function (err) {
            expect(request.isDone()).to.be.true;
            done();
          });
        },

        'should allow for an error customizer, that is called for each request, in constructor options':
          function (done) {
            nock.cleanAll();

            var options = {
              errorCustomizer: function(name, message, status, requestInfo, originalError){
                this.name = name;
                this.message = message;
                this.statusCode = status;
                this.requestInfo = requestInfo;
                this.originalError = originalError;
              }
            };

            var client = this.client = new Client(domain + endpoint, options);
            var req = nock(domain).post(endpoint).replyWithError();

            client
            .get()
            .catch(function (err) {
              expect(err).to.exist;
              expect(err).to.be.an.instanceOf(options.errorCustomizer);
              done();
            });
          },

      'should allow for an asynchronous request customizer, that is called for each request, in constructor options':
        function (done) {

          var customizerAsync = function (req, params, cb) {
            setTimeout(function(){
              req.send({alias: 'Jane Doe'});
              return cb(null, req)
            }, 10);
          }

          var options = { request: { customizer : customizerAsync }};

          var expected = { first_name: 'Kevin', last_name: 'Spacey', alias: 'Jane Doe' };
          var client = this.client = new Client(domain + endpoint, options);
          var request = nock(domain).post(endpoint, expected).reply(200);

          client.create({ first_name: 'Kevin', last_name: 'Spacey' }, function (err) {
            expect(request.isDone()).to.be.true;
            done();
          });
        },

      'should call a request customizer function given in params':
        function (done) {
          var expected = { first_name: 'John', last_name: 'Doe' };
          var client = this.client = new Client(domain + endpoint);
          var request = nock(domain, { reqheaders : {
              'X-Fake': '1'
          } }).post(endpoint, expected).reply(200);

          var reqfn = function(req, params) { req.set('X-Fake', '1'); };

          client.create({_requestCustomizer : reqfn}, { first_name: 'John', last_name: 'Doe' }, function (err) {
            expect(request.isDone()).to.be.true;
            done();
          });
        },

      'should call an asynchronous request customizer function given in params':
        function (done) {
          var customizerAsync = function (req, params, cb) {
            setTimeout(function(){
              req.set('X-Fake', '1');
              return cb(null, req)
            }, 10);
          }

          var expected = { first_name: 'John', last_name: 'Doe' };
          var client = this.client = new Client(domain + endpoint);
          var request = nock(domain, { reqheaders : {
              'X-Fake': '1'
          } }).post(endpoint, expected).reply(200);

          var reqfn = function(req, params) { req.set('X-Fake', '1'); };

          client.create({_requestCustomizer : customizerAsync}, { first_name: 'John', last_name: 'Doe' }, function (err) {
            expect(request.isDone()).to.be.true;
            done();
          });
        },

      'should use the proxy defined in the global settings':
        function (done) {
          var proxy = 'https://proxyserver.com';
          var client = this.client = new Client(domain + endpoint, { proxy: proxy });
          var req = nock(domain).get(endpoint).reply(200);

          var spy = sinon.spy(request.Request.prototype, 'proxy');

          client
            .getAll()
            .then(function(data) {
              expect(request.Request.prototype.proxy.calledWithMatch(proxy)).to.be.true;
              request.Request.prototype.proxy.restore();
              done();
            });
        },

      'should use persistent connections when it is enabled on the constructor options':
        function (done) {
          var options = { keepAlive: true };
          var client = this.client = new Client(domain + endpoint, options);
          var nockRequest = nock(domain)
            .get(endpoint)
            .reply(200);
          sinon.spy(request.Request.prototype, 'agent');
          client
            .get()
            .then(function() {
              expect(request.Request.prototype.agent.calledOnce).to.be.true;
              expect(nockRequest.isDone()).to.be.true;
              request.Request.prototype.agent.restore();
              done();
            });
        },
      'should use the request type when defined':
        async function (done) {
          // JSON Request type.
          var jsonClient = new Client(domain + endpoint);
          var jsonRequest = nock(domain)
            .matchHeader('content-type', 'application/json')
            .get(endpoint)
            .reply(200);

          await jsonClient.get();
          expect(jsonRequest.isDone()).to.be.true;

          // Form request type.
          var formClient = new Client(domain + endpoint, { request: { type: 'form' }});
          var formRequest = nock( domain)
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .get(endpoint)
            .reply(200);
          
          await formClient.get()
          expect(formRequest.isDone()).to.be.true;
          done();
        },

      'should allow serialized request data': 
        function(done) {
          var expected = { firstName: 'John', lastName: 'Doe' };
          var client = new Client(domain + endpoint);
          var request = nock(domain).post(endpoint, expected).reply(200);

          client.post(JSON.stringify(expected), function () {
            expect(request.isDone()).to.be.true;
            done();
          });
        },
    },
  }
};
