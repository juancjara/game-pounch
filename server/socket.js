var players = {};
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
    players[name] = {id: socket.id, location: locations[count++]};
    io.sockets.emit('new players', players);
  })

  function noToMe(data) {
    for(var k in players) {
      if (k !== data.name) {
        socket.broadcast.to(players[k].id).emit('update player', data);
      }
    } 
  }

  socket.on('update server', function(someoneData) {
    players[someoneData.name].location = someoneData.location;
    noToMe(someoneData);
  });

}

module.exports = set;
set.set = set;