var client = require('./../modules/postgres').client
    , async = require('async');

/*
 * GET edit page.
 */

exports.get = function(req, res){
    console.log(req.route.params.token);

    var query = client.query("SELECT * FROM projects WHERE token = $1", [req.route.params.token]);

    query.on('row', function(row, result){
        result.addRow(row);
    });

    query.on('error', function(error){
        console.log("Error: " + error);
    });

    query.on('end', function(result){
        console.log(result);
        if (result.rowCount < 1) {
            res.redirect('/edit/token/denied');
        } else {
            res.render('edit/edit', { title: 'Edit Your Submission' });
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