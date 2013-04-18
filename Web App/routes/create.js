var fs = require('fs')
    , client = require('./../modules/postgres').client
    , mail = require('./../modules/mail')
    , crypto = require('crypto')
    , async = require('async')
    , validator = require('validator') // TODO: Remove?
    , imagemagick = require('imagemagick')
    , flash = require('flashify');

/*
 * GET form to create new project
 */

exports.get = function(req, res){
  res.render('create/create', { title: 'Submit Your Project', formData : null });
};

/*
 * POST form to create new project
 */

exports.submit = function(req, res){
    // Generate a unique hash for edit link using submitter's email address
    // TODO: use a config var somewhere to salt this properly
    
    var email = req.body.email, salty = crypto.randomBytes(256); token = crypto.createHash('md5').update(salty).digest("hex");
    console.log("SALTY HASH: " + token);
    async.waterfall([

        function(callback){

            // Check if email already exists in DB
            console.log("Here!");
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
                    callback(null)
                }
            });  
        },

        function(callback){
            //Reject the user and pop them back to the form if they did not have the right image dimensions (size is validated on client side)

            req.files.images.forEach(function(file){
                if (file.type === "image/jpeg") {
                    imagemagick.identify(file.path, function(err, features){
                        if(err){console.log(err)};
                        var accept = ((features.width >= 1500) || (features.height >= 1500));
                        if (!accept){
                            var formValues = JSON.stringify(req.body);
                            res.flash('message','One of your images did not meet the minimum dimensions. Please verify the dimensions of all of your assets.');
                            res.render('create/create', { title : "Error in submission", formData : formValues });
                            callback(true); //Exits waterfall
                        }
                    });

                }
            });

            callback(null);
        },

        function(callback){
            // Insert into the projects table
            console.log("Getting called to insert project");
            var query = client.query(
                "INSERT INTO projects(title, author, email, website, degree, medium, measurements, token) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
                [req.body.title, req.body.author, req.body.email, req.body.website, req.body.degree, req.body.medium, req.body.measurements, token]
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
                    // get the temporary location of the file
                    // generate unique id to append in case of duplicate file names, take a substring of the MD5 so it's not super long
                    // then set target path for file upload
                    var tmp_path = file.path
                    , salty = crypto.randomBytes(256)
                    , uniqueness = crypto.createHash('md5').update(salty).digest("hex")
                    , target_path = './public/images/projects/' + file.name + uniqueness.substring(0, 5);
                    
                    // move the file from the temporary location to the intended location
                    fs.readFile(file.path, function (err, data) {
                          fs.writeFile(target_path, data, function (err) {
                            if (err) {
                                console.log("Error:" + err)
                            } else {
                                console.log("File copied");
                                fs.unlink(tmp_path, function(err){
                                    if (err) {
                                        console.log("Error:" + err);
                                    }
                                });
                            }
                          });
                    });

                    var localFileURL = "/public/images/projects/" + file.name;

                    var assetInsertion = client.query(
                        "INSERT into assets(projectid, type, url) values($1, $2, $3)",
                        [projectID, "image", localFileURL]
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
            mail.send(req.body.email, projectEditURL);
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