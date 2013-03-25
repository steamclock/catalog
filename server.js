/* 
 * Catalog Curation Server
 */


// 
console.log("Setting up app...");
var express = require('express'),
    app = express(),
    fs = require('fs'),
    nodemailer = require("nodemailer"),
    rawData = fs.readFileSync('config.json'),
    // Postgres Setup
    postgres = require('pg'),
    connectionString = "pg://" + app.config.postgres.username +":" + app.config.postgres.password +  "@" + app.config.baseurl + "/"+ app.config.postgres.dbname,
    client = new postgres.Client(connectionString);

// Pull in config

try {
    app.config = JSON.parse(rawData);
    console.dir("Configuration loaded...");
} 
catch (err) {
    console.log('There has been an error parsing the config file.')
    console.log(err);
}   

// Nodemailer Setup 

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: app.config.mail.service,
    auth: {
        user: app.config.mail.username,
        pass: app.config.mail.password
    }
});

// Postgres Test

client.connect(function(err) {
    // Just testing we can connect to the db for now
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
      console.log("Postgrest test output: " + result.rows[0].theTime);
    })

    if (err) {
        console.log(err);
    }
});

// Routing test

app.get('/hello.txt', function(req, res){
  res.send('Hello World');
});


// Listen up, bub
app.listen(3000);
console.log('Listening on port 3000');






