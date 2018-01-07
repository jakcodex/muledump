$(function() {
    // Set empty variables for background, text, and image
    var bgColor, textColor, bgImage;
    // Check if localStorage is available (if not user must set items on each load)
    if (typeof(Storage) !== 'undefined') {
        // Check if a background color is defined
        if (localStorage.bgColor) {
            // If it is get the color and set the background of the page
            bgColor = localStorage.getItem("bgColor");
            $("body").css('background-color', bgColor);
            $('#background_color').val(bgColor.replace("#", ''));
        }
        // Same as above
        if (localStorage.textColor) {
            textColor = localStorage.getItem("textColor");
            $("body").css('color', textColor);
        }
        // Same as above
        if (localStorage.bgImage) {
            bgImage = localStorage.getItem("bgImage");
            $('#bgImage').css({
                'background': "url('./lib/images/" + bgImage + "') center center no-repeat",
                'background-size': "cover"
            })
        }
    }
    // Listen for changes in the background color input
    $('#background_color').on('change', function() {
        var value = this.value.replace("#", '');
        // Check if the input is a valid color in hexadecimal format
        var color = /([0-9A-F]{6}$)|([0-9A-F]{3}$)/i.test(value);
        // If it is valid...
        if (color) {
            $('body').css({
                'background-color': "#" + value
            });
            // Remove the background image from localstorage since the user now wants to use a color
            localStorage.removeItem("bgImage");
            // Set the background color in local storage
            localStorage.setItem("bgColor", "#" + value);
        }
    });
    // Listen for changes in the text color input
    $('#text_color').on('change', function() {
        var value = this.value.replace("#", '');
        // Check if the input is a valid color
        var color = /([0-9A-F]{6}$)|([0-9A-F]{3}$)/i.test(value);
        // If it is valid...
        if (color) {
            // Set the global text color to the passed in value
            $('body').css('color', "#" + value);
            // Set the localstorage textColor to the passed in value
            localStorage.setItem("textColor", "#" + value);
        }
    });
    // Listen for a filepath change in the background image input
    $('#background_image').on('change', function() {
        // Remove the fakepath from the image URL
        var imgpath = this.value.split('\\');
        imgpath = imgpath[imgpath.length - 1];
        // Set the bgImage in localstorage to the new imgpath
        localStorage.setItem("bgImage", imgpath);
        // Remove the bgColor from localstorage since the user now wants to use an image
        localStorage.removeItem("bgColor");
        // Set the background of the page to the image provided.
        $('#bgImage').css({
            'background-image': "url('./lib/images/" + imgpath + "')"
        })
    });

    $("input:radio[name='radio_color']").click(function() {
        localStorage.removeItem("bgImage");
        $("body").css('background', this.value);
        localStorage.setItem("bgColor", this.value);
        $('#background_color').val(this.value.replace("#", ''));
    });
    $("input:radio[name='text_color']").click(function() {
        $("body").css('color', this.value);
        localStorage.setItem("textColor", this.value);
        $('#text_color').val(this.value.replace("#", ''));
    });

    $("#reset_button").click(function() {
        $('body').css({
            'background': "#363636",
            "color": "#b3b3b3"
        });
        localStorage.removeItem("bgColor");
        localStorage.removeItem("textColor");
        localStorage.removeItem("bgImage");
    })
});