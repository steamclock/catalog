var fs = require('fs')
    , async = require('async')
    , client = require('./../modules/postgres').client;
/*
 * GET list of projects by degree, and render 'em in a template
 */

exports.getListForDegree = function(req, res){

    // TODO: Note that this is out of date, probably needs to be refactored.
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

exports.getProjects = function(req, res){ 
   async.waterfall([
        function(callback){
            var query = client.query('SELECT  * FROM projects');

            query.on('row', function(row, result){
                row.assets = [];
                result.addRow(row);
            })

            query.on('end', function(result){
                callback(null, result.rows);
            })
        },

        function(projects, callback){
            var query = client.query('SELECT  * FROM assets');

            query.on('row', function(row, result){
                result.addRow(row);
            })

            query.on('end', function(result){
                callback(null, projects, result.rows);
            });    
        },

        function(projects, assets, callback){
            // Pack up object into into a sane format to send via JSON
            for (var i = projects.length - 1; i >= 0; i--) {
                var project = projects[i];
                for (var i = assets.length - 1; i >= 0; i--) {
                    var asset = assets[i];

                    if (project.id === asset.projectid) {
                        project.assets.push(asset);
                    }
                }
            }

            callback(null, projects);
        },

        function(projects, callback){
            projects = JSON.stringify(projects);
            res.send(projects);            
        }

        ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done sending JSON");
        }
    
    });
};
