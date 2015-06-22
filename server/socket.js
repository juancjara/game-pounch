var players = {};
var gameState = {
  pause: false,
  entities: {}
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
    gameState.entities[name] = {
      name: name,
      socketID: socket.id,
      location: locations[count++],
      alive: true,
      type: 'player'
    };
    console.log('now players', gameState.entities);
    io.sockets.emit('new players', gameState.entities);
  })

  socket.on('ready', function(name) {
    io.sockets.emit('start game');
  })

  socket.on('add thing', function(thing) {
    //console.log('add thing', thing);
    gameState.entities[thing.name] = {
      name: thing.name,
      socketID: socket.id,
      locations: this.location,
      type: 'glove'
    };
    noToMe(thing, 'update thing');
  })

  function noToMe(data, messageName) {
    for(var k in gameState.entities) {
      if (k !== data.name) {
        socket.broadcast.to(gameState.entities[k].socketID)
          .emit(messageName, data);
      }
    }
  }

  socket.on('remove element', function(name) {
    //console.log('server player death', name);
    var elementToRemove = gameState.entities[name];
    if (elementToRemove.type === 'player') {
      elementToRemove.alive = false;
    }
    if (elementToRemove.type === 'glove') {
      delete gameState.entities[name];
    }
    console.log(gameState.entities);
    io.sockets.emit('element death', name);
  })

  socket.on('update server', function(something) {
    if (!(something.name in gameState.entities)) return;
    var entity = gameState.entities[something.name];
    if (entity.type === 'player' && !entity.alive) return;
    entity.location = something.location;
    // if (entity.type === 'glove') {
    //   console.log(entity.location);
    // }
    noToMe(something, 'update thing');
  });


}

module.exports = set;
set.set = set;