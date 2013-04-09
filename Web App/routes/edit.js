/*
 * GET edit page.
 * TODO: Shoudl take token identifier and pre-populate form with user's project & assets for editing/updating
 * Temp route with basic GET so Justin can theme form
 */

exports.get = function(req, res){
    res.render('edit', { title: 'Edit Your Submission' });
};