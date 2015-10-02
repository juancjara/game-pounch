import drawer from './Drawer';
import geom from './geom';

var Glove = function(game, start, angle, parent) {
  this.game = game;
  this.name = 'glove' + parent.name;
  this.parent = parent;
  this.velocity = geom.rotate({x: 0, y: -1}, { x: 0, y: 0 }, angle);
  this.angle = angle;
  this.points = [start, geom.translate(start, this.velocity)];
  this.factorInc = 2;
  this.growDirection = 1;
  this.maxSize = 40;
  this.size = this.maxSize;
};

Glove.prototype = {

  collision: function(otherBody) {
    if (otherBody.name && otherBody.name !== this.parent.name) {
      this.reverse();
      console.log(this.size, 'het', this.shouldReduce);
      this.game.removePlayer(otherBody.name);
    }
  },

  serialize: function() {
    return {
      name: this.name,
      location: {
        points: this.points
      }
    }    
  },

  reverse: function() {
    this.shouldReduce = true;
    this.velocity = geom.reverseVector(this.velocity);
  },

  update: function() {
    if (this.size <= 0) {
      this.parent.moveAgain();
      this.game.removeBody(this);
      return;
    }
    
    if (this.shouldReduce) {
      this.size--;
    }

    if (!this.shouldReduce &&
        geom.distance(this.points[0], this.points[1]) > this.maxSize) {      
      this.reverse();
    }
    this.points[1] = geom.translate(this.points[1], this.velocity);
    
  },

  draw: function(screen) {
    drawer.drawLinesFromPoints(screen, this.points);
  }

}

export default Glove;
