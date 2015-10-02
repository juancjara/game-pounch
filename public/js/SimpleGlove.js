import drawer from './Drawer';

var SimpleGlove = function(location, name) {
  this.name = name;
  this.points = location.points;
};

SimpleGlove.prototype = {

  updateData: function(location) {
    this.points = location.points;
  },

  draw: function(screen) {
    drawer.drawLinesFromPoints(screen, this.points);
  }
}

export default SimpleGlove;
