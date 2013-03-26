/*
 * GET form to create new project
 */

 exports.create = function(req, res){
  res.render('create', { title: 'Submit your Grad Show Project' });
};