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

    // console.log(req);
    // var assets = req.files;


    // for (var i = req.files.length - 1; i >= 0; i--) {
    //     console.log(req.files[i]);
    // };


    //res.render('done', { title: 'Thanks for your Submission' });


    // var targetPath = './public/images/projects/' + req.files.asset1.name;
    // fs.rename(tmpPath, targetPath, function(err) {
    //     if (err) throw err;
    //     // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
    //     fs.unlink(tmpPath, function() {
    //         if (err) throw err;
    //     });
    // });
    console.log("Inside function to insert into DB");

    var projectID;

    var query = client.query(
        "INSERT INTO projects(title, author, email, website, degree, medium, measurements) values($1, $2, $3, $4, $5, $6, $7)",
        [req.body.title, req.body.author, req.body.email, req.body.website, req.body.degree, req.body.medium, req.body.measurements]);

    query.on('error', function(error) {
        console.log("Problem inserting row into DB, cap'n. Error: " + error)
        res.render('done', { title: 'ERROR IN SUBMISSION' });
    });

    query.on('end', function(result){
        console.log("Created new entry for project in DB for );
        //client.end();
    });

    next();
};

/*
 * GET completion page after completing project submission
 */

exports.done = function(req, res){
    res.render('done', { title: 'Thanks for your Submission' });
};