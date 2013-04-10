/*
 * GET edit page.
 */

exports.get = function(req, res){

    res.render('edit/edit', { title: 'Edit Your Submission' });
};

/*
 * GET completed update page.
 */

exports.done = function(req, res){



    res.render('edit/done', { title: 'Edit Your Submission' });
};