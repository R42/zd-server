var socketio = require('socket.io');

function cut(game) {
  var whitelist = [
  'nickname',
  'vp',
  'rounds',
  'score',
  'rolled',
  'brains',
  'shots',
  'runners'
  ];

  var result = {};
  var model = game.clientModel();
  var i;
  for (i=0; i<whitelist.length; ++i)
    result[whitelist[i]] = model[whitelist[i]];

  return result;
}

module.exports = function(options, callback) {
      
  var io = socketio.listen(options.port, { 'log level': 1 });
  
  var ee = options.ee;

  ee.on('playerStartedGame', function(game) {
    io.sockets.emit('playerStartedGame', cut(game));
  });

  ee.on('playerVictory', function(game) {
    io.sockets.emit('playerVictory', cut(game));
  });

  ee.on('playerShotgunned', function(game) {
    io.sockets.emit('playerShotgunned', cut(game));
  });

  ee.on('playerOnARoll', function(game) {
    io.sockets.emit('playerOnARoll', cut(game));
  });

  ee.on('playerPlayedItSafe', function(game) {
    io.sockets.emit('playerPlayedItSafe', cut(game));
  });

  if (callback)
    callback();
};