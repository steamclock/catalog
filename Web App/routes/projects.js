var fs = require('fs')
    , client = require('./../modules/postgres').client;
/*
 * GET list of projects by degree, and render 'em in a template
 */

exports.getListForDegree = function(req, res){
    var query = client.query('SELECT * FROM projects WHERE degree = $1', [req.params.degree], function(err, result){
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            var rows = JSON.stringify(result.rows);
            res.render('list', { title: req.params.degree, projects: rows });
        }
    });
};


/*
 * GET projects for program. Returns JSON.
 */

exports.getProjectsForDegree = function(req, res){
    console.log("Inside function to do query");
    var query = client.query('SELECT * FROM projects WHERE degree = $1', [req.params.degree], function(err, result){
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            var rows = JSON.stringify(result.rows);
            console.log(req.params.degree);
            console.log(rows);
            res.send(rows);
        }
    });
};

