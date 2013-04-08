var fs = require('fs')
    , client = require('./../modules/postgres').client
    , nodemailer = require("nodemailer")
    , crypto = require('crypto');

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
    //console.log(req);
    var projectRows = [];

    //console.log(req.files);

    for (asset in req.files){
        //console.log(projectRows.row[0].id);

        for (p in asset) {
            console.log(typeof(asset[p]), p);
        }


        console.log(asset);
        console.log(asset.name);
    }




    // ----
    // // Generate a unique hash for edit link using submitter's email address
    // var email = req.body.email, token = crypto.createHash('md5').update(email).digest("hex");

    // //Insert ze project
    // var projectInsertion = client.query(
    //     "INSERT INTO projects(title, author, email, website, degree, medium, measurements, token) values($1, $2, $3, $4, $5, $6, $7, $8)",
    //     [req.body.title, req.body.author, req.body.email, req.body.website, req.body.degree, req.body.medium, req.body.measurements, token]
    // );

    // var projectRows = [];
    // projectInsertion.on('row', function(row, result) {
    //     result.addRow(row);
    //     projectRows.push(row);
    // });

    // projectInsertion.on('error', function(error) {
    //     console.log("Problem inserting row into DB, cap'n. Error: " + error)
    //     res.render('done', { title: 'ERROR IN SUBMISSION' });
    // });

    // projectInsertion.on('end', function(result){
    //     console.log("Created new entry for project in DB.");
    //     console.log("Project ID: " + result.rows[0].id); // use this to add assets to DB
    // });


    // ------

    // var targetPath = './public/images/projects/' + req.files.asset1.name;
    // fs.rename(tmpPath, targetPath, function(err) {
    //     if (err) throw err;
    //     // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
    //     fs.unlink(tmpPath, function() {
    //         if (err) throw err;
    //     });
    // });

    // var assetInsertion = client.query(
    //     "INSERT into assets(projectid, type, url) values($1)",
    //     [currentasset]
    // );




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