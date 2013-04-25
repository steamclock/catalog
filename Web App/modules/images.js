/*
 * Image verification
 */

var fs = require('fs')
    , imagemagick = require('imagemagick')
    , async = require('async')
    , path = require('path');


exports.checkImg = function(image){
    async.series([
    function(callback){
        var accept;
        if (image.type === "image/jpeg") {
            imagemagick.identify(image.path, function(err, features){
                if(err){console.log(err)};
                accept = ((features.width >= 1500) || (features.height >= 1500));
                callback(null, accept);
            });
        }
    }],
    // optional callback
    function(err, results){
        if (err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });

    return accept;
}

exports.moveImg = function(image){
    var tmpPath = image.path
    , salty = crypto.randomBytes(256)
    , uniqueness = crypto.createHash('md5').update(salty).digest("hex")
    , ext = ".jpg"
    , uniqueFile = uniqueness + ext
    , targetPath = "./public/images/projects/" + uniqueFile
    , targetThumbPath = "./public/images/projects/thumbnails/" + uniqueFile
    , jsonFileURL = "/public/images/projects/" + uniqueFile;

    fs.readFile(image.path, function (err, data) {
          fs.writeFile(targetPath, data, function (err) {
            if (err) {
                console.log("Error:" + err)
            } else {
                console.log("File copied");
                fs.unlink(tmpPath, function(err){
                    if (err) {
                        console.log("Error:" + err);
                    }
                });
                // Create thumbnail
                module.exports.generateThumb(targetPath, targetThumbPath);
            }
        });
    });    
}

exports.generateThumb = function(targetPath, targetThumbPath){
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