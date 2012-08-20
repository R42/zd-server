var should = require('should');

var restify = require('restify');

var client, server;

describe('server', function () {

  var game;

  before(function(done) {

    var port = Math.floor(Math.random() * 500 + 3000);
    require('../lib/server')(port, function(serverObject) {
      server = serverObject;
      client = restify.createJsonClient({
        url: 'http://localhost:'+port
      });
      done();
    });
  });

  it('should accept posts to /games', function(done) {

    var requestObject = {
      nickname: 'Rulio'
    };
    client.post('/games', requestObject, function (err, req, res, obj) {
      res.statusCode.should.equal(200);
      should.not.exist(err);
      should.exist(obj);
      obj.should.have.property('id');
      obj.id.should.be.ok;
      obj.should.have.property('nickname');
      obj.nickname.should.equal(requestObject.nickname);
      obj.should.have.property('score');
      obj.score.should.equal(0);
      obj.should.have.property('rolled');
      obj.rolled.should.have.length(3);
      obj.rolled.forEach(function(die){
        die.should.have.property('color');
        die.color.should.be.ok;
        ['red', 'green', 'yellow'].should.include(die.color);
        die.should.have.property('face');
        die.face.should.be.ok;
        ['shot', 'runner', 'brain'].should.include(die.face);
      });
      obj.should.have.property('brains');
      obj.should.have.property('runners');
      obj.should.have.property('shots');
      (obj.brains.length + obj.shots.length + obj.runners.length).should.equal(3);
      obj.brains.concat(obj.shots).concat(obj.runners).forEach(function (color) {
        color.should.be.ok;
        ['red', 'green', 'yellow'].should.include(color);
      });
      game = obj;
      done();
    });
  });

  it('should accept gets to the /games/id', function(done) {
    client.get('/games/'+game.id, function(err, req, res, obj) {
      res.statusCode.should.equal(200);
      done();
    });
  });

  it('should accept puts to /games', function(done) {
    game.nickname = 'R42';
    game.action = 'roll';
    client.put('/games/'+game.id, game, function(err, req, res, obj) {
      res.statusCode.should.equal(200);
      obj.nickname.should.equal(game.nickname);
      done();
    });
  });

  after(function() { server.close(); });

});