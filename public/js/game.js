import Dude from './Dude';
import Player from './Player';
import geom from './geom';
import SimpleGlove from './SimpleGlove';

let socket = io();

let Game = function(name) {
  this.myName = name;
  this.bodies = [];

  var screen = document.getElementById('screen').getContext('2d');

  this.size = {
    x: screen.canvas.width,
    y: screen.canvas.height
  };

  let position = {
    center: {x: 300,y: 200},
    points: [
      {x: 275, y: 175, color: 'red'},
      {x: 325, y: 175, color: 'yellow'},
      {x: 325, y: 225, color: 'green'},
      {x: 275, y: 225, color: 'black'}
    ],
    angle: 0
  };

  this.bodies.push(new Dude(this, position, 'name'));

  var tick = () => {
    this.update();
    this.draw(screen);
    requestAnimationFrame(tick);
  };
  tick();
};

Game.prototype = {

  update: function() {
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].update();
    }
  },

  draw: function(screen) {
    screen.clearRect(0, 0, this.size.x, this.size.y);
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].draw(screen);
    }
  }
};

var anyLinesIntersecting = function(lines1, lines2) {
    for (var i = 0, len1 = lines1.length; i < len1; i++) {
      for (var j = 0, len2 = lines2.length; j < len2; j++) {
        if (geom.linesIntersecting(lines1[i], lines2[j])) {
          return true;
        }
      }
    }

    return false;
};

var isColliding = function(b1, b2) {
  if (b1 === b2) return false;

  var lines1 = geom.pointsToLines(b1.points);
  var lines2 = geom.pointsToLines(b2.points);

  return anyLinesIntersecting(lines1, lines2);
};

var reportCollisions = function(bodies) {
  var collisions = [];
  for (var i = 0; i < bodies.length; i++) {
    for (var j = i + 1; j < bodies.length; j++) {
      if (isColliding(bodies[i], bodies[j])) {
        collisions.push([bodies[i], bodies[j]]);
      }
    }
  }

  for (var i = 0; i < collisions.length; i++) {
    if (collisions[i][0].collision !== undefined) {
      collisions[i][0].collision(collisions[i][1]);
    }

    if (collisions[i][1].collision !== undefined) {
      collisions[i][1].collision(collisions[i][0]);
    }
  }
};

export default Game;
