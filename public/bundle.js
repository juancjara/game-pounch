(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var drawRect = function(screen, body, color) {
  screen.fillStyle = color;
  screen.fillRect(body.center.x - body.size.x / 2,
                  body.center.y - body.size.y / 2,
                  body.size.x, body.size.y);
};

var pointsToLines = function(points) {
  var lines = [];
  var previous = points[0];
  for (var i = 1; i < points.length; i++) {
    lines.push([previous, points[i]]);
    previous = points[i];
  }

  lines.push([previous, lines[0][0]]); // end to beginning
  return lines;
};

var drawLine = function(screen, line) {
  screen.beginPath();
  screen.moveTo(line[0].x, line[0].y);
  screen.lineTo(line[1].x, line[1].y);
  screen.strokeStyle = line[0].color;
  screen.stroke();
};

var drawLinesFromPoints = function(screen, points) {
  var lines = pointsToLines(points);
  for (var i = 0; i < lines.length; i++) {
    drawLine(screen, lines[i]);
  }
};

module.exports = drawer = function() {};
drawer.drawRect = drawRect;
drawer.drawLinesFromPoints = drawLinesFromPoints;
},{}],2:[function(require,module,exports){
var Keyboarder = require('./Keyboarder');
var drawer = require('./Drawer');
var geom = require('./geom');
var Glove = require('./Glove');

var Dude = function(game, location, noMoves, name) {
  this.type = 'player';
  this.name = name;
  this.game = game;
  this.glove;
  this.angle = location.angle;
  this.size = {x: 50, y: 50};
  this.center = location.center;
  this.points = location.points;
  this.keyboarder = new Keyboarder();
  this.velocity = { x: 0, y: 0 };
  this.noMoreMoves = !noMoves;
  this.speed = 4;
  this.possibleMoves = [
    {
      keys: [this.keyboarder.KEYS.UP, this.keyboarder.KEYS.RIGHT],
      velocity: {x: this.speed, y: -this.speed},
      angle: Math.PI * 0.25
    },
    {
      keys: [this.keyboarder.KEYS.DOWN, this.keyboarder.KEYS.RIGHT],
      velocity: {x: this.speed, y: this.speed},
      angle: Math.PI * 0.75
    },
    {
      keys: [this.keyboarder.KEYS.UP, this.keyboarder.KEYS.LEFT],
      velocity: {x: -this.speed, y: -this.speed},
      angle: Math.PI * 1.75
    },
    {
      keys: [this.keyboarder.KEYS.DOWN, this.keyboarder.KEYS.LEFT],
      velocity: {x: -this.speed, y: this.speed},
      angle: Math.PI * 1.25
    },
    {
      keys: [this.keyboarder.KEYS.UP],
      velocity: {x: 0, y: -this.speed},
      angle: 0
    },
    {
      keys: [this.keyboarder.KEYS.DOWN],
      velocity: {x: 0, y: this.speed},
      angle: Math.PI
    },
    {
      keys: [this.keyboarder.KEYS.RIGHT],
      velocity: {x: this.speed, y: 0},
      angle: Math.PI * 0.5
    },
    {
      keys: [this.keyboarder.KEYS.LEFT],
      velocity: {x: -this.speed, y: 0},
      angle: Math.PI * 1.5
    }
  ];
};

var moveBody = function(body, center) {
  var translation = geom.vectorTo(body.center, center);
  body.center = center;
  body.points = body.points.map(function(x) { return geom.translate(x, translation); });
};

Dude.prototype = {

  serialize: function() {
    return {
      points: this.points
    }
  },

  updateStatus: function(data) {
    this.points = data.points;
  },

  moveAgain: function() {
    this.glove = null;
    this.noMoreMoves = false;
  },

  turnTo: function(newAngle) {
    var diff = newAngle - this.angle;
    this.angle = newAngle;
    var center = this.center;
    this.points = this.points.map(function(x) { 
                                    return geom.rotate(x, center, diff); 
                                  });
  },

  move: function() {
    this.velocity = geom.translate(this.velocity,
                                   geom.rotate({ x: 0, y: -0.01 }, { x: 0, y: 0 }, this.angle));
    moveBody(this, geom.translate(this.center, this.velocity));
  },

  keysPressed: function(keys) {
    for (var j = 0, len = keys.length; j < len; j++) {
      if (!this.keyboarder.isDown(keys[j])) return false;
    }
    return true;
  },

  update: function() {
    if (this.noMoreMoves) return;

    if (this.keyboarder.isDown(this.keyboarder.KEYS.CTRL)) {
      console.log('CTRL prssed');
      var midPoint = geom.midPoint(this.points[0], this.points[1]);
      this.noMoreMoves = true;
      this.glove = new Glove(this.game, midPoint, this.angle, this, true);
      this.game.addThing(this.glove);
      return;
    }

    var actualMove;
    for (var i = 0, len = this.possibleMoves.length; i < len; i++) {
       actualMove = this.possibleMoves[i]; 
      if (this.keysPressed(actualMove.keys)) {
        this.velocity = actualMove.velocity;
        this.turnTo(actualMove.angle);
        this.move();
        return;
      }
    }

  },

  draw: function(screen) {
    drawer.drawLinesFromPoints(screen, this.points);
  }

}

module.exports = Dude;

},{"./Drawer":1,"./Glove":3,"./Keyboarder":4,"./geom":6}],3:[function(require,module,exports){
//var Dude = require('./Dude.js');
//console.log('dude', Dude);
var drawer = require('./Drawer');
var geom = require('./geom');

var Glove = function(game, start, angle, parent, shouldMove) {
  this.game = game;
  this.parent = parent;
  this.velocity = geom.rotate({x: 0, y: -1}, { x: 0, y: 0 }, angle);
  this.angle = angle;
  this.points = [start, geom.translate(start, this.velocity)];
  this.factorInc = 2;
  this.growDirection = 1;
  this.maxSize = 40;
  this.size = this.maxSize;
  this.name = 'glove' + this.parent.name;
  this.shouldMove = !!shouldMove;
};

Glove.prototype = {

  serialize: function() {
    return {
      name: this.name,
      points: this.points
    }
  },

  updateStatus: function(newData) {
    this.points = newData.points;
  },

  collision: function(otherBody) {
    if (!this.shouldMove) return;
    console.log(otherBody.name, this.parent.name);
    if (otherBody.type === 'player' && otherBody.name !== this.parent.name) {
      this.reverse();
      this.game.removePlayer(otherBody.name);
    }
  },

  reverse: function() {
    this.shouldReduce = true;
    this.velocity = geom.reverseVector(this.velocity);
  },

  update: function() {
    if (!this.shouldMove) return;

    if (this.size <= 0) {
      this.parent.moveAgain();
      this.game.removeThing(this);
      return;
    }
    
    if (this.shouldReduce) {
      this.size--;
    }

    if (!this.shouldReduce && geom.distance(this.points[0], this.points[1]) > this.maxSize) {      
      this.reverse();
    }
    this.points[1] = geom.translate(this.points[1], this.velocity);
    
  },

  draw: function(screen) {
    drawer.drawLinesFromPoints(screen, this.points);
  }

}

module.exports = Glove;
},{"./Drawer":1,"./geom":6}],4:[function(require,module,exports){
var Keyboarder = function() {
  var keyState = {};

  window.addEventListener('keydown', function(e) {
    keyState[e.keyCode] = true;
  });

  window.addEventListener('keyup', function(e) {
    keyState[e.keyCode] = false;
  });

  this.isDown = function(keyCode) {
    return keyState[keyCode] === true;
  };
  //ctrl 17
  this.KEYS = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32, CTRL: 90};
};

module.exports = Keyboarder;
},{}],5:[function(require,module,exports){
var Dude = require('./Dude');
var geom = require('./geom');
var Glove = require('./Glove');
var utils = require('./utils');
//var socket = require('./socket');
var socket = io();

var Game = function(name) {
  this.name = name;
  this.players = {};
  this.bodies = [];
  this.myThings = [];
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
      if (!(k in self.players) && players[k].type === 'player') {
        var player = new Dude(self, players[k].location, self.name === k, k);
        if (self.name === k) {
          self.myThings.push(player);
        }
        self.bodies.push(player);
        self.players[k] = player;
      }
    }
  })

  socket.on('update thing', function(dataThing) {
    //no update my things
    console.log('dude')
    if (dataThing.name === ('glove' + self.name) || dataThing.name === self.name) {
      return;
    }
    console.log('size', self.bodies.length);
    var idx = utils.indexOf(self.bodies, dataThing.name, 'name');
    if (idx !== -1) {
      self.bodies[idx].updateStatus(dataThing.location);
      return;
    }

    console.log('not found');
    var glove = new Glove(self, {x:1,y:1}, 0, {name: 'lel'});
    glove.name = dataThing.name;
    glove.updateStatus(dataThing.location)
    self.bodies.push(glove);
  })

  // socket.on('update player', function(updatePlayer) {

  //   if (updatePlayer.name in self.players) {
  //     self.players[updatePlayer.name].updateStatus(updatePlayer.location);
  //   } else {
  //     console.log('not in list', updatePlayer.name);
  //     self.removeBody(self.players[updatePlayer.name]);
  //     delete self.players[updatePlayer.name];
  //   }
  // });

  socket.on('element death', function(name) {
    var idx = utils.indexOf(self.bodies, name, 'name');
    if (idx !== -1) {
      console.log('death', self.bodies[idx].name);
      self.removeBody(self.bodies[idx]);
    }
    /*console.log('player death socket on', name)
    if (name in self.players) {
      self.removeBody(self.players[name]);
      delete self.players[name];
    }*/
  })

  socket.on('start game', function() {

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
  };

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

  removeThing: function(body) {
    var bodyIndex = this.bodies.indexOf(body);
    if (bodyIndex !== -1) {
      this.bodies.splice(bodyIndex, 1);
      socket.emit('remove element', body.name);
    }
  },

  removePlayer: function(name) {
    this.removeBody(this.players[name]);
    delete this.players[name];
    console.log('player death', name);
    socket.emit('remove element', name);
  },

  addThing: function(thing) {
    this.myThings.push(thing);
    this.addBody(thing);
    socket.emit('add thing', {
      name: thing.name,
      location: thing.serialize()
    });
  },

  addBody: function(body) {
    this.bodies.push(body);
  },

  update: function() {
    
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      this.bodies[i].update();
    };

    reportCollisions(this.bodies);

    for (var i = this.myThings.length - 1; i >= 0; i--) {
      var newData = {
        name: this.myThings[i].name,
        location: this.myThings[i].serialize()
      }
      socket.emit('update server',newData);
    };

  },

  draw: function(screen) {
    screen.clearRect(0, 0, this.size.x, this.size.y);
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      this.bodies[i].draw(screen);
    };
  }
}

module.exports = Game;
},{"./Dude":2,"./Glove":3,"./geom":6,"./utils":8}],6:[function(require,module,exports){
var geom = {
  translate: function(point, translation) {
    return { 
      x: point.x + translation.x, 
      y: point.y + translation.y, 
      color: point.color 
    };
  },

  vectorTo: function(point1, point2) {
    return { x: point2.x - point1.x, y: point2.y - point1.y };
  },

  rotate: function(point, pivot, angle) {
    return {
      x: (point.x - pivot.x) * Math.cos(angle) -
        (point.y - pivot.y) * Math.sin(angle) +
        pivot.x,
      y: (point.x - pivot.x) * Math.sin(angle) +
        (point.y - pivot.y) * Math.cos(angle) +
        pivot.y,
      color: point.color
    };
  },

  distance: function(point1, point2) {
    return Math.sqrt(Math.pow((point2.y - point1.y), 2) +
           Math.pow((point2.x - point1.x), 2));
  },

  midPoint: function(point1, point2) {
    return {
      x: (point1.x + point2.x)/2,
      y: (point1.y + point2.y)/2
    }
  },

  reverseVector: function(vector) {
    return {
      x: vector.x * -1,
      y: vector.y * -1
    }
  },

  equal: function(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  },

  linesIntersecting: function(a, b) {
    var d = (b[1].y - b[0].y) * (a[1].x - a[0].x) -
        (b[1].x - b[0].x) * (a[1].y - a[0].y);
    var n1 = (b[1].x - b[0].x) * (a[0].y - b[0].y) -
        (b[1].y - b[0].y) * (a[0].x - b[0].x);
    var n2 = (a[1].x - a[0].x) * (a[0].y - b[0].y) -
        (a[1].y - a[0].y) * (a[0].x - b[0].x);

    if (d === 0.0) return false;
    return n1 / d >= 0 && n1 / d <= 1 && n2 / d >= 0 && n2 / d <= 1;
  },

  pointsToLines: function(points) {
    var lines = [];
    var previous = points[0];
    for (var i = 1, len = points.length; i < len; i++) {
      lines.push([previous, points[i]]);
      previous = points[i];
    }

    lines.push([previous, lines[0][0]]); // end to beginning
    return lines;
  }

};

module.exports = geom;
},{}],7:[function(require,module,exports){
var Game = require('./game');

var startGame = function() {
  btn.removeEventListener('click', startGame);
  new Game(input.value);
}
var btn = document.getElementById('start');
var input = document.getElementById('name');
btn.addEventListener('click', startGame);

/*
window.addEventListener('load', function() {
});
*/
},{"./game":5}],8:[function(require,module,exports){
module.exports.indexOf = function(array, searchTerm, property) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i][property] === searchTerm) return i;
  }
  return -1;
}

},{}]},{},[7]);
