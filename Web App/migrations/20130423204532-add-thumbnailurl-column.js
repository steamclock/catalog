var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.addColumn('assets', 'thumbnailurl', { type : 'string' }, callback);
};

exports.down = function(db, callback) {
    db.removeColumn('assets', 'thumbnailurl', callback);
};
