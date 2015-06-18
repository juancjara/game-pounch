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
