'use strict';

var Promise = require('bluebird');

/**
 * Class responsible for validating the attributes of a model. Calling methods
 * on a will push error messages into `record.get('errors')`, when appropriate.
 * All validation methods (async or not) return [Bluebird][bluebird] promises.
 *
 * [bluebird]: https://github.com/petkaantonov/bluebird
 *
 * @class Validator
 * @constructor
 * @param {Model} record the Bookshelf.js model to be validated
 * @example
 *     var group     = Group.forge({ name: 'group-name' });
 *     var validator = new Validator(group);
 *
 *     validator.required('name').then(function() {
 *       // the validation passed
 *     }, function() {
 *       // the validation failed
 *     });
 */
function Validator(record) {
  this.record = record;
}

/**
 * Validate that a required field is present. Simply tests the truthiness of
 * the value, so `0` and `[]` will fail validation.
 *
 * @method required
 * @param {String} attribute the attribute to be tested for presence
 * @param {Boolean} testValue an unused argument for consistent function
 *   signatures
 * @param {String} [message] an error message to use other than the default
 * @return {Promise} a rejected or resolved promise, based on whether the given
 *   attribute is present
 */
Validator.prototype.required = function(attribute, testValue, message) {
  var value = this.record.get(attribute);

  if (!message) {
    message = fmt('#{attribute} is required', attribute);
  }

  if (!value) {
    return Promise.reject(message);
  } else {
    return Promise.resolve();
  }
};

/**
 * Validate that a field matches another field.
 *
 * @method match
 * @param {String} attribute the attribute to be tested for matching
 * @param {Number} testValue the attribute to be compared to
 * @return {Promise} a promise resolved when the comparison is equal
 */
Validator.prototype.match = function(attribute, testValue, message) {
  var value      = this.record.get(attribute);
  var matchValue = this.record.get(testValue);

  if (!message) {
    message = fmt('#{attribute} must match #{testValue}', attribute, testValue);
  }

  if (value !== matchValue) {
    return Promise.reject(message);
  } else {
    return Promise.resolve();
  }
};

/**
 * Validate that a field has a minumum length. This method ignores
 * non-truthy values, so to prevent empty strings, a field must be `required`,
 * not set to `minLength` of `1`.
 *
 * @method minLength
 * @param {String} attribute the attribute to be tested for minimum length
 * @param {Number} testValue the minimum length to ensure values are
 * @param {String} [message] an error message to use other than the default
 * @return {Promise} a rejected or resolved promise, based on whether the given
 *   attribute is of the minimum length
 */
Validator.prototype.minLength = function(attribute, testValue, message) {
  var value = this.record.get(attribute);

  if (!value) {
    return Promise.resolve();
  }

  if (!message) {
    message = fmt('#{attribute} must be at least #{testValue} characters long', attribute, testValue);
  }

  if (value.length < testValue) {
    return Promise.reject(message);
  } else {
    return Promise.resolve();
  }
};

/**
 * Validate that a field is not over a max length. This method ignores
 * non-truthy values.
 *
 * @method max
 * @param {String} attribute the attribute to be tested for maximum length
 * @param {Number} testValue the maximum length to ensure values are
 * @param {String} [message] an error message to use other than the default
 * @return {Promise} a rejected or resolved promise, based on whether the given
 *   attribute is less than or equal to the maximum length
 */
Validator.prototype.maxLength = function(attribute, testValue, message) {
  var value = this.record.get(attribute);

  if (!value) {
    return Promise.resolve();
  }

  if (!message) {
    message = fmt('#{attribute} must be at most #{testValue} characters long', attribute, testValue);
  }

  if (value.length > testValue) {
    return Promise.reject(message);
  } else {
    return Promise.resolve();
  }
};

/**
 * Validate that a field matches a specified pattern.
 *
 * @method pattern
 * @param {String} attribute the attribute to be tested for a pattern match
 * @param {RegExp} testValue the pattern to test the attribute against
 * @param {String} [message] an error message to use other than the default
 * @return {Promise} a rejected or resolved promise, based on whether the given
 *   attribute matches the given pattern
 */
Validator.prototype.pattern = function(attribute, testValue, message) {
  var value = this.record.get(attribute);

  if (!value) {
    return Promise.resolve();
  }

  if (!message) {
    message = fmt('\'#{value}\' is not a valid #{attribute}', value, attribute);
  }

  if (!value.match(testValue)) {
    return Promise.reject(message);
  } else {
    return Promise.resolve();
  }
};

/**
 * Format a string.
 *
 * @method fmt
 * @private
 * @static
 * @example
 *     var result = fmt('#{attribute} is required', 'name');
 *     result; // 'name is required'
 */
function fmt() {
  var args   = Array.prototype.slice.call(arguments, 0);
  var string = args[0];
  var values = args.slice(1);
  var i      = 0;
  var match, replace;

  while ((match = /(#{[^}]*})/.exec(string))) {
    string = string.replace(match[0], values[i]);
    i++;
  }

  return string;
}

module.exports = Validator;
