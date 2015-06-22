module.exports.indexOf = function(array, searchTerm, property) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i][property] === searchTerm) return i;
  }
  return -1;
}
