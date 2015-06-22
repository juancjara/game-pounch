var Dude = require('./Dude');
var geom = require('./geom');
//var socket = require('./socket');
var socket = io();

var Game = function(name) {
  this.myName = name;
  this.players = {};
  this.bodies = [];
  var self = this;
/*
  var testData = {
    center: {x: 300,y: 200},
    points: [
      {x: 275, y: 175, color: 'black'},
      {x: 325, y: 175, color: 'black'},
      {x: 325, y: 225, color: 'black'},
      {x: 275, y: 225, color: 'black'}
    ], 
    angle: 0
  }
  var someoneElse = new Dude(this, testData, false, 'lel');
  this.players['lel'] = someoneElse;
  this.bodies.push(someoneElse);
*/
  socket.emit('join', name);
  socket.on('new players', function(players) {
    console.log('new players');
    for (var k in players) {
      if (!(k in self.players)) {
        var player = new Dude(self, players[k].location, self.myName === k, k);
        self.bodies.push(player);
        self.players[k] = player;
      }
    }
  })

  socket.on('update player', function(updatePlayer) {
    if (updatePlayer.name in self.players) {
      self.players[updatePlayer.name].updateStatus(updatePlayer.location);
    } else {
      console.log('not in list', updatePlayer.name);
      self.removeBody(self.players[updatePlayer.name]);
      delete self.players[updatePlayer.name];
    }
  });

  socket.on('remove player', function(name) {
    console.log('player death socket on', name)
    if (name in self.players) {
      self.removeBody(self.players[name]);
      delete self.players[name];
    }
  })

  var screen = document.getElementById('screen').getContext('2d');
  
  this.size = {
    x: screen.canvas.width,
    y: screen.canvas.height
  };

  var self = this;
  var tick = function() {
    self.update();
    self.draw(screen);
    requestAnimationFrame(tick);
  }
  tick();
};

var anyLinesIntersecting = function(lines1, lines2) {
    for (var i = 0, len1 = lines1.length; i < len1; i++) {
      for (var j = 0, len2 = lines2.length; j < len2; j++) {
        if (geom.linesIntersecting(lines1[i], lines2[j])) {
          return true;
        }
      }
    }

    return false;
  };

var isColliding = function(b1, b2) {
  if (b1 === b2) return false;

  var lines1 = geom.pointsToLines(b1.points);
  var lines2 = geom.pointsToLines(b2.points);

  return anyLinesIntersecting(lines1, lines2);
};

var reportCollisions = function(bodies) {
  var collisions = [];
  for (var i = 0; i < bodies.length; i++) {
    for (var j = i + 1; j < bodies.length; j++) {
      if (isColliding(bodies[i], bodies[j])) {
        collisions.push([bodies[i], bodies[j]]);
      }
    }
  }

  for (var i = 0; i < collisions.length; i++) {
    if (collisions[i][0].collision !== undefined) {
      collisions[i][0].collision(collisions[i][1]);
    }

    if (collisions[i][1].collision !== undefined) {
      collisions[i][1].collision(collisions[i][0]);
    }
  }
};

Game.prototype = {

  removeBody: function(body) {
    var bodyIndex = this.bodies.indexOf(body);
    if (bodyIndex !== -1) {
      this.bodies.splice(bodyIndex, 1);
    }
  },

  removePlayer: function(name) {
    this.removeBody(this.players[name]);
    delete this.players[name];
    console.log('player death', name);
    socket.emit('player death', name);
  },

  addBody: function(body) {
    this.bodies.push(body);
  },

  update: function() {
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      this.bodies[i].update();
    };
    reportCollisions(this.bodies);
    if (this.myName in this.players) {
      var newData = {
        name: this.myName,
        location: this.players[this.myName].serialize()
      };
      socket.emit('update server', newData);
    }
  },

  draw: function(screen) {
    screen.clearRect(0, 0, this.size.x, this.size.y);
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      this.bodies[i].draw(screen);
    };
  }
}

module.exports = Game;