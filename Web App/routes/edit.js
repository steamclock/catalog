var client = require('./../modules/postgres').client
    , async = require('async');

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
                    callback.final(); //exits the waterfall
                } else {
                    var project = result.rows[0];
                    callback(null, project);
                }
            });
        },

        function(project, callback){
            var query = client.query("SELECT * FROM assets WHERE projectid = $1", project.id);

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

            res.render('edit/edit', { project : project, assets : assets });

            callback(null);
        }],

        function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Done loading edit page stuffs.")
        }
    
    });



    
};

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