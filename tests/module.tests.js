var expect = require('chai').expect;
var rest = require('../src');
var Client = require('../src/Client');

module.exports = {
  'REST-ORM module': {
    'should expose the Client':
      function () {
        expect(rest.Client).to.exist;
        expect(rest.Client).to.equal(Client);
      }
  }
}
