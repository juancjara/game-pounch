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

let drawer = function() {};
drawer.drawRect = drawRect;
drawer.drawLinesFromPoints = drawLinesFromPoints;

export default drawer;
