
/**
 * Module dependencies.
 */

var express = require('express')
  , pages = require('./routes/pages')
  , create = require('./routes/create')
  , edit = require('./routes/edit')
  , admin = require('./routes/admin')
  , projects = require('./routes/projects')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , migrate = require('db-migrate')
  , favicons = require('connect-favicons')
  , flashify = require('flashify')
  , auth = require('http-auth')
  , basic = auth.basic({
      realm : "Private area.",
      file : __dirname + '/htpasswd'
  });

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
  app.use(express.cookieParser('secret'));
  app.use(express.session());
  app.use(flashify);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/public', express.static(__dirname + '/public'));
  app.use(app.router);
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Oops. something broke. Please go back and try again.');
  });
  app.use(function(req, res, next){
    res.status(404);
    res.render('error', {title : "404: Not Found."});
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Routes for website
app.get('/:year/home', pages.home);
app.get('/:year/about', pages.about);

// Redirect the root domain to the current show.
app.get('/', function(req, res) {
  res.redirect('/2014/home');
});

// This keeps any pre-existing 2013 project links from breaking
app.get('/project/:id/:degree/:author', function(req, res) {
  res.redirect(301, '/2013' + req.url);
});

// JSON API Routes
app.get('/json', projects.getProjects);
app.get('/json/years/:year', projects.getProjects);

// Creating a submission
app.get('/create', create.get);
app.post('/create/submit', create.new);
app.get('/create/done', create.done);
app.get('/create/denied', create.denied);

// Editing a submission
app.get('/edit/:token', edit.get);
app.post('/edit/update', edit.update);
app.get('/resubmitted', edit.done);
app.get('/edit/token/denied', edit.denied);

// Adminstration panel
app.get('/admin', auth.connect(basic), admin.get);
app.post('/approve/project/:id', auth.connect(basic), admin.approve);
app.post('/reject/project/:id', auth.connect(basic), admin.reject);

// All projects for a year
app.get('/:year/projects', projects.getProjectsSortedByAuthor);

// Degree page that lists all projects for a given degree
app.get('/:year/degree/:degree', projects.getProjectsForDegree);

//Individual project page
app.get('/:year/project/:id/:degree/:author', projects.getProjectById);

// Servin' it up
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
 