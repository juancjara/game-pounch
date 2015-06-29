var Dude = require('./Dude');
var Player = require('./Player');
var geom = require('./geom');
var SimpleGlove = require('./SimpleGlove');
//var socket = require('./socket');
var socket = io();

var Game = function(name) {
  this.myName = name;
  this.bodies = {};
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
  
    for (var k in players) {
      if (!(k in self.bodies)) {
        var playerr;
        if (self.myName === k) {
          player = new Dude(self, players[k].location, k); 
        } else {
          player = new Player(players[k].location, k);
        }
        self.bodies[k] = player;
      }
    }
  })

  socket.on('add thing', function(thing) {
    if (!(thing.name in self.bodies)) {
      self.addBody(new SimpleGlove(thing.location, thing.name));
    }
  })

  socket.on('player rip', self.removePlayer);

  socket.on('update client', function(players) {
    for (var k in players) {
      if (k in self.bodies && self.bodies[k].updateData) {
        self.bodies[k].updateData(players[k].location);  
      }
    }
  });

  var screen = document.getElementById('screen').getContext('2d');
  
  this.size = {
    x: screen.canvas.width,
    y: screen.canvas.height
  };

  var self = this;
  // var tick = function() {
  //   self.update();
  //   self.draw(screen);
  //   requestAnimationFrame(tick);
  // }
  // tick();
  var tick = function() {
    self.update(); self.draw(screen);
  };
  setInterval(tick, 30);
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
    delete this.bodies[body.name];
  },

  removePlayer: function(name) {
    if (name in self.bodies) {
      self.bodies[name].rip();
      delete self.bodies[name];
    }
  },

  addThing: function(body) {
    socket.emit('new thing', body.serialize());
    this.addBody(body);
  },

  addBody: function(body) {
    if (!(body.name in this.bodies)) {
      this.bodies[body.name] = body;
    }
  },

  update: function() {
    for(var k in this.bodies) {
      if (this.bodies[k].update) {
        this.bodies[k].update();
      }
    }

    var data = [this.bodies[this.myName].serialize()];
    var glove = 'glove' + this.myName;
    if (glove in this.bodies) {
      data.push(this.bodies[glove].serialize());
    }
    socket.emit('update server', data);
    //reportCollisions(this.bodies);
  },

  draw: function(screen) {
    screen.clearRect(0, 0, this.size.x, this.size.y);

    for(var k in this.bodies) {
      this.bodies[k].draw(screen);
    }
  }
}

module.exports = Game;