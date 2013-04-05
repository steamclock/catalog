$(document).ready(function(){

    $.validator.addMethod('filesize', function(value, element, param) {
        // param = size (en bytes) 
        // element = element to validate (<input>)
        // value = value of the element (file name)
        return this.optional(element) || (element.files[0].size <= param) 
    });

    $.validator.addMethod('ecuad', function(value, element) {
        // param = size (en bytes) 
        // element = element to validate (<input>)
        // value = value of the element (email address)
        return (value.substring(value.indexOf('@')) === "ecuad.ca"); 
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

            image1 : { accept : "image/*", filesize : "358400"},

            image2 : { accept : "image/*", filesize : "358400"},

            image3 : { accept : "image/*", filesize : "358400"}

        },

        messages : {

            author: "Please fill in your name.",

            email: {
                required: "A valid ecuad.ca email is required.",
                email: "A valid ecuad.ca email is required.",
                ecuad: "Please enter an ecuad.ca address only."

            },

            title: "A title for your project is required.",

            medium: "Please tell us what your project is made of.",

            image1 : { accept: "File must be JPG.", filesize: "File must be less than 350kb" },

            image2 : "File must be JPG and less than 350kb",

            image3 : "File must be JPG and less than 350kb"
        },

        submitHandler: function(form) {form.submit();},

        debug: true
   });
});