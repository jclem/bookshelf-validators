'use strict';

var connection = require('bookshelf').initialize({
  client    : 'sqlite3',
  connection: {
    filename: './test/test.sqlite'
  }
});

exports.knex  = connection.knex;
exports.Model = connection.Model.extend({
  tableName: 'models',
  validations: {
    location: {
      required: true
    },

    name: {
      pattern  : /^name-/,
      maxLength: {
        testValue: 10,
        message  : 'name must be less than 11 characters long'
      }
    }
  }
});
