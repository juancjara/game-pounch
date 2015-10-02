import Game from './game';

let btn = document.getElementById('start');
let input = document.getElementById('name');

let startGame = function() {
  btn.removeEventListener('click', startGame);
  new Game(input.value);
};

btn.addEventListener('click', startGame);

/*
window.addEventListener('load', function() {
});
*/
