/*
 * A little jQuery magic to make curating the projects nice
 */

 $(document).ready(function(){
    function submitForm (form) {
        //console.log(form);

        $.post(form[0].action, $(form).serialize(), function(data){
            //data = JSON.parse(data);
            console.log("Data Loaded: " + data);
        });
    }

    $('form').submit(function(e){
        e.preventDefault();
    });

    $(".approve").click(function(){
        var form = $(this).parents('form:first');
        submitForm(form);
    });

    $(".reject").click(function(){
        var form = $(this).parents('form:first');
        submitForm(form);
    });

 });