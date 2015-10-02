import drawer from './Drawer';

var Player = function(location, name) {
  console.log('Player', name);
  this.name = name;
  this.points = location.points;
};

Player.prototype = {

  updateData: function(location) {
    this.points = location.points;
  },

  draw: function(screen) {
    drawer.drawLinesFromPoints(screen, this.points);
  }

};

export default Player;
