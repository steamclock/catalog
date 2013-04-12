var client = require('./../modules/postgres').client
    , async = require('async')
    , validator = ('validator');

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
    //console.log(req.headers.referer);
    // console.log(req.files);
    // console.log(req.headers.referrer)

    async.waterfall([
        function(callback){
            var token = req.headers.referer.substring(req.headers.referer.lastIndexOf('/') + 1);
            var query = client.query(
                "UPDATE projects SET title = $2, author = $3, website = $4, degree = $5, medium = $6, measurements = $7 WHERE token = $1", 
                [token, req.body.title, req.body.author, req.body.website, req.body.degree, req.body.medium, req.body.measurements]);

            query.on('error', function(error){
                console.log("Error: " + error);
            });

            query.on('end', function(result){
                console.log("Submission updated.");
            });
            //callback(null);
        },

        function(callback){
            // req.files.images.forEach(function(file){
            //     if (file.type === "image/jpeg") {
            //         imagemagick.identify(file.path, function(err, features){
            //             if(err){console.log(err)};
            //             var accept = ((features.width > 1500) || (features.height > 1500));
            //             if (!accept){
            //                 var formValues = JSON.stringify(req.body);
            //                 res.flash('message','One of your images did not meet the minimum dimensions. Please verify the dimensions of all of your assets.');
            //                 res.render('edit/edit', { title : "Error in submission", formData : formValues });
            //                 callback(true); //Exits waterfall
            //             } else {
            //                 callback(null);
            //             }
            //         });  
            //     }
            // });
            callback(null);
        },
        function(callback){

        }],

        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("Done loading edit page stuffs.")
            }
        });
}

/*
 * GET completed update page.
 */

exports.done = function(req, res){

    res.render('edit/done', { title: 'Edit Your Submission' });
};

/*
 * GET denied page.
 */

exports.denied = function(req, res){
    res.render('edit/denied', { title: 'Invalid Edit URL' });
};