require('./lib/server')(process.env['zdport'] || 3001, function (server) {
  console.log('%s listening at %s', server.name, server.url);
});