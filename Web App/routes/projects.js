var fs = require('fs')
    , client = require('./../modules/postgres').client;
/*
 * GET list of projects by degree, and render 'em in a template
 */

exports.getListForDegree = function(req, res){
    var query = client.query('SELECT * FROM projects WHERE degree = $1', [req.params.degree], function(err, result){
        if (err) {
            console.log(err);
            res.send({degree:req.params.degree});
        } else {
            var rows = JSON.stringify(result.rows);
            res.render('list', { title: req.params.degree, projects: rows });
        }
    });
};


/*
 * GET projects for program. Returns JSON.
 */

exports.getProjectsFordegree = function(req, res){
    var query = client.query('SELECT * FROM projects WHERE degree = $1', [req.params.degree], function(err, result){
        if (err) {
            console.log(err);
            res.send({degree:req.params.degree});
        } else {
            var rows = JSON.stringify(result.rows);
            console.log(rows);
            res.send(rows);
        }
    });
};

