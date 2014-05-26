'use strict';

var Bookshelf = require('bookshelf');
module.exports = Bookshelf.initialize({ client: 'pg' }).Model;
