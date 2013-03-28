var fs = require('fs')
    , client = require('./../modules/postgres').client;
/*
 * GET list of projects by degree, and render 'em in a template
 */

exports.getListForDegreeTrack = function(req, res){
    var query = client.query('SELECT * FROM projects WHERE degreetrack = $1', [req.params.degreeTrack], function(err, result){
        if (err) {
            console.log(err);
            res.send({degree:req.params.degreeTrack});
        } else {
            var rows = JSON.stringify(result.rows);
            res.render('list', { title: req.params.degreeTrack, projects: rows });
        }
    });
};


/*
 * GET projects for program. Returns JSON.
 */

exports.getProjectsForDegreeTrack = function(req, res){
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

