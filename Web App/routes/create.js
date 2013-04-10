var fs = require('fs')
    , client = require('./../modules/postgres').client
    , nodemailer = require("nodemailer")
    , crypto = require('crypto');

/*
 * GET form to create new project
 */

exports.get = function(req, res){
  res.render('create', { title: 'Submit Your Project' });
};

/*
 * POST form to create new project
 */

exports.submit = function(req, res){

    // TODO: This function is wayy to huge. Factor out DB stuff into it's own module now that its grown.


    console.log(req);
    // Generate a unique hash for edit link using submitter's email address
    var email = req.body.email, token = crypto.createHash('md5').update(email).digest("hex");

    //Insert ze project
    var projectInsertion = client.query(
        "INSERT INTO projects(title, author, email, website, degree, medium, measurements, token) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
        [req.body.title, req.body.author, req.body.email, req.body.website, req.body.degree, req.body.medium, req.body.measurements, token]
    );


    projectInsertion.on('row', function(row, result) {
        result.addRow(row);
    });

    projectInsertion.on('error', function(error) {
        console.log("Problem inserting row into DB, cap'n. Error: " + error)
        res.render('done', { title: 'ERROR IN SUBMISSION' });
    });

    var projectID = [];

    projectInsertion.on('end', function(result){
        console.log("Created new entry for project in DB.");
        console.log("Project ID: " + result.rows[0].id); // use this to add assets to DB
        projectID.push(result.rows[0].id);
    });


    // Iterate over files and insert into assets table as well as move files to appropriate location

    req.files.images.forEach(function(file) {
        console.log(file.path);
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

        console.log("Log experiment" + projectID[0]);

        var localFileURL = "/public/images/projects/" + file.name;

        var assetInsertion = client.query(
            "INSERT into assets(projectid, type, url) values($1, $2, $3)",
            [projectID[0], "image", localFileURL]
        );

        assetInsertion.on('error', function(error) {
            console.log("Problem image into DB, cap'n. Error: " + error)
            res.render('done', { title: 'ERROR IN ASSET INSERTION' });
        });        

        assetInsertion.on('end', function(result){
            console.log("Inserted image into assets table");
        });

    });
    
    if (req.body.video) {
        var videoUrl;
        // Remove https if found
        if(req.body.video.match(/^https:\/\//i)){
            url = req.body.video.replace(/^https:\/\//i, 'http://');
        } else {
            videoUrl = req.body.video;
        }
        var videoInsertion = client.query(
            "INSERT into assets(projectid, type, url) values($1, $2, $3)",
            [projectID[0], "video", videoUrl]
        );

        videoInsertion.on('error', function(error) {
            console.log("Problem inserting video into DB, cap'n. Error: " + error)
            res.render('done', { title: 'ERROR IN ASSET INSERTION' });
        });        

        videoInsertion.on('end', function(result){
            console.log("Inserted video URL into assets table");
        });
    }; // Video

    res.redirect('/done');
};

/*
 * GET completion page after completing project submission
 */

exports.done = function(req, res){
    res.render('done', { title: 'Thanks For Your Submission' });
};

/*
 * GET denied page.
 */

exports.denied = function(req, res){
    res.render('denied', { title: 'Denied: You have already submitted' });
};