$(document).ready(function(){

    $.validator.addMethod('filesize', function(value, element, param) {
        var fileList = $(element)[0].files;

        if (!fileList[0]) {
            return true; // No file? No problem. TODO: validate at least one photo is attached to form
        } else {
            return (fileList[0].size <= param);
        }
    });
    var dimensions = {};


    $.validator.addMethod('filedimensions', function(value, element, param) {
        // TODO: Read in JPG headers, grab dimensions, reject accordingly
    });

    $.validator.addMethod('ecuad', function(value, element) {
        // This may be the tersest thing I've written in a long time
        // I regret nothing
        return ((value.substring(value.indexOf('@')) === "@ecuad.ca") || (value.substring(value.indexOf('@')) === "@steamclock.com")); 
    });

    $.validator.addMethod('vimeo', function(value, element) {
        if(value != ""){
            var provider = value.match(/http:\/\/(:?www.)?(\w*)/)[2];
            return (provider === "vimeo"); 
        } else {
            return true; // if there's just an empty string, we don't care
        }
    });

    $("#projectSubmission").validate({
        rules: {
            author: "required",

            email: {
                required : true,
                email : true,
                ecuad : true
            },

            title : "required",

            medium : "required",

            image1 : { accept : "image/*", filesize : "524288", required : true },

            image2 : { accept : "image/*", filesize : "524288" },

            image3 : { accept : "image/*", filesize : "524288" },

            video : { vimeo : true },



        },

        messages : {

            author: "Please fill in your name.",

            email: {
                required: "A valid ecuad.ca email is required",
                email: "A valid ecuad.ca email is required",
                ecuad: "Please enter an ecuad.ca address only"
            },

            title: "A title for your project is required",

            medium: "Please tell us what your project is made of",

            image1 : { accept : "File must be JPG.", filesize : "File must be less than 500kb" },

            image2 : { accept : "File must be JPG.", filesize : "File must be less than 500kb" },

            image3 : { accept : "File must be JPG.", filesize : "File must be less than 500kb" },

            video : "URL must be a valid Vimeo URL",


        },

        submitHandler: function(form) {form.submit();},

        debug: true
   });
});