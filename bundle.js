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

var Dude = function(game, center) {
  this.game = game;
  this.angle = 0;
  this.size = {x: 25, y: 25};
  this.center = center;
  this.points = [
    {x: this.center.x - this.size.x/2, y: this.center.y - this.size.y/2, color: 'red'},
    {x: this.center.x + this.size.x/2, y: this.center.y - this.size.y/2, color: 'yellow'},
    {x: this.center.x + this.size.x/2, y: this.center.y + this.size.y/2, color: 'black'},
    {x: this.center.x - this.size.x/2, y: this.center.y + this.size.y/2, color: 'blue'}
  ];
  this.keyboarder = new Keyboarder();
  this.velocity = { x: 0, y: 0 };
  this.noMoreMoves = false;
  this.possibleMoves = [
    {
      keys: [this.keyboarder.KEYS.UP, this.keyboarder.KEYS.RIGHT],
      velocity: {x: 1, y: -1},
      angle: Math.PI * 0.25
    },
    {
      keys: [this.keyboarder.KEYS.DOWN, this.keyboarder.KEYS.RIGHT],
      velocity: {x: 1, y: 1},
      angle: Math.PI * 0.75
    },
    {
      keys: [this.keyboarder.KEYS.UP, this.keyboarder.KEYS.LEFT],
      velocity: {x: -1, y: -1},
      angle: Math.PI * 1.75
    },
    {
      keys: [this.keyboarder.KEYS.DOWN, this.keyboarder.KEYS.LEFT],
      velocity: {x: -1, y: 1},
      angle: Math.PI * 1.25
    },
    {
      keys: [this.keyboarder.KEYS.UP],
      velocity: {x: 0, y: -1},
      angle: 0
    },
    {
      keys: [this.keyboarder.KEYS.DOWN],
      velocity: {x: 0, y: 1},
      angle: Math.PI
    },
    {
      keys: [this.keyboarder.KEYS.RIGHT],
      velocity: {x: 1, y: 0},
      angle: Math.PI * 0.5
    },
    {
      keys: [this.keyboarder.KEYS.LEFT],
      velocity: {x: -1, y: 0},
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

  moveAgain: function() {
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
      var gloveCenter = {
        x: this.center.x,
        y: this.center.y - this.size.y/2 - 1
      }
      var midPoint = geom.midPoint(this.points[0], this.points[1]);
      this.noMoreMoves = true;
      this.game.addBody(new Glove(this.game,
                                  midPoint,
                                  this.angle, 
                                  this));
      console.log('hit');
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

},{"./Drawer":1,"./Glove":3,"./Keyboarder":4,"./geom":5}],3:[function(require,module,exports){
var drawer = require('./Drawer');
var geom = require('./geom');

var Glove = function(game, start, angle, parent) {
  this.game = game;
  this.parent = parent;
  this.velocity = geom.rotate({x: 0, y: -1}, { x: 0, y: 0 }, angle);
  this.angle = angle;
  this.points = [start, geom.translate(start, this.velocity)];
  this.factorInc = 2;
  this.growDirection = 1;
  this.maxSize = 40;
  this.size = this.maxSize;
  this.firstVelState = this.velocity;
};

Glove.prototype = {

  update: function() {
    if (this.size <= 0) {
      this.parent.moveAgain();
      this.game.removeBody(this);
      return;
    }
    if (this.shouldReduce) {
      this.size--;
    }
    if (geom.distance(this.points[0], this.points[1]) > this.maxSize) {
      this.firstVelState = this.velocity;
      this.shouldReduce = true;
      this.velocity = geom.reverseVector(this.velocity);
    }
    this.points[1] = geom.translate(this.points[1], this.velocity);
    
  },

  draw: function(screen) {
    drawer.drawLinesFromPoints(screen, this.points);
  }

}

module.exports = Glove;
},{"./Drawer":1,"./geom":5}],4:[function(require,module,exports){
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

  this.KEYS = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32, CTRL: 17};
};

module.exports = Keyboarder;
},{}],5:[function(require,module,exports){
var geom = {
  translate: function(point, translation) {
    return { x: point.x + translation.x, y: point.y + translation.y, color: point.color };
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
    return Math.sqrt(Math.pow((point2.y - point1.y), 2) + Math.pow((point2.x - point1.x), 2));
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
  }
};

module.exports = geom;
},{}],6:[function(require,module,exports){
var Dude = require('./Dude');

var Game = function() {
  var screen = document.getElementById('screen').getContext('2d');
  this.size = {
    x: screen.canvas.width,
    y: screen.canvas.height
  };

  this.bodies = [new Dude(this, {x: 300, y: 300})];

  var self = this;
  var tick = function() {
    self.update();
    self.draw(screen);
    requestAnimationFrame(tick);
  }

  tick();
};

Game.prototype = {

  removeBody: function(body) {
    var bodyIndex = this.bodies.indexOf(body);
    if (bodyIndex !== -1) {
      this.bodies.splice(bodyIndex, 1);
    }
  },

  addBody: function(body) {
    this.bodies.push(body);
  },

  update: function() {
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      this.bodies[i].update();
    };
  },

  draw: function(screen) {
    screen.clearRect(0, 0, this.size.x, this.size.y);
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      this.bodies[i].draw(screen);
    };
  }
}


window.addEventListener('load', function() {
  var game = new Game();
});

},{"./Dude":2}]},{},[6]);
