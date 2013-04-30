/*
 * A little jQuery magic to make curating the projects nice
 */

 $(document).ready(function(){
    function submitForm (form, listItem) {
        $.post(form[0].action, $(form).serialize(), function(data){
            var response = JSON.stringify(data);
            console.log("Data Loaded: " + data);
            // Error handling here for server failure
            $(listItem).fadeOut(500, function() { $(this).remove(); });
        });
    }

    $('form').submit(function(e){
        e.preventDefault();
    });

    $(".approve").click(function(){
        var form = $(this).parents('form:first');
        var listItem = $(this).parents('li:first');
        submitForm(form, listItem);
    });

    $(".reject").click(function(){
        var form = $(this).parents('form:first');
        var listItem = $(this).parents('li:first');
        submitForm(form, listItem);
    });

 });