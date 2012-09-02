// games stay in memory
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

var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();

var fs = require('fs');
var path = require('path');
var existsSync = fs.existsSync || path.existsSync;

var service =  require('./lib/service');
var notifications = require('./lib/notifications');

var httpServer = service({
  port: process.env['zdport'] || 3080,
  games: games,
  ee: ee
}, function (server) {
  console.log('%s listening at %s', server.name, server.url);

  notifications({port: server.server, ee: ee});
});

var certificate = process.env['zdcertificate'] || 'server';
if (existsSync(certificate+'.key') && existsSync(certificate+'.crt')) {
  service({
    port: process.env['zdsport'] || 3443,
    games: games,
    ee: ee,
    secure: {
      key: fs.readFileSync(certificate + '.key'),
      certificate: fs.readFileSync(certificate + '.crt')
    }
  }, function (server) {
    console.log('secure %s listening at %s', server.name, server.url);
    notifications({port: server.server, ee: ee});
  });
}
