var fs = require('fs')
    , async = require('async')
    , client = require('./../modules/postgres').client;

/*
 * GET a single project by id
 */

exports.getProjectById = function(req, res){
   async.waterfall([
        function(callback){
            var query = client.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);

            query.on('row', function(row, result){
                row.assets = [];
                result.addRow(row);
            })

            query.on('end', function(result){
                callback(null, result.rows, req.params.id);
            })
        },

        function(projects, projectID, callback){
            var query = client.query('SELECT * FROM assets WHERE projectid = $1', [projectID]);

            query.on('row', function(row, result){
                result.addRow(row);
            })

            query.on('end', function(result){
                callback(null, projects, result.rows);
            });    
        },

        function(projects, assets, callback){
            for (var j = assets.length - 1; j >= 0; j--) {
                var asset = assets[j], filename = asset.url.substring(asset.url.lastIndexOf('/') + 1), project = projects[0];
                //We generate the thumbnail url here, assumption is made the a thumbnail exists
                asset.thumbnailurl = "/public/images/projects/thumbnails/" + filename;
                project.assets.push(asset);
            }

            callback(null, project);
        },

        function(project, callback){
            project = JSON.stringify(project);
            res.render('single-project', { title: "Single Projects", project: project });          
        }

        ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done rendering random projects/home page");
        }
    });
};

/*
 * GET list of projects by degree, and render 'em in a template
 */

exports.getProjectsForDegree = function(req, res){
   async.waterfall([
        function(callback){
            var degree = req.params.degree.replace(/-/g, ' ');
            var query = client.query('SELECT * FROM projects WHERE degree = $1', [degree]);

            query.on('row', function(row, result){
                row.assets = [];
                result.addRow(row);
            })

            query.on('end', function(result){
                callback(null, result.rows);
            })
        },

        function(projects, callback){
            var query = client.query('SELECT * FROM assets');

            query.on('row', function(row, result){
                result.addRow(row);
            })

            query.on('end', function(result){
                callback(null, projects, result.rows);
            });    
        },

        function(projects, assets, callback){
            // Pack up object into into a sane format to send via JSON
            // TODO: This isn't going to scale well with more than a few projects
            for (var i = projects.length - 1; i >= 0; i--) {
                var project = projects[i];
                for (var j = assets.length - 1; j >= 0; j--) {
                    var asset = assets[j];

                    if (project.id === asset.projectid) {
                        //We generate the thumbnail url here, assumption is made the a thumbnail exists
                        var filename = asset.url.substring(asset.url.lastIndexOf('/') + 1)
                        asset.thumbnailurl = "/public/images/projects/thumbnails/" + filename;
                        project.assets.push(asset);
                    }
                }
            }

            callback(null, projects);
        },

        function(projects, callback){
            projects = JSON.stringify(projects);
            res.render('list', { title: "Projects By Degree", projects: projects });          
        }

        ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done rendering random projects/home page");
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
            var query = client.query('SELECT * FROM assets');

            query.on('row', function(row, result){
                result.addRow(row);
            })

            query.on('end', function(result){
                callback(null, projects, result.rows);
            });    
        },

        function(projects, assets, callback){
            // Pack up object into into a sane format to send via JSON
            // TODO: This isn't going to scale well with more than a few projects
            for (var i = projects.length - 1; i >= 0; i--) {
                var project = projects[i];

                project.degree = project.degree.replace(/\b./g, function(m){ return m.toUpperCase(); });
                
                for (var j = assets.length - 1; j >= 0; j--) {
                    var asset = assets[j];

                    if (project.id === asset.projectid) {
                        //We generate the thumbnail url here, assumption is made the a thumbnail exists
                        var filename = asset.url.substring(asset.url.lastIndexOf('/') + 1)
                        asset.thumbnailurl = "/public/images/projects/thumbnails/" + filename;
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
