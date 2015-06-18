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