var fs = require('fs')
    , client = require('./../modules/postgres').client;

/*
 * GET projects for program.
 */

exports.getProjectsForDegreeTrack= function(req, res){
    //console.log(req);
    var query = client.query('SELECT * FROM projects WHERE degreetrack = $1', [req.params.degreeTrack], function(err, result){
        if (err) {
            console.log(err);
            res.send({degree:req.params.degreeTrack});
        } else {

            var rows = JSON.stringify(result.rows);
            console.log(rows);
            res.send(rows);
        }
    });
};

