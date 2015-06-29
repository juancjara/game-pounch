var players = {};
var gameState = {
  bodies: {}
};
var count = 0;

function generatePoints(center, size) {
  return [
      {x: center.x - size.x/2, y: center.y - size.y/2, color: 'red'},
      {x: center.x + size.x/2, y: center.y - size.y/2, color: 'yellow'},
      {x: center.x + size.x/2, y: center.y + size.y/2, color: 'black'},
      {x: center.x - size.x/2, y: center.y + size.y/2, color: 'blue'}    
  ]
}

function generateLocations() {
  var centers = [
    {x: 300, y: 100},
    {x: 300, y: 500},
    {x: 100, y: 300},
    {x: 500, y: 300}
  ];
  var locations = [];
  var size = {x: 50, y: 50};

  for (var i = 0, len = centers.length; i < len; i++) {
    locations.push({
      center: centers[i],
      points: generatePoints(centers[i], size),
      angle: 0
    })
  }

  return locations;
}

var locations = generateLocations();

var socketIO = require('socket.io');
var io;

function set(server) {
  io = socketIO(server);
  io.on('connection', init);  
}

var init = function (socket) {
  socket.on('join', function(name) {
    //TODO user already login, retreive information
    console.log('new player', name);
    players[name] = {id: socket.id, location: locations[count++], alive: true};
    io.sockets.emit('new players', players);
  })

  socket.on('new thing', function(obj) {
    players[obj.name] = {
      id: socket.id,
      location: obj.location
    }
    io.emit('add thing', obj);
  });

  socket.on('player death', function(name) {
    console.log('server player death', name);
    players[name].alive = false;
    io.sockets.emit('player rip', name);    
  });

  socket.on('update server', function(suchData) {
    for (var i = suchData.length - 1; i >= 0; i--) {
      var elem = suchData[i];
      players[elem.name].location = elem.location;
    };
    //players[someoneData.name].location = someoneData.location;
    io.sockets.emit('update client', players);
  });

}

module.exports = set;
set.set = set;