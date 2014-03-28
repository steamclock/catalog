/*
 * Projects routes
 */

var fs = require('fs')
    , async = require('async')
    , client = require('./../modules/postgres').client
    , mail = require('./../modules/mail');

/*
 * GET a single project by id
 */

exports.getProjectById = function(req, res){
   async.waterfall([
        function(callback){
            var sql = 'SELECT * FROM projects WHERE id = $1 AND published = true AND year = $2'
            var query = client.query(sql, [req.params.id, req.params.year]);

            query.on('row', function(row, result){
                row.assets = []; //Add an assets property to our results for the next phase
                result.addRow(row);
            })

            query.on('end', function(result){
                if (result.rows.length < 1) {
                    res.render('error', { title: "No project with that ID for the given year" });
                    callback(true); //Exits flow
                    console.log('here!')
                }
                callback(null, result.rows, req.params.id);
            })
        },

        function(projects, projectID, callback){
            var query = client.query('SELECT * FROM assets WHERE projectid = $1', [projectID]);

            query.on('row', function(row, result){
                result.addRow(row);
            })

            query.on('end', function(result){
                console.log('rows:');
                console.log(result.rows);
                if (result.rows.length < 1) {
                    res.render('error', { title: "No assets found for project with that ID" });
                    callback(true); //Exits flow
                }
                callback(null, projects, result.rows);
            });    
        },

        function(projects, assets, callback){
            project = projects[0];
            for (var j = 0 ; j < assets.length; j++) {             
                var asset = assets[j];
                project.assets.push(asset);
            }
            callback(null, project);
        },

        function(project, callback){
            res.render('single-project', { title: "Single Projects", project: project, year: req.params.year });        
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
            var sql = 'SELECT * FROM projects WHERE degree = $1 AND published = true AND year = $2';
            var query = client.query(sql, [degree, req.params.year]);

            query.on('row', function(row, result){
                row.assets = []; //Add an assets property to our results for the next phase
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

            for (var i = 0; i < projects.length; i++) {
                var project = projects[i];
                for (var j = 0; j < assets.length; j++) {
                    var asset = assets[j];
                    if (project.id === asset.projectid) {
                        // We generate the thumbnail url here, assumption is made the a thumbnail exists
                        // This stores a thumbnail for videos which makes no sense, but shouldn't hurt anything either
                        var filename = asset.url.substring(asset.url.lastIndexOf('/') + 1);
                        asset.thumbnailurl = "/public/images/projects/thumbnails/" + filename;
                        project.assets.push(asset);
                    }
                }
            }
            callback(null, projects);
        },

        function(projects, callback){
            res.render('list', { title: "Projects By Degree", projects: projects, year: req.params.year });          
        }

        ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done rendering random projects/home page");
        }
    });
};

exports.getProjectsSortedByAuthor = function(req, res) {

    var sql = ''
    + ' SELECT projects.*, array_to_json(array_agg(assets)) as assets'
    + ' FROM projects, assets'
    + ' WHERE '
    + '     projects.published = true AND '
    + '     projects.year = $1 AND '
    + '     projects.id = assets.projectid '
    + ' GROUP BY projects.id '
    + ' ORDER BY projects.author ASC ';

    client.query(sql, [req.params.year], function(err, result) {

        if (err) {
            console.log(err);
        } else {
            res.render('projects-simple-list', { title: "Projects By Author", projects: result.rows, year: req.params.year });
        }

    });

}


/*
 * GET projects for program. Returns JSON.
 */

exports.getProjects = function(req, res){ 
   async.waterfall([
        function(callback){
            var sql = 'SELECT  * FROM projects WHERE published = true';
            var params = [];
            if (req.params.year) {
                sql += ' AND year = $1';
                params = [req.params.year];
            }
            
            var query = client.query(sql, params);

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

                // DEAR FUTURE DEVELOPER: This was a hack while we were waiting for app store approval. 
                // The app should be modified to be case-insensitive for degree or use lower-case 

                if (project.degree === "maa") {
                    project.degree = "MAA";
                } else {
                    project.degree = project.degree.replace(/\b./g, function(m){ return m.toUpperCase(); });  
                }

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
