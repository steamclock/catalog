/*
 * GET denied page.
 */

exports.get = function(req, res){
    res.render('denied', { title: 'Denied: You have already submitted' });
};