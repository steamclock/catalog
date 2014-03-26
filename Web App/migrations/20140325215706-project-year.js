var dbm = require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {
    async.series([
        db.runSql.bind(db, 
              " ALTER TABLE projects"
            + " ADD COLUMN year character varying"
        ),
        db.runSql.bind(db, 
              " UPDATE projects"
            + " SET year = '2013'"
        ),
        db.runSql.bind(db, 
              " ALTER TABLE projects"
            + " ALTER COLUMN year SET NOT NULL"
        )
    ], callback);
};

exports.down = function(db, callback) {
    async.series([
        db.removeColumn.bind(db, 'projects', 'year'),
    ], callback);
};