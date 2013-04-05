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

    // var targetPath = './public/images/projects/' + req.files.asset1.name;
    // fs.rename(tmpPath, targetPath, function(err) {
    //     if (err) throw err;
    //     // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
    //     fs.unlink(tmpPath, function() {
    //         if (err) throw err;
    //     });
    // });

    // 1. Validate and respond accordingly

    // 2. Insert project into project table 

    // Generate random URL token here
    // Also need a bool in this table for approved or not

    var query = client.query(
        "INSERT INTO projects(title, author, email, website, degree, medium, measurements) values($1, $2, $3, $4, $5, $6, $7)",
        [req.body.title, req.body.author, req.body.email, req.body.website, req.body.degree, req.body.medium, req.body.measurements]);

    query.on('error', function(error) {
        console.log("Problem inserting row into DB, cap'n. Error: " + error)
        res.render('done', { title: 'ERROR IN SUBMISSION' });
    });

    query.on('end', function(result){
        console.log("Created new entry for project in DB.");
        //client.end();
    });

    // 3. Get project id of new project by user's email

    // 4. Insert assets into asset table keyed by project ID


    // 5. Email user URL for editing and as confirmation.


    next();
};

/*
 * GET completion page after completing project submission
 */

exports.done = function(req, res){
    res.render('done', { title: 'Thanks for your Submission' });
};