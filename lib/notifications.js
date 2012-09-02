var socketio = require('socket.io');

module.exports = function(options, callback) {
      
  var io = socketio.listen(options.port, { 'log level': 1 });
  
  var ee = options.ee;

  ee.on('playerStartedGame', function(game) {
    io.sockets.emit('playerStartedGame', { nickname: game.nickname });
  });

  ee.on('playerVictory', function(game) {
    io.sockets.emit('playerVictory', { nickname: game.nickname });
  });

  ee.on('playerShotgunned', function(game) {
    io.sockets.emit('playerShotgunned', { nickname: game.nickname });
  });

  if (callback)
    callback();
};