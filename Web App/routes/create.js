var fs = require('fs')
    , client = require('./../modules/postgres').client
    , mail = require('./../modules/mail')
    , crypto = require('crypto')
    , async = require('async');

/*
 * GET form to create new project
 */

exports.get = function(req, res){
  res.render('create/create', { title: 'Submit Your Project' });
};

/*
 * POST form to create new project
 */

exports.submit = function(req, res){
    // Generate a unique hash for edit link using submitter's email address
    // TODO: use a config var somewhere to salt this properly
    var email = req.body.email, token = crypto.createHash('md5').update(email).digest("hex");

    async.waterfall([

        function(callback){

            var query = client.query(
                "INSERT INTO projects(title, author, email, website, degree, medium, measurements, token) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
                [req.body.title, req.body.author, req.body.email, req.body.website, req.body.degree, req.body.medium, req.body.measurements, token]
            );

            query.on('row', function (row, result){
                result.addRow(row);
            });

            query.on('error', function(error){
                console.log("ERROR:" + error);
                res.render('done', { title: 'ERROR ON PROJECT INSERTION' });
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
                    var tmp_path = file.path;
                    // set where the file should actually exists - in this case it is in the "images" directory
                    var target_path = './public/images/projects/' + file.name;
                    // move the file from the temporary location to the intended location
                    fs.readFile(file.path, function (err, data) {
                      fs.writeFile(target_path, data, function (err) {
                        console.log("File copied");
                      });
                    });

                    fs.unlinkSync(tmp_path);

                    var localFileURL = "/public/images/projects/" + file.name;

                    var assetInsertion = client.query(
                        "INSERT into assets(projectid, type, url) values($1, $2, $3)",
                        [projectID, "image", localFileURL]
                    );

                    assetInsertion.on('error', function(error) {
                        console.log("Error: " + error)
                        res.render('create/done', { title: 'ERROR IN ASSET INSERTION' });
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
                    res.render('create/done', { title: 'ERROR IN ASSET INSERTION' });
                });        

                videoInsertion.on('end', function(result){
                    console.log("Inserted video URL into assets table");
                });
            };
            res.redirect('/create/done');
            callback(null);
        },

       function(callback){
            var projectEditURL = "http://" + req.headers.host + "/edit/" + token;
            mail.send(req.body.email, projectEditURL);
            callback(null);
       }

    ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done adding new project and all assets.")
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