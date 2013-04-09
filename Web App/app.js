
/**
 * Module dependencies.
 */

var express = require('express')
  , pages = require('./routes/pages')
  , create = require('./routes/create')
  , edit = require('./routes/edit')
  , projects = require('./routes/projects')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , nodemailer = require("nodemailer")
  , config = require("./modules/config").config
  , migrate = require('db-migrate');

var app = express();

// App Configuration

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir:'./uploads'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/public', express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Nodemailer Setup 

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: config.mail.service,
    auth: {
        user: config.mail.username,
        pass: config.mail.password
    }
});

// Routes for website
app.get('/', pages.index);
app.get('/about', pages.about);

// Creating a submission
app.get('/create', create.get);
app.post('/create/submit', create.submit); //TODO: Change this so that we just do a redirect to a totally different route rather than rendering done template at same route
app.get('/create/done', create.done);

// Editing a submission

app.get('/edit', edit.get);


// Degree page that lists all projects for a given degree
app.get('/:degree', projects.getListForDegree);

// JSON API Routes
app.get('/json/:degree', projects.getProjectsForDegree);

// Servin' it up
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
 