var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var toString = objectProto.toString;
var symToStringTag = typeof Symbol != 'undefined' ? Symbol.toStringTag : undefined;

var get = require('lodash.get');

/*
* Auxiliar function for extracting an APIError argument from the
* given `data` using the given "formatter"
*
* @param {String|Function|undefined)  formatter  - either a string used to "get" the property-path,
*                                                  or a custom function (data is passed to it)
* @param {Object|null}                data       - a data object, assumed to be the response body
* @param {mixed|Array[mixed])         defaults   - a default value, or an array of defaults values.
*                                                  used if no value could be extracted from `data` using the `formatter`
*                                                  (e.g. if data is empty or the formatter is undefined),
*                                                  in the case of multiple defaults the first TRUTHY value is used.
*
* @return {String}
*/
function resolveAPIErrorArg(formatter, data, defaults)
{
  var val, def;
  var defs = Array.isArray(defaults) ? defaults : [defaults];

  if (formatter && data) {
    switch (typeof formatter) {
      case 'function':
        val = formatter(data);
        break;
      case 'string':
        val = get(data, formatter);
        break;
    }
  }

  while (!val && defs.length) {
    val = defs.shift();
  }

  if (val && (typeof val === 'object'))
    val = JSON.stringify(val);

  return (val || '') + '';
}

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
  resolveAPIErrorArg : resolveAPIErrorArg,
  isObject : isObject,
  isFunction : isFunction
};
