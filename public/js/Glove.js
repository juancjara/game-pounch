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