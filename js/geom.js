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

module.exports = geom;