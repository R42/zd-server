var should = require('should');
var EventEmitter = require('events').EventEmitter;
var restify = require('restify');

var ee = new EventEmitter();
var client, server;

describe('service', function () {

  var game;

  before(function(done) {

    var port = Math.floor(Math.random() * 500 + 3000);
    var games = [];
    var serverOptions = {
      port: port,
      games: games,
      ee: ee
    };

    require('../lib/service')(serverOptions, function(serverObject) {
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
      should.not.exist(err);
      should.exist(obj);
      done();
    });
  });

  it('should accept puts to /games', function(done) {
    game.nickname = 'R42';
    game.action = 'roll';
    client.put('/games/'+game.id, game, function(err, req, res, obj) {
      res.statusCode.should.equal(200);
      should.not.exist(err);
      should.exist(obj);
      obj.nickname.should.equal(game.nickname);
      done();
    });
  });

  it('should provide the player ranking in /ranking', function(done) {
    client.get('/ranking', function(err, req, res, obj) {
      res.statusCode.should.equal(200);
      should.not.exist(err);
      should.exist(obj);
      obj.should.be.an.instanceOf(Array);
      obj.length.should.be.above(0);
      obj[0].should.have.property('position');
      obj[0].should.have.property('nickname');
      obj[0].should.have.property('vp');
      obj[0].should.have.property('rounds');
      done();
    });
  });

  it('should emit \'playerStartedGame\' when a player starts a new game', function(done) {
    ee.once('playerStartedGame', function(game) {
      should.exist(game);
      game.nickname.should.equal('Rulio');
      done();
    });
    client.post('/games', { nickname: 'Rulio' }, function(err, req, res, obj) {});
  });

  it('should emit \'playerShotgunned\' when a player is shotgunned', function(done) {
    var stop = false;

    ee.once('playerShotgunned', function(game) {
      should.exist(game);
      game.isShotgunned().should.be.true;
      stop = true;
    });

    var roll = function() {
      game.action = 'roll';

      client.put('/games/'+game.id, game, function(err, req, res, obj) {
        if (stop)
          done();
        else
          process.nextTick(roll);
      });
    };

    roll();
  });

  it('should emit \'playerVictory\' when a player scores a VP', function(done) {
    var stop = false;

    ee.once('playerVictory', function(game) {
      should.exist(game);
      game.hasWonVP().should.be.true;
      stop = true;
    });

    var roll = function() {

      if (game.action != 'stop' && game.brains.length > 0)
        game.action = 'stop';
      else
        game.action = 'roll';

      client.put('/games/'+game.id, game, function(err, req, res, obj) {
        if (stop)
          done();
        else
          process.nextTick(roll);
      });
    };

    roll();
  });

  after(function() { server.close(); });

});