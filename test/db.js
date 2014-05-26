'use strict';

var connection = require('bookshelf').initialize({
  client    : 'sqlite3',
  connection: {
    filename: './test/test.sqlite'
  }
});

exports.knex  = connection.knex;
exports.Model = connection.Model.extend({
  tableName: 'models'
});
