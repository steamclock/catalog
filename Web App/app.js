
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
  , migrate = require('db-migrate')
  , favicons = require('connect-favicons');

var app = express();

// App Configuration

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.use(favicons(__dirname + '/public/images/icons'));
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

// Routes for website
app.get('/', pages.index);
app.get('/about', pages.about);

// Creating a submission
app.get('/create', create.get);
app.post('/create/submit', create.submit);
app.get('/create/done', create.done);
app.get('/create/denied', create.denied);

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
 