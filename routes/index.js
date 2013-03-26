
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