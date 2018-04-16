/*
 * List/display projects routes
 */

var client = require('./../modules/postgres').client
    , async = require('async');

/*
 * GET home page.
 */

exports.home = function(req, res){
   async.waterfall([
        function(callback){
            var sql = 'SELECT * FROM projects WHERE published = true AND year = $1 ORDER BY random() LIMIT 50'
            var query = client.query(sql, [req.params.year]);

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
            for (var i = 0; i < projects.length; i++) {
                var project = projects[i];
                for (var j = 0; j < assets.length; j++) {
                    var asset = assets[j];

                    if (project.id === asset.projectid) {
                        //We generate the thumbnail url here, assumption is made the a thumbnail exists
                        // This stores a thumbnail for videos which makes no sense, but shouldn't hurt anything either;
                        var filename = asset.url.substring(asset.url.lastIndexOf('/') + 1);
                        asset.thumbnailurl = "/public/images/projects/thumbnails/" + filename;
                        project.assets.push(asset);
                    }
                }
            }

            callback(null, projects);
        },

        function(projects, callback){
            res.locals.ecuad.selectedYear = req.params.year;
            res.render('list', { title: "Home Page", projects: projects});
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
 * GET about page.
 */

 exports.about = function(req, res){
    res.locals.ecuad.selectedYear = req.params.year;
    res.render('about', { title: 'About The Grad Catalog' });
 };
