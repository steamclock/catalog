/*
 * Admin routes
 */

var client = require('./../modules/postgres').client
    , async = require('async');

/*
 * GET projects to be curated for admin panel
 */

exports.get = function(req, res){ 
   async.waterfall([
        function(callback){
            var query = client.query('SELECT  * FROM projects WHERE published = false'); //This should be 'true', is false for testing/building template

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
            res.render('admin', { title : "Curation Page", projects : projects });           
        }

        ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done rendering admin page");
        }
    
    });
}

/*
 * POST approval
 */

exports.approve = function(req, res){ 
    // Set project to published = true
    var response = JSON.stringify({ success : true, projectid : req.body.projectid });
    console.log(req.body);
    res.send(response);
}

/*
 * POST approval
 */

exports.reject = function(req, res){ 
    // Delete project
    var response = JSON.stringify({ success : true, projectid : req.body.projectid });
    console.log(req.body);
    res.send(response);
}
