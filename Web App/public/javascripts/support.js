$(document).ready(function(){

    $.validator.addMethod('filesize', function(value, element, param) {
        var fileList = $(element)[0].files;

        if (!fileList[0]) {
            return true; // No file? No problem.
        } else {
            return (fileList[0].size <= param);
        }
    });

    $.validator.addMethod('filedimensions', function(value, element, param) {
        var img = new Image(), file, height, width, fileList = $(element)[0].files;
        if (!fileList[0] && (!element.name != "asset1")) {
            return true; // No file? No problem.
        } else {
            
            img.onload = function(){
                height = img.naturalHeight;
                width = img.naturalWidth;
            };

            img.src = window.URL.createObjectURL(fileList[0]);

            while (img.complete){
                
            }

            console.log("width: " + width + "height: " + height)
            console.log("param:" + param);

            return (width >= param || height >= param);
        }
    });

    $.validator.addMethod('filequota', function(element) {


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

            image1 : { accept : "image/*", filesize : "524288", filedimensions : 1500, required : true },

            image2 : { accept : "image/*", filesize : "524288", filedimensions : 1500 },

            image3 : { accept : "image/*", filesize : "524288", filedimensions : 1500 },

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

            image1 : { accept : "File must be JPG.", filesize : "File must be less than 500kb", filedimensions : "At least one dimension must measure 1500px" },

            image2 : { accept : "File must be JPG.", filesize : "File must be less than 500kb", filedimensions : "At least one dimension must measure 1500px" },

            image3 : { accept : "File must be JPG.", filesize : "File must be less than 500kb", filedimensions : "At least one dimension must measure 1500px" },

            video : "URL must be a valid Vimeo URL",


        },

        submitHandler: function(form) {form.submit();},

        debug: true
   });
});