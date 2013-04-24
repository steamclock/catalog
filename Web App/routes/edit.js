var client = require('./../modules/postgres').client
    , async = require('async')
    , fs = require('fs')
    , imagemagick = require('imagemagick')
    , crypto = require('crypto')
    , path = require('path')
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
    // TODO: When refactoring this should be a series rather than a waterfall
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
                console
                if (req.files.hasOwnProperty(key)) {
                    if (key === "new") {
                        if (req.files.new instanceof Array) {
                            req.files.new.forEach(function(file){
                                if (file.type === "image/jpeg") {
                                    imagemagick.identify(file.path, function(err, features){
                                        if(err){console.log(err)};
                                        var accept = ((features.width >= 1500) || (features.height >=1500));
                                        if (!accept){
                                            var formValues = JSON.stringify(req.body);
                                            res.flash('message','One of your images did not meet the minimum dimensions. Please verify the dimensions of all of your assets.');
                                            res.render('edit/edit', { title : "Error in submission", formData : formValues });
                                            callback(true); //Exits waterfall
                                        }
                                    });  
                                }
                            });
                        } else {
                            var file = req.files.new;
                            if (file.type === "image/jpeg") {
                                imagemagick.identify(file.path, function(err, features){
                                    if(err){console.log(err)};
                                    var accept = ((features.width >= 1500) || (features.height >=1500));
                                    if (!accept){
                                        var formValues = JSON.stringify(req.body);
                                        res.flash('message','One of your images did not meet the minimum dimensions. Please verify the dimensions of all of your assets.');
                                        res.render('edit/edit', { title : "Error in submission", formData : formValues });
                                        callback(true); //Exits waterfall
                                    }
                                });  
                            }
                        }
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
                                }
                            });  
                        }
                    }
                }
            }
            callback(null);
        },

        function(callback){

            var count = 0;

            for (var key in req.files) {
                if (req.files.hasOwnProperty(key)) {
                    if (key === "new") {
                            if (req.files.new instanceof Array) {
                                req.files.new.forEach(function(file) {
                                    count++;
                                    console.log("Count is: " + count);
                                    if (file.name) { 
                                         var tmp_path = file.path
                                            , salty = crypto.randomBytes(256)
                                            , uniqueness = crypto.createHash('md5').update(salty).digest("hex")
                                            , ext = ".jpg"
                                            , uniqueFile = uniqueness + ext
                                            , targetPath = "./public/images/projects/" + uniqueFile.toLowerCase()
                                            , targetThumbPath = "./public/images/projects/thumbnails/" + uniqueFile.toLowerCase();
                                             fs.readFile(file.path, function (err, data) {
                                              fs.writeFile(targetPath, data, function (err) {
                                                if (err) {
                                                    console.log("Error:" + err)
                                                } else {
                                                    console.log("File copied");
                                                    fs.unlink(tmp_path, function(err){
                                                        if (err) {
                                                            console.log("Error:" + err);
                                                        }
                                                    });

                                                    // Create thumbnail
                                                    imagemagick.convert(
                                                        [targetPath, '-strip', '-thumbnail', '600X600>', targetThumbPath], 
                                                        function(err, stdout){
                                                        if (err){
                                                            throw err;
                                                            console.log('stdout:', stdout);
                                                        } else {
                                                            console.log("Thumbnail generated.")
                                                        }
                                                    });
                                                }
                                              });
                                        }); // End fs read/write 
                                        var localFileURL = "/public/images/projects/" + uniqueFile.toLowerCase();

                                        var assetInsertion = client.query(
                                            "INSERT into assets(projectid, type, url) values($1, $2, $3, $4)",
                                            [req.body.project, "image", localFileURL, file.name]
                                        );

                                        assetInsertion.on('error', function(error) {
                                           // console.log("Error: " + error)
                                        });        

                                        assetInsertion.on('end', function(result){
                                           //console.log("Inserted image into assets table");
                                        });
                                    }
                                }); //End forEach  
                            } else {
                                if (file.name) { 
                                     var tmp_path = file.path
                                        , salty = crypto.randomBytes(256)
                                        , uniqueness = crypto.createHash('md5').update(salty).digest("hex")
                                        , ext = ".jpg"
                                        , uniqueFile = uniqueness + ext
                                        , targetPath = "./public/images/projects/" + uniqueFile.toLowerCase()
                                        , targetThumbPath = "./public/images/projects/thumbnails/" + uniqueFile.toLowerCase();
                                        fs.readFile(file.path, function (err, data) {
                                          fs.writeFile(targetPath, data, function (err) {
                                            if (err) {
                                                console.log("Error:" + err)
                                            } else {
                                                console.log("File copied");
                                                fs.unlink(tmp_path, function(err){
                                                    if (err) {
                                                        console.log("Error:" + err);
                                                    }
                                                });

                                                // Create thumbnail
                                                imagemagick.convert(
                                                    [targetPath, '-strip', '-thumbnail', '600X600>', targetThumbPath], 
                                                    function(err, stdout){
                                                    if (err){
                                                        throw err;
                                                        console.log('stdout:', stdout);
                                                    } else {
                                                        console.log("Thumbnail generated.")
                                                    }
                                                });
                                            }
                                          });
                                    }); // End fs read/write 
                                    var localFileURL = "/public/images/projects/" + uniqueFile.toLowerCase();

                                    var assetInsertion = client.query(
                                        "INSERT into assets(projectid, type, url) values($1, $2, $3, $4)",
                                        [req.body.project, "image", localFileURL, file.name]
                                    );

                                    assetInsertion.on('error', function(error) {
                                        console.log("Error: " + error)
                                    });        

                                    assetInsertion.on('end', function(result){
                                        console.log("Inserted image into assets table");
                                    });
                                } 
                            }
                    } else {
                        // Update 
                        var file = req.files[key];
                        if (file.name) { 
                             var tmp_path = file.path
                                , salty = crypto.randomBytes(256)
                                , uniqueness = crypto.createHash('md5').update(salty).digest("hex")
                                , ext = ".jpg"
                                , uniqueFile = uniqueness + ext
                                , targetPath = "./public/images/projects/" + uniqueFile.toLowerCase()
                                , targetThumbPath = "./public/images/projects/thumbnails/" + uniqueFile.toLowerCase();

                                fs.readFile(file.path, function (err, data) {
                                  fs.writeFile(targetPath, data, function (err) {
                                    if (err) {
                                        console.log("Error:" + err)
                                    } else {
                                        console.log("File copied");
                                        fs.unlink(tmp_path, function(err){
                                            if (err) {
                                                console.log("Error:" + err);
                                            }
                                        });

                                        // Create thumbnail
                                        imagemagick.convert(
                                            [targetPath, '-strip', '-thumbnail', '600X600>', targetThumbPath], 
                                            function(err, stdout){
                                            if (err){
                                                throw err;
                                                console.log('stdout:', stdout);
                                            } else {
                                                console.log("Thumbnail generated.")
                                            }
                                        });
                                    }
                                  });
                            }); // End fs read/write 
                                var localFileURL = "/public/images/projects/" + uniqueFile.toLowerCase();

                                var assetUpdate = client.query(
                                    "UPDATE assets SET projectid = $1, type = $2, url = $3, filename = $4 WHERE assets.id = $5",
                                    [req.body.project, "image", localFileURL, file.name, key]
                                );

                                assetUpdate.on('error', function(error) {
                                    console.log("Error: " + error)
                                });        

                                assetUpdate.on('end', function(result){
                                    console.log("Updated image in assets table");
                                });
                        }
                    }
                }             
            }// End for .. in req.files
            callback(null);
        },

        function(callback){
            if (req.body.delete != undefined) {
                if (req.body.delete instanceof Array) {
                    req.body.delete.forEach(function(id) {
                        var query = client.query("DELETE FROM assets WHERE id = $1", [id]);

                        query.on('error', function(error){
                            console.log("Error: " + error);
                        });

                        query.on('end', function(result){
                            console.log("Deleted asset with id: " + id);
                        });
                    });
                } else {
                    var query = client.query("DELETE FROM assets WHERE id = $1", [req.body.delete]);

                    query.on('error', function(error){
                        console.log("Error: " + error);
                    });

                    query.on('end', function(result){
                        console.log("Deleted asset with id: " + req.body.delete);
                    });
                }
            }
            callback(null);
        },
        function(callback){
            if (req.body.vid) {
                var videoUrl;
                // Remove https if found
                if(req.body.video.match(/^https:\/\//i)){
                    videoUrl = req.body.video.replace(/^https:\/\//i, 'http://');
                } else {
                    videoUrl = req.body.video;
                }
                var videoUpdate = client.query(
                    "UPDATE assets SET projectid = $1, type = $2, url = $3 WHERE assets.id = $4",
                    [req.body.project, "video", videoUrl, req.body.vid]
                );

                videoUpdate.on('error', function(error) {
                    console.log("Problem inserting video into DB, cap'n. Error: " + error)
                });        

                videoUpdate.on('end', function(result){
                    console.log("Updated video URL in assets table");
                });
            } else {
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
                        [req.body.project, "video", videoUrl]
                    );

                    videoInsertion.on('error', function(error) {
                        console.log("Problem inserting video into DB, cap'n. Error: " + error)
                    });        

                    videoInsertion.on('end', function(result){
                        console.log("Inserted video URL into assets table");
                    });
                };
            }

            callback(null);            
        }],

        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.render('edit/done', { title: 'YAY YOU RESUBMIT' });
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