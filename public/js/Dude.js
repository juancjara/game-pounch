import Keyboarder from './Keyboarder';
import drawer from './Drawer';
import geom from './geom';
import Glove from './Glove';

var Dude = function(game, location, name) {
  console.log('Dude', name);
  this.name = name;
  this.game = game;
  this.glove;
  this.angle = location.angle;
  this.size = {x: 50, y: 50};
  this.center = location.center;
  this.points = location.points;
  this.keyboarder = new Keyboarder();
  this.velocity = { x: 0, y: 0 };
  this.noMoreMoves = false;
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
      name: this.name, 
      location: {
        center: this.center,
        points: this.points,
        angle: this.angle
      }
    }
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
      var midPoint = geom.midPoint(this.points[0], this.points[1]);
      this.noMoreMoves = true;
      this.glove = new Glove(this.game, midPoint, this.angle, this);
      this.game.addThing(this.glove);
      console.log('launch glove');
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

export default Dude;
