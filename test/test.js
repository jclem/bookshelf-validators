'use strict';

require('should');

var Validator = require('..');
var Model     = require('./model');
var Promise   = require('bluebird');

describe('Validator', function() {
  var model, validator;

  beforeEach(function() {
    model     = Model.forge();
    validator = new Validator(model);
  });

  describe('#required', function() {
    it('fails when a value is not present', function() {
      validator.required('name').catch(function(err) {
        err.should.eql('name is required');
      });
    });

    it('fails when a value is falsy', function() {
      model.set('name', NaN);

      validator.required('name').catch(function(err) {
        err.should.eql('name is required');
      });
    });

    it('passes when a value is present', function() {
      model.set('name', 'Jonathan');
      validator.required('name');
    });
  });

  describe('#match', function() {
    it('fails when values do not match', function() {
      model.set('foo', 'x');
      model.set('foo_confirmation', 'xx');

      validator.match('foo', 'foo_confirmation').catch(function(err) {
        err.should.eql('foo must match foo_confirmation');
      });
    });

    it('passes when values match', function() {
      model.set('foo', 'x');
      model.set('foo_confirmation', 'x');

      validator.match('foo', 'foo_confirmation');
    });
  });

  describe('#minLenth', function() {
    it('fails when a minimum length is not met', function() {
      model.set('name', 'xx');

      validator.minLength('name', 3).catch(function(err) {
        err.should.eql('name must be at least 3 characters long');
      });
    });

    it('passes when a value is falsy', function() {
      model.set('name', '');
      validator.minLength('name', 3);
    });

    it('passes when a minimum length is met', function() {
      model.set('name', 'xxx');
      validator.minLength('name', 3);
    });
  });

  describe('#maxLength', function() {
    it('fails when a max length is exceeded', function() {
      model.set('name', 'xxxx');

      validator.maxLength('name', 3).catch(function(err) {
        err.should.eql('name must be at most 3 characters long');
      });
    });

    it('passes when a max length is not met', function() {
      model.set('name', 'xx');
      validator.maxLength('name', 3);
    });

    it('passes when a max length met', function() {
      model.set('name', 'xxx');
      validator.maxLength('name', 3);
    });

    it('passes when a value is falsy', function() {
      model.set('name', '');
      validator.maxLength('name', 3);
    });
  });

  describe('#pattern', function() {
    it('tests that a pattern matches a value', function() {
      model.set('name', '!');

      validator.pattern('name', /^[a-z]+$/).catch(function(err) {
        err.should.eql('\'!\' is not a valid name');
      });
    });

    it('ignores a valid value', function() {
      model.set('name', 'name');
      validator.pattern('name', /^[a-z]+$/);
    });

    it('ignores an empty value', function() {
      model.set('name', null);
      validator.pattern('name', /^[a-z]+$/);
    });
  });
});
