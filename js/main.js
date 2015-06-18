(function() {
  var Game = function() {
    var screen = document.getElementById('screen').getContext('2d');
    this.size = {
      x: screen.canvas.width,
      y: screen.canvas.height
    };
    this.bodies = [new Dude(this)];
/*
    this.center = {
      x: this.size.x / 2,
      y: this.size.y / 2
    };
*/
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
      this.bodies.forEach(function(body) {
        body.update();
      })
    },

    draw: function(screen) {
      screen.clearRect(0, 0, this.size.x, this.size.y);
      this.bodies.forEach(function(body) {
        body.draw(screen);
      });
    }
  }

  var Glove = function(game, start, angle, parent) {
    this.game = game;
    this.parent = parent;
    this.velocity = geom.rotate({ x: 0, y: -1 }, { x: 0, y: 0 }, angle);
    this.angle = angle;
    this.points = [start, geom.translate(start, this.velocity)];
    this.size = {x: 4, y: 1};
    this.factorInc = 2;
    this.growDirection = 1;
    this.maxSize = 50;
    this.firstVelState = this.velocity;
  };

  Glove.prototype = {

    update: function() {
      if (!geom.equal(this.firstVelState, this.velocity) && 
          geom.equal(this.points[0], this.points[1])) {

          this.parent.moveAgain();
          this.game.removeBody(this);
          return;
      }
      if (geom.distance(this.points[0], this.points[1]) > this.maxSize) {
        this.firstVelState = this.velocity;
        this.velocity = geom.reverseVector(this.velocity);
      }
      this.points[1] = geom.translate(this.points[1], this.velocity);
      
    },

    draw: function(screen) {
      drawLinesFromPoints(screen, this.points);
    }

  }

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
    this.noMoreMoves = false;
  };

  Dude.prototype = {

    moveAgain: function() {
      this.noMoreMoves = false;
    },

    update: function() {
      if (this.noMoreMoves) return;

      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.center.y -= this.speed;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
        this.center.y += this.speed;
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.turn(-0.1);
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.turn(0.1);
      }

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
    },

    draw: function(screen) {
      drawLinesFromPoints(screen, this.points);
    }

  }

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

  window.addEventListener('load', function() {
    new Game();
  });

})();