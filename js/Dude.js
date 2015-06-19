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
