var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('projects', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: 'string',
    author: 'string',
    email: 'string',
    website: 'string',
    degree: 'string',
    medium: 'string',
    measurements: 'string',
    token: 'string',
    published: { type: 'boolean', defaultValue: false }
  }, callback);

  db.createTable('assets', {
    id : { type: 'int', primaryKey: true, autoIncrement : true },
    projectid: 'int',
    type : 'string',
    url : 'string'
  });
};

exports.down = function(db, callback) {
  db.dropTable('projects', callback);
  db.dropTable('assets', callback);
};
