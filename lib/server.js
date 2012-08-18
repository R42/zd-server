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

  server.listen(port, function() { callback(server); });
};