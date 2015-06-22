var geom = {
  translate: function(point, translation) {
    return { 
      x: point.x + translation.x, 
      y: point.y + translation.y, 
      color: point.color 
    };
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
    return Math.sqrt(Math.pow((point2.y - point1.y), 2) +
           Math.pow((point2.x - point1.x), 2));
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
  },

  linesIntersecting: function(a, b) {
    var d = (b[1].y - b[0].y) * (a[1].x - a[0].x) -
        (b[1].x - b[0].x) * (a[1].y - a[0].y);
    var n1 = (b[1].x - b[0].x) * (a[0].y - b[0].y) -
        (b[1].y - b[0].y) * (a[0].x - b[0].x);
    var n2 = (a[1].x - a[0].x) * (a[0].y - b[0].y) -
        (a[1].y - a[0].y) * (a[0].x - b[0].x);

    if (d === 0.0) return false;
    return n1 / d >= 0 && n1 / d <= 1 && n2 / d >= 0 && n2 / d <= 1;
  },

  pointsToLines: function(points) {
    var lines = [];
    var previous = points[0];
    for (var i = 1, len = points.length; i < len; i++) {
      lines.push([previous, points[i]]);
      previous = points[i];
    }

    lines.push([previous, lines[0][0]]); // end to beginning
    return lines;
  }

};

module.exports = geom;