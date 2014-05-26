'use strict';

require('should');

var Validator = require('..');
var Model     = require('./model');
var Promise   = require('bluebird');

describe('Validator', function() {
  var model, validator;

  beforeEach(function() {
    model     = Model.forge({ errors: [] });
    validator = new Validator(model);
  });

  describe('#required', function() {
    it('fails when a value is not present', function() {
      validator.required('name').catch(function() {
        model.get('errors').should.eql(['name is required']);
      });
    });

    it('fails when a value is falsy', function() {
      model.set('name', NaN);

      validator.required('name').catch(function() {
        model.get('errors').should.eql(['name is required']);
      });
    });

    it('passes when a value is present', function() {
      model.set('name', 'Jonathan');

      validator.required('name').then(function() {
        model.get('errors').should.eql([]);
      });
    });
  });

  describe('#match', function() {
    it('fails when values do not match', function() {
      model.set('foo', 'x');
      model.set('foo_confirmation', 'xx');

      validator.match('foo', 'foo_confirmation').then(null, function() {
        model.get('errors').should.eql(['foo must match foo_confirmation']);
      });
    });

    it('passes when values match', function() {
      model.set('foo', 'x');
      model.set('foo_confirmation', 'x');

      validator.match('foo', 'foo_confirmation').then(function() {
        model.get('errors').should.eql([]);
      });
    });
  });

  describe('#minLenth', function() {
    it('fails when a minimum length is not met', function() {
      model.set('name', 'xx');

      validator.minLength('name', 3).catch(function() {
        model.get('errors').should.eql(['name must be at least 3 characters long']);
      });
    });

    it('passes when a value is falsy', function() {
      model.set('name', '');

      validator.minLength('name', 3).then(function() {
        model.get('errors').should.eql([]);
      });
    });

    it('passes when a minimum length is met', function() {
      model.set('name', 'xxx');

      validator.minLength('name', 3).then(function() {
        model.get('errors').should.eql([]);
      });
    });
  });
});
