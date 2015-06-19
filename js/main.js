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
