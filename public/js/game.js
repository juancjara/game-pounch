var Dude = require('./Dude');
//var socket = require('./socket');
var socket = io();

var Game = function(name) {
  this.myName = name;
  this.players = {};
  this.bodies = [];
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
  


  var someoneElse = new Dude(this, testData, false);
  this.players['lel'] = someoneElse;
  this.bodies = [someoneElse];
*/


  socket.emit('join', name);
  socket.on('new players', function(players) {
    console.log('new players');
    for (var k in players) {
      if (!(k in self.players)) {
        var player = new Dude(self, players[k].location, self.myName === k);
        self.bodies.push(player);
        self.players[k] = player;
      }
    }
  })

  socket.on('update player', function(updatePlayer) {
    self.players[updatePlayer.name].updateStatus(updatePlayer.location);
  });

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

  removePlayer: function(name) {
    this.removeBody(this.players[name]);
    delete this.players[name];
  },

  addBody: function(body) {
    this.bodies.push(body);
  },

  update: function() {
    
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      this.bodies[i].update();
    };
    
    if (this.myName in this.players) {
      var newData = {
        name: this.myName,
        location: this.players[this.myName].serialize()
      };
      socket.emit('update server', newData);
    }
  },

  draw: function(screen) {
    screen.clearRect(0, 0, this.size.x, this.size.y);
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      this.bodies[i].draw(screen);
    };
  }
}

module.exports = Game;