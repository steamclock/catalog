var fs = require('fs');
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Catalog' });
};

/*
 * GET form to create new project
 */

 exports.create = function(req, res){
  res.render('create', { title: 'Submit your Grad Show Project' });
};

/*
 * POST form to create new project
 */

 exports.submit = function(req, res){
    var tmpPath = req.files.asset.path;
    var targetPath = './public/images/projects/' + req.files.asset.name;
    fs.rename(tmpPath, targetPath, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmpPath, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + targetPath + ' - ' + req.files.asset.size + ' bytes' + "<img src=" + targetPath + ">");
        });
    });
};