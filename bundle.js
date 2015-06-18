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

var delta = 5;

var Dude = function(game) {
  this.game = game;
  this.angle = 0;
  this.size = {x: 50, y: 50};
  this.center = {x: 200, y: 300};
  this.points = [
    {x: this.center.x - this.size.x/2, y: this.center.y - this.size.y/2, color: 'red'},
    {x: this.center.x + this.size.x/2, y: this.center.y - this.size.y/2, color: 'yellow'},
    {x: this.center.x + this.size.x/2, y: this.center.y + this.size.y/2, color: 'black'},
    {x: this.center.x - this.size.x/2, y: this.center.y + this.size.y/2, color: 'blue'}
  ];
  this.keyboarder = new Keyboarder();
  this.speed = 2;
  this.velocity = { x: 0, y: 0 };
  this.noMoreMoves = false;
  this.degrees = toDegrees(this.angle);
  console.log(this.degrees);
};

var moveBody = function(body, center) {
  var translation = geom.vectorTo(body.center, center);
  body.center = center;
  body.points = body.points.map(function(x) { return geom.translate(x, translation); });
};

var toDegrees = function(rad) {
  var degrees = 180 / Math.PI * rad;
  if (degrees > 360 || degrees < 0)  degrees = degrees % 360;
  if (degrees < 0) degrees = Math.abs(360 - Math.abs(degrees));
  return degrees;
}

Dude.prototype = {

  moveAgain: function() {
    this.noMoreMoves = false;
  },

  turnLeft: function() {
    this.turn(-0.1);
  },

  turnRight: function() {
    this.turn(0.1);
  },

  move: function() {
    this.velocity = geom.translate(this.velocity,
                                   geom.rotate({ x: 0, y: -0.01 }, { x: 0, y: 0 }, this.angle));
    moveBody(this, geom.translate(this.center, this.velocity));
  },

  update: function() {
    var rigthup = 0;
    if (this.noMoreMoves) return;

    if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
      
      if (this.degrees >= (360.0 - delta) || this.degrees <= (0.0 + delta) ) {
        this.velocity.x = 0;
        this.turn(0 - this.angle);
      } else if (this.degrees <= 180.0) {
        this.turnLeft();
      }
      else {
        this.turnRight();
      }
      rigthup++;
      this.move();
    } else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {

      if (this.degrees >= (180.0 - delta) && this.degrees <= (180.0 + delta) ) {
        this.velocity.x = 0;
        this.turn(Math.PI - this.angle);
      } else if (this.degrees <= 180.0) {
        this.turnRight();
      }
      else {
        this.turnLeft();
      }
      this.move();

    }

    if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {

      if (this.degrees >= (270.0 - delta) && this.degrees <= (270.0 + delta) ) {
        this.velocity.y = 0;
        this.turn(Math.PI * 1.5 - this.angle);
      } else if (this.degrees >= 180.0 && this.degrees <= 270.0) {
        this.turnRight();
      }
      else {
        this.turnLeft();
      }
      this.move();

    } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
      rigthup++;
      if (this.degrees >= (90.0 - delta) && this.degrees <= (90.0 + delta) ) {
        this.velocity.y = 0;
        this.turn(Math.PI * 0.5 - this.angle);
      } else if (this.degrees >= 270.0 || this.degrees <= 90.0) {
        this.turnRight();
      }
      else {
        this.turnLeft();
      }

      this.move();
    }
    if (rigthup === 2) {console.log('both')}
    if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
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
    }

  },

  turn: function(angleDelta) {
    var center = this.center;
    this.points = this.points.map(function(x) { return geom.rotate(x, center, angleDelta); });
    this.angle += angleDelta;
    this.degrees = toDegrees(this.angle);
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
  this.maxSize = 50;
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

  this.KEYS = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32};
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

  this.bodies = [new Dude(this)];

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
  new Game();
});

},{"./Dude":2}]},{},[6]);
