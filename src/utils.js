var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var toString = objectProto.toString;
var symToStringTag = typeof Symbol != 'undefined' ? Symbol.toStringTag : undefined;

/*
* Auxiliar function for get the error attributes
* from the given path.
*/
function goToPath(path, obj) {
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


/**
 * N.B. baseGetTag(), isObject() & isFunction() are lifted straight out of Lodash,
 * with a little tweaking to conform to the coding standards in this project
 *
 * Lodash is awesome but I did not want add an extra dependency to this project!
 */

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  if (!(symToStringTag && symToStringTag in Object(value))) {
    return toString.call(value);
  }
  var isOwn = hasOwnProperty.call(value, symToStringTag);
  var tag = value[symToStringTag];
  var unmasked = false;

  try {
    value[symToStringTag] = undefined;
    unmasked = true;
  } catch (e) {}

  var result = toString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

function isObject(value) {
  var type = typeof value;

  return value != null && (type == 'object' || type == 'function');
}

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }

  var tag = baseGetTag(value);

  return tag == '[object Function]' || tag == '[object AsyncFunction]' ||
    tag == '[object GeneratorFunction]' || tag == '[object Proxy]';
}

module.exports = {
  goToPath : goToPath,
  isObject : isObject,
  isFunction : isFunction
};
