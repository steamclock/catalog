var client = require('./../modules/postgres').client
    , async = require('async')
    , fs = require('fs')
    , imagemagick = require('imagemagick')
    , flash = require('flashify');

/*
 * GET edit page.
 */

exports.get = function(req, res){
    async.waterfall([
        function(callback){
            var query = client.query("SELECT * FROM projects WHERE token = $1", [req.route.params.token]);

            query.on('row', function(row, result){
                result.addRow(row);
            });

            query.on('error', function(error){
                console.log("Error: " + error);
            });

            query.on('end', function(result){
                if (result.rowCount < 1) {
                    res.redirect('/edit/token/denied');
                    callback(true); //exits the waterfall
                } else {
                    var project = result.rows[0];
                    callback(null, project);
                }
            });
        },

        function(project, callback){

            var query = client.query("SELECT * FROM assets WHERE projectid = $1", [project.id]);

            query.on('row', function(row, result){
                result.addRow(row);
            });

            query.on('error', function(error){
                console.log("Error: " + error);
            });

            query.on('end', function(result){
                var assets = result.rows;
                callback(null, project, assets);
            });
        },

        function(project, assets, callback){
            var projectJSON = JSON.stringify(project);
            var assetsJSON = JSON.stringify(assets);
            res.render('edit/edit', { title: 'Edit Your Submission', project : projectJSON, assets : assetsJSON, baseURL : "http://theshow2013.ecuad.ca" });
        }],

        function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done loading edit page stuffs.")
        }
    
    });
};


exports.update = function(req, res){
    console.log(req.body);
    console.log("-------------------");
    async.waterfall([
        function(callback){
            var token = req.headers.referer.substring(req.headers.referer.lastIndexOf('/') + 1);
            var query = client.query(
                "UPDATE projects SET title = $2, author = $3, website = $4, degree = $5, medium = $6, measurements = $7, published = false WHERE token = $1", 
                [token, req.body.title, req.body.author, req.body.website, req.body.degree, req.body.medium, req.body.measurements]);

            query.on('error', function(error){
                console.log("Error: " + error);
            });

            query.on('end', function(result){
                console.log("Projects table updated.");
            });
            callback(null);
        },

        function(callback){
            // Validate image dimensions
           for (var key in req.files) {
                if (req.files.hasOwnProperty(key)) {
                    if (key === "new") {
                        req.files.new.forEach(function(file){
                            if (file.type === "image/jpeg") {
                                imagemagick.identify(file.path, function(err, features){
                                    if(err){console.log(err)};
                                    var accept = ((features.width > 1500) || (features.height > 1500));
                                    if (!accept){
                                        var formValues = JSON.stringify(req.body);
                                        res.flash('message','One of your images did not meet the minimum dimensions. Please verify the dimensions of all of your assets.');
                                        res.render('edit/edit', { title : "Error in submission", formData : formValues });
                                        callback(true); //Exits waterfall
                                    } else {
                                        callback(null);
                                    }
                                });  
                            }
                        });
                    } else {
                        var file = req.files[key];
                        if (file.type === "image/jpeg") {
                            imagemagick.identify(file.path, function(err, features){
                                if(err){console.log(err)};
                                var accept = ((features.width > 1500) || (features.height > 1500));
                                if (!accept){
                                    var formValues = JSON.stringify(req.body);
                                    res.flash('message','One of your images did not meet the minimum dimensions. Please verify the dimensions of all of your assets.');
                                    res.render('edit/edit', { title : "Error in submission", formData : formValues });
                                    callback(true); //Exits waterfall
                                } else {
                                    callback(null);
                                }
                            });  
                        }
                    }
                }
            }
            callback(null);
        },
        function(callback){
            for (var key in req.files) {
                if (req.files.hasOwnProperty(key)) {
                    if (key === "new") {
                        req.files.new.forEach(function(file) {
                            if (file.name) { 
                                // get the temporary location of the file
                                var tmp_path = file.path;
                                // set where the file should actually exists - in this case it is in the "images" directory
                                var target_path = './public/images/projects/' + file.name;
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
                                }); // End fs read/write 
                                var localFileURL = "/public/images/projects/" + file.name;

                                var assetInsertion = client.query(
                                    "INSERT into assets(projectid, type, url) values($1, $2, $3)",
                                    [req.body.project, "image", localFileURL]
                                );

                                assetInsertion.on('error', function(error) {
                                    console.log("Error: " + error)
                                });        

                                assetInsertion.on('end', function(result){
                                    console.log("Inserted image into assets table");
                                });
                            }
                        }); //End forEach
                    } else {
                        var file = req.files[key];
                        if (file.name) { 
                            // get the temporary location of the file
                            var tmp_path = file.path;
                            // set where the file should actually exists - in this case it is in the "images" directory
                            var target_path = './public/images/projects/' + file.name;
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
                            }); // End fs read/write 
                                var localFileURL = "/public/images/projects/" + file.name;

                                var assetInsertion = client.query(
                                    "UPDATE assets SET projectid = $1, type = $2, url = $3 WHERE id = $4",
                                    [req.body.project, "image", localFileURL, key]
                                );

                                assetInsertion.on('error', function(error) {
                                    console.log("Error: " + error)
                                });        

                                assetInsertion.on('end', function(result){
                                    console.log("Updated image in assets table");
                                });
                        }
                    }
                }             
            }// End for .. in req.files
            res.render('edit/done', { title: 'YAY YOU RESUBMIT' });
            callback(null);
        }],

        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("Done updating project & assets.");
            }
        });
}

/*
 * GET resubmitted page.
 */

exports.done = function(req, res){
    res.render('edit/done', { title: 'YAY YOU RESUBMIT' });
};

/*
 * GET denied page.
 */

exports.denied = function(req, res){
    res.render('edit/denied', { title: 'Invalid Edit URL' });
};