/**
 * Created by stevoperisic on 6/19/17.
 *
 * FE JS for the patient registration
 */

(function ($, window) {
    var app = window.app;

    app.patientRegistrationForm = {
        init: function(){
            // custom choice inputs via https://bootsnipp.com/snippets/NBN6x
            $('.radioBtn').find('span').on('click', function(){
                var sel = $(this).data('value');
                var tog = $(this).data('toggle');
                $('#'+tog).val(sel);
                // You can change these lines to change classes (Ex. btn-default to btn-danger)
                $('span[data-toggle="'+tog+'"]').not('[data-value="'+sel+'"]').removeClass('active btn-primary').addClass('notActive btn-default');
                $('span[data-toggle="'+tog+'"][data-value="'+sel+'"]').removeClass('notActive btn-default').addClass('active btn-primary');
            });

            // $('.collapse.in').removeClass('in');
            // $('#headingFour, #collapseFour').addClass('in');
        }
    };

    // update page init for this page
    app.page.init = app.patientRegistrationForm.init;

})(jQuery, window);
