module.exports = function(options, callback) {

  var fs = require('fs');
  var restify = require('restify');

  var serverOptions = {
    name: 'zd-server',
    version: '0.1.0'
  };

  if (options.secure) {
    serverOptions.key = options.secure.key;
    serverOptions.certificate = options.secure.certificate;
  }

  var server = restify.createServer(serverOptions);

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  var model = require('./model');
  var Game = model.Game;
  var games = options.games;
  var ee = options.ee;

  server.post('/games', function(req, res, next) {
    var game = new Game(req.params.nickname);
    games[game.id] = game;
    game.roll();
    res.send(game.clientModel());

    ee.emit('playerStartedGame', game);
  });

  server.put('/games/:gameId', function(req, res, next) {
    if (req.params.gameId != req.params.id)
      return next(new restify.InvalidArgumentError('Ids don\'t match'));

    var game = games[req.params.id];
    var brainsToScore = game.brains.length;

    if (req.params.nickname) {
      game.nickname = req.params.nickname;
    }
    if (req.params.action) {
      if (req.params.action != 'roll' && req.params.action != 'stop') {
        return next(new restify.InvalidArgumentError('Not a valid action'));
      }

      game[req.params.action]();
    }

    res.send(game.clientModel());

    if (game.isShotgunned()) {
      ee.emit('playerShotgunned', game);
    } else if (game.hasWonVP()) {
      ee.emit('playerVictory', game);
    } else if (game.brains.length > 5) {
      ee.emit('playerOnARoll', game);
    } else if (req.params.action == 'stop' && brainsToScore > 0) {
      ee.emit('playerPlayedItSafe', game);
    }
  });

  server.get('/games/:gameId', function(req, res, next) {
    var game = games[req.params.gameId];
    
    if (!game)
      return next(new restify.ResourceNotFoundError('Game not found'));

    res.send(game);
  });

  server.get('/ranking', function(req, res, next) {
    var orderedGames = [];
    for(var id in games) {
      orderedGames.push(games[id]);
    }

    orderedGames.sort(function(x, y) {
      var xRatio = x.vp / x.rounds;
      var yRatio = y.vp / y.rounds;

      if (xRatio == yRatio) {
        return x.modified < y.modified ? -1 : 1;
      }

      return xRatio > yRatio ? -1 : 1;
    });

    var scores = [];
    for(var i=0; i<orderedGames.length; ++i) {
      var game = orderedGames[i];
      var score = {};

      score.position = i+1;
      score.nickname = game.nickname;
      score.vp = game.vp;
      score.rounds = game.rounds;

      scores.push(score);
    }

    res.send(scores);
  });

  server.listen(options.port, function() {
    if (callback)
      callback(server);
  });
};