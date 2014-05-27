'use strict';

require('should');

var Validator = require('..');
var db        = require('./db');
var Model     = db.Model;
var Promise   = require('bluebird');

before(function(done) {
  db.knex.schema.hasTable('models').then(function(exists) {
    if (exists) {
      return db.knex.schema.dropTable('models');
    }
  }).then(function() {
    return db.knex.schema.createTable('models', function(table) {
      table.increments('id').primary();
      table.string('name');
    });
  }).then(function() {
    done();
  });
});

beforeEach(function(done) {
  db.knex('models').truncate().then(function() {
    done();
  });
});

describe('Validator', function() {
  var model, validator;

  beforeEach(function() {
    model     = Model.forge();
    validator = new Validator(model, model.validations);
  });

  it('accepts custom validation messages', function() {
    validator.required('name', null, 'name must be present').catch(function(err) {
      err.should.eql('name must be present');
    });
  });

  describe('#validate', function() {
    describe('when there are no failed validations', function() {
      it('resolves the promise', function() {
        model.set('name', 'name-Clem');
        model.set('location', 'New York');

        validator.validate();
      });
    });

    describe('when there are failed validations', function() {
      it('rejects with the validation messages', function(done) {
        model.set('name', 'Jonathan Clem');

        validator.validate().catch(function(errors) {
          errors.should.eql([
            'location is required',
            '\'Jonathan Clem\' is not a valid name',
            'name must be less than 11 characters long'
          ]);

          done();
        });
      });
    });
  });

  describe('#required', function() {
    it('fails when a value is not present', function(done) {
      validator.required('name').catch(function(err) {
        err.should.eql('name is required');
        done();
      });
    });

    it('fails when a value is falsy', function(done) {
      model.set('name', NaN);

      validator.required('name').catch(function(err) {
        err.should.eql('name is required');
        done();
      });
    });

    it('passes when a value is present', function() {
      model.set('name', 'Jonathan');
      validator.required('name');
    });
  });

  describe('#match', function() {
    it('fails when values do not match', function(done) {
      model.set('name', 'x');
      model.set('name_confirmation', 'xx');

      validator.match('name', 'name_confirmation').catch(function(err) {
        err.should.eql('name must match name_confirmation');
        done();
      });
    });

    it('passes when values match', function() {
      model.set('name', 'x');
      model.set('name_confirmation', 'x');

      validator.match('name', 'name_confirmation');
    });
  });

  describe('#minLenth', function() {
    it('fails when a minimum length is not met', function(done) {
      model.set('name', 'xx');

      validator.minLength('name', 3).catch(function(err) {
        err.should.eql('name must be at least 3 characters long');
        done();
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
    it('fails when a max length is exceeded', function(done) {
      model.set('name', 'xxxx');

      validator.maxLength('name', 3).catch(function(err) {
        err.should.eql('name must be at most 3 characters long');
        done();
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
    it('tests that a pattern matches a value', function(done) {
      model.set('name', '!');

      validator.pattern('name', /^[a-z]+$/).catch(function(err) {
        err.should.eql('\'!\' is not a valid name');
        done();
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

  describe('#unique', function() {
    it('fails when a value is not unique', function(done) {
      var model2 = Model.forge({ name: 'name' });
      model.set('name', 'name');

      model2.save().then(function() {
        validator.unique('name').catch(function(err) {
          err.should.eql('name must be unique');
          done();
        });
      });
    });

    it('passes when a value is unique', function(done) {
      var model2 = Model.forge({ name: 'name' });
      model.set('name', 'name2');

      model2.save().then(function() {
        validator.unique('name').then(done);
      });
    });

    it('passes when this record is the only record', function(done) {
      model.set('name', 'name');

      model.save().then(function() {
        validator.unique('name').then(done);
      });
    });

    it('passes when the value is falsy', function(done) {
      var model2 = Model.forge({ name: 'name' });

      model2.save().then(function() {
        validator.unique('name').then(done);
      });
    });
  });
});
