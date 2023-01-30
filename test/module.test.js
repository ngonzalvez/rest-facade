var expect = require('chai').expect;
var rest = require('../src');
var Client = require('../src/Client');
var package = require('../package.json');

module.exports = {
  'rest-facade package': {
    'should export the Client class':
      function () {
        expect(rest.Client).to.exist;
        expect(rest.Client).to.equal(Client);
      },
    'should have superagent as a dependency':
      function () {
        expect(package.dependencies).to.have.property('superagent');
      },
    'should have superagent-proxy as a peer dependency':
      function () {
        expect(package.dependencies).not.to.have.property('superagent-proxy');  
        expect(package.peerDependencies).to.have.property('superagent-proxy');
      }
  }
}
