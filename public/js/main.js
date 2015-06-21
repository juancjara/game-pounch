var Game = require('./game');

var startGame = function() {
  btn.removeEventListener('click', startGame);
  new Game(input.value);
}
var btn = document.getElementById('start');
var input = document.getElementById('name');
btn.addEventListener('click', startGame);

/*
window.addEventListener('load', function() {
});
*/