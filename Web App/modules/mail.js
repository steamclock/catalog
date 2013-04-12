/*
 *  Confirmation E-mail Mailer
 */

var mailer = require("nodemailer")
    , config = require('./../modules/config').config;
var transport = mailer.createTransport("sendmail", {
    path: "/usr/sbin/sendmail"
});

exports.sendCreateConfirmation = function (email, editURL) {
    var mailOptions = {
        from: "Emily Carr Grad Catalog <gradcatalog@ecuad.com>", // sender address
        to: email, // list of receivers
        subject: "Confirmation of Emily Carr Grad Catalog Submission", // Subject line
        text: "Hello " + email + "\r\nThis is an email to confirm that you have successfully submitted your portfolio materials for approval.\r\nOnce approved you they will be accesible through the main site.\r\nIf you would like to edit your submission, you can do so by visiting the following link:" + editURL + "\r\n\r\nPlease note that if you re-submit your portfolio after it has been approved, it will be removed from the site until re-approved again.\r\n\r\n-- The Grad Catalog Team", // plaintext body
        
        html: "Hello " + email + "!\r\nThis is an email to confirm that you have successfully submitted your portfolio materials for approval. Once approved you they will be accesible through the main site.\r\n\r\nIf you would like to edit your submission, you can do so by visiting the following link:\r\n" + editURL + "\r\nPlease note that if you re-submit your portfolio after it has been approved, it will be removed from the site until re-approved again.\r\n\r\n-- The Grad Catalog Team"// html body
    };

    transport.sendMail(mailOptions, function(error, response){
        console.log("Attempting to send mail");
        if(error){
            console.log("Message send failure: " + error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });
}

exports.sendStatusUpdate = function (email, approval) {
    var mailOptions;

    if (approval) {
        mailOptions = {
            from: "Emily Carr Grad Catalog <gradcatalog@ecuad.com>",
            to: email, // list of receivers
            subject: "Your Emily Carr Grad Catalog Submission: Approved",
            text: "Hello " + email + "\r\nYour submission to the 2013 Emily Carr Grad Catalog has been approved.\r\n-- The Grad Catalog Team", // plaintext body
            html: "Hello " + email + "\r\nYour submission to the 2013 Emily Carr Grad Catalog has been approved.\r\n-- The Grad Catalog Team" // html body
        }
    } else {
        mailOptions = {
            from: "Emily Carr Grad Catalog <gradcatalog@ecuad.com>", // sender address
            to: email, // list of receivers
            subject: "Your Emily Carr Grad Catalog Submission: Needs Attention", // Subject line
            text: "Hello " + email + "\r\nYour submission to the 2013 Emily Carr Grad Catalog has been flagged for re-submission.\r\nPlease visit http://theshow2013.ecuad.ca/create and submit your project again.\r\n-- The Grad Catalog Team", // plaintext body
            html: "Hello " + email + "\r\nYour submission to the 2013 Emily Carr Grad Catalog has been flagged for re-submission.\r\nPlease visit http://theshow2013.ecuad.ca/create and submit your project again.\r\n-- The Grad Catalog Team"// html body
        }
    }

    smtpTransport.sendMail(mailOptions, function(error, response){
        console.log("Attempting to send mail");
        if(error){
            console.log("Message send failure: " + error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });
}

exports.sendErrorThumbnailUndefined = function (debug) {
    // This is a special case to debug a rare edge case on the EC server
    // Probably you don't need this if you're not running EC :)
    var data = JSON.stringify(debug);
    var mailOptions = {
        from: "Emily Carr Grad Catalog <gradcatalog@ecuad.com>",
        to: "angelina@steamclock.com", // list of receivers
        subject: "Image path undefined! " + data,
        text: "Error, image path undefined", // plaintext body
    }


    smtpTransport.sendMail(mailOptions, function(error, response){
        console.log("Attempting to send mail");
        if(error){
            console.log("Message send failure: " + error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });
}
