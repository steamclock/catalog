
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
  , basic = auth({
      authRealm : "Private area.",
      authFile : './htpasswd',
      authType : 'basic'
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
app.get('/', pages.index);
app.get('/about', pages.about);

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
app.get('/admin', function(req, res){
    basic.apply(req, res, function() {
        admin.get(req, res);
    });
});
app.post('/approve/project/:id', admin.approve);
app.post('/reject/project/:id', admin.reject);


// Degree page that lists all projects for a given degree
app.get('/degree/:degree', projects.getProjectsForDegree);

//Individual project page
app.get('/degree/:degree/student/:author', getProjectForStudent)

// JSON API Routes
app.get('/json', projects.getProjects);

// Servin' it up
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
 