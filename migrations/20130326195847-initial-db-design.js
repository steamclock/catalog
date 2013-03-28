var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('projects', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: 'string',
    author: 'string',
    degreetrack: 'string',
    program: 'string',
    medium: 'string',
    measurements: 'string',
    websiteurl: 'string',
    asseturl: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('projects', callback);
};
