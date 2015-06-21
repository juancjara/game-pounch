var express = require('express');
var app = express();
var server = require('http').Server(app);


var socket = require('./server/socket');
var routes = require('./server/routes');

app.use(express.static(__dirname + '/public'));

routes.set(app);
socket.set(server);
//io.on('connection', socket.init, io);

var port = 1234;

server.listen(port, function(){
  console.log('listening on %s', port);
});

