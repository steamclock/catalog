
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , nodemailer = require("nodemailer")
  , rawData = fs.readFileSync('config.json')
  , postgres = require('pg')
  , migrate = require('db-migrate');

var app = express();

// App Configuration

try {
    app.config = JSON.parse(rawData);
    console.dir("Configuration loaded...");
} 
catch (err) {
    console.log('There has been an error parsing the config file.')
    console.log(err);
} 

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Nodemailer Setup 

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: app.config.mail.service,
    auth: {
        user: app.config.mail.username,
        pass: app.config.mail.password
    }
});

// Postgres Test

var connectionString = "pg://" + app.config.postgres.username +":" + app.config.postgres.password +  "@" + app.config.baseurl + "/"+ app.config.postgres.dbname,
    client = new postgres.Client(connectionString);

client.connect(function(err) {
    // Just testing we can connect to the db for now
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
      console.log("Postgrest test output: " + result.rows[0].theTime);
    })

    if (err) {
        console.log(err);
    }
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
