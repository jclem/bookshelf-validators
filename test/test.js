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

  describe('#minLenth', function() {
    it('tests a minimum length', function() {
      model.set('name', 'xx');

      validator.minLength('name', 3).catch(function() {
        model.get('errors').should.eql(['name must be at least 3 characters long']);
      });
    });

    it('ignores a falsy value', function() {
      model.set('name', '');

      validator.minLength('name', 3).then(function() {
        model.get('errors').should.eql([]);
      });
    });

    it('ignores a valid value', function() {
      model.set('name', 'xxx');

      validator.minLength('name', 3).then(function() {
        model.get('errors').should.eql([]);
      });
    });

    it('ignores an empty value', function() {
      model.set('name', null);

      validator.minLength('name', 3).then(function() {
        model.get('errors').should.eql([]);
      });
    });
  });
});
