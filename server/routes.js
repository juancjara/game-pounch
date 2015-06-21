var set = function(server) {
  server.get('/', function(req, res) {
    res.sendFile('/public/index.html');
  });
}

module.exports = set;
set.set = set;