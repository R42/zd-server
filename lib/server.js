module.exports = function(port, callback) {

  var restify = require('restify');

  var server = restify.createServer({
    name: 'zd-server',
    version: '0.1.0'
  });
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  var model = require('./model');
  var Game = model.Game;
  var games = {};

  // -- garbage collector
  // every 10 minutes
  // remove games which are older than 1 hour
  setInterval(function() {
    for(var gameId in games) {
      var game = games[gameId];
      var age = (+new Date()) - game.modified;
      if (age > 1 * 60 * 60 * 1000)
        delete games[gameId];
    }
  }, 10 * 60 * 1000);

  server.post('/games', function(req, res, next) {
    var game = new Game(req.params.nickname);
    games[game.id] = game;
    game.roll();
    res.send(game.clientModel());
  });

  server.put('/games/:gameId', function(req, res, next) {
    if (req.params.gameId != req.params.id)
      return next(new restify.InvalidArgumentError('Ids don\'t match'));

    var game = games[req.params.id];
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
      if (x.vp == y.vp) {
        if (x.rounds == y.rounds) {
          return x.modified < y.modified ? -1 : 1;
        }

        return x.rounds < y.rounds ? -1 : 1;
      }

      return x.vp > y.vp ? -1 : 1;
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

  server.listen(port, function() { callback(server); });
};