var fs = require('fs')
    , client = require('./../modules/postgres').client;

/*
 * GET form to create new project
 */

exports.get = function(req, res){
  res.render('create', { title: 'Submit your Grad Show Project' });
};

/*
 * POST form to create new project
 */

exports.submit = function(req, res, next){
    var tmpPath = req.files.asset1.path;
    var targetPath = './public/images/projects/' + req.files.asset1.name;
    fs.rename(tmpPath, targetPath, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmpPath, function() {
            if (err) throw err;
        });
    });

    client.query(
        "INSERT INTO projects(title, author, websiteurl, degree, program, medium, measurements, asseturl) values($1, $2, $3, $4, $5, $6, $7, $8)",
        [req.body.title, req.body.author, req.body.websiteUrl, req.body.degree, req.body.program, req.body.medium, req.body.measurements, targetPath]);
        console.log("Created new entry for project in DB.");

    next();
};

/*
 * GET completion page after completing project submission
 */

exports.done = function(req, res){
    res.render('done', { title: 'Thanks for your Submission' });
};