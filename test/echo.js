var should = require('should');

var restify = require('restify');

var client;

describe('echo', function () {

  before(function() {

    // launch server - there should be a better way than this
    require('../server');

    client = restify.createJsonClient({
      url: 'http://localhost:8080'
    });
  });

  it('should echo', function(done) {
    client.get('/echo/r42', function (err, req, res, obj) {
      should.not.exist(err);
      should.exist(obj);
      should.exist(obj.name);
      obj.name.should.equal('r42');
      done();
    });
  });

});