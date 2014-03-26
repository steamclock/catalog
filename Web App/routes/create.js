/*
 * Create routes
 */

var fs = require('fs')
    , client = require('./../modules/postgres').client
    , mail = require('./../modules/mail')
    , crypto = require('crypto')
    , async = require('async')
    , imagemagick = require('imagemagick')
    , flash = require('flashify')
    , path = require('path')
    , appDir = path.dirname(require.main.filename)
    , images = require('./../modules/images')
    , moment = require('moment');
    
/*
 * POST form to create new project
 */

exports.new = function(req, res){
    var email = req.body.email, salty = crypto.randomBytes(256); token = crypto.createHash('md5').update(salty).digest("hex");
    async.waterfall([
        function(callback){
            // Check if email already exists in DB
            var query = client.query("SELECT 1 FROM projects where email = $1 limit 1", [req.body.email]);

            query.on('row', function (row, result){
                result.addRow(row);
            });
            query.on('error', function(error){
                console.log("ERROR:" + error);
                res.render('done', { title: 'ERROR EMAIL ALREADY IN DB' });
            });
            query.on('end', function (result){
                if (result.rows.length > 0){
                    res.redirect('/create/denied');
                    callback(true); //exits waterfall
                } else {
                    callback(null);
                }
            });  
        },

        function(callback){
            // Reject the user and pop them back to the form if they did not have the right image dimensions 
            // (file size is validated on client side)
            req.files.images.forEach(function(file){

                async.waterfall([
                    function(callback){
                        var accept;
                        function accept(bool){
                            accept = bool;
                        }
                        images.checkImg(file, accept);
                        callback(null, accept);
                    },
                    function(accept, callback){
                        var formValues;
                        if (!accept){
                            res.flash('message','One of your images did not meet the minimum dimensions. Please verify the dimensions of all of your assets.');
                            res.render('create/create', { title : "Error in submission", formData : formValues });
                            callback(true); //Exits waterfall
                        } else {
                            callback(null);
                        }
                    }
                ], function (err, result) {
                   // result now equals 'done'    
                });
            });

            callback(null);
        },

        function(callback){
            // Insert into the projects table
            var degree = req.body.degree.toLowerCase();
            var query = client.query(
                "INSERT INTO projects(title, author, email, website, degree, medium, measurements, token, year) values($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
                [req.body.title, req.body.author, req.body.email, req.body.website, degree, req.body.medium, req.body.measurements, token, moment().year()]
            );

            query.on('row', function (row, result){
                result.addRow(row);
            });

            query.on('error', function(error){
                console.log("ERROR:" + error);
            });

            query.on('end', function (result){
                callback(null, result.rows[0].id);
            });
        },

        function(projectID, callback){
             // Iterate over files and insert into assets table as well as move files to appropriate location
            req.files.images.forEach(function(file) {
                if (file.name) {
                    var tmpPath = file.path
                    , salty = crypto.randomBytes(256)
                    , uniqueness = crypto.createHash('md5').update(salty).digest("hex")
                    , ext = ".jpg"
                    , uniqueFile = uniqueness + ext.toLowerCase()
                    , targetPath = appDir + "/public/images/projects/" + uniqueFile
                    , targetThumbPath = appDir + "/public/images/projects/thumbnails/" + uniqueFile
                    , jsonFileURL = "/public/images/projects/" + uniqueFile;
                    
                    fs.readFile(file.path, function (err, data) {
                          fs.writeFile(targetPath, data, function (err) {
                            if (err) {
                                console.log("Error:" + err)
                            } else {
                                console.log("File copied");
                                fs.unlink(tmpPath, function(err){
                                    if (err) {
                                        console.log("Error:" + err);
                                    }
                                });
                                // Create thumbnail
                                images.generateThumb(targetPath, targetThumbPath);
                            }
                        });
                    });

                    var assetInsertion = client.query(
                        "INSERT into assets(projectid, type, url, filename) values($1, $2, $3, $4)",
                        [projectID, "image", jsonFileURL, file.name]
                    );

                    assetInsertion.on('error', function(error) {
                        console.log("Error: " + error)
                    });        

                    assetInsertion.on('end', function(result){
                        console.log("Inserted image into assets table");
                    });
                }
            });
            callback(null, projectID);
        },

        function(projectID, callback){
            if (req.body.video) {
                var videoUrl;
                // Remove https if found
                if(req.body.video.match(/^https:\/\//i)){
                    videoUrl = req.body.video.replace(/^https:\/\//i, 'http://');
                } else {
                    videoUrl = req.body.video;
                }
                var videoInsertion = client.query(
                    "INSERT into assets(projectid, type, url) values($1, $2, $3)",
                    [projectID, "video", videoUrl]
                );

                videoInsertion.on('error', function(error) {
                    console.log("Problem inserting video into DB, cap'n. Error: " + error)
                });        

                videoInsertion.on('end', function(result){
                    console.log("Inserted video URL into assets table");
                });
            };
            callback(null);
        },

       function(callback){
            var projectEditURL = "http://" + req.headers.host + "/edit/" + token;
            mail.sendCreateConfirmation(req.body.email, projectEditURL);
            res.render('create/done', { title : "Submission complete."});
            callback(null);
       }
    ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done adding new project and all assets.");
        }
    });
}

/*
 * GET form to create new project
 */

exports.get = function(req, res){
  res.render('create/create', { title: 'Submit Your Project', formData : null });
};

/*
 * GET completion page after completing project submission
 */

exports.done = function(req, res){
    res.render('create/done', { title: 'Thanks For Your Submission' });
};

/*
 * GET denied page.
 */

exports.denied = function(req, res){
    res.render('create/denied', { title: 'Denied: You have already submitted' });
};