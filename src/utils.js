/*
* Auxiliar function for get the error attributes
* from the given path.
*/
module.exports = function goToPath(path, obj) {
  var current = obj;
  var keys = path.split('.');
  var currentKey;

  while (currentKey = keys.shift()) {
    if (typeof current === 'object' &&
      current.hasOwnProperty(currentKey)) {
        current = current[currentKey];
      }
  }
  return current;
};
