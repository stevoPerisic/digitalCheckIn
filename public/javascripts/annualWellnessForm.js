/**
 * Created by stevoperisic on 7/1/17.
 *
 * FE JS for the annual wellness form
 */

(function ($, window) {
    var app = window.app;

    app.annualWellnessForm = {
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

            $('.addToList').on('click', function(e){
               e.preventDefault();
               var listEl = $(this).data('value');
               var list = $(this).data('list');
               var $listItemValue = $('#'+listEl);

               $('.'+list).append('<li>'+$listItemValue.val()+'</li>');

                $listItemValue.val('');
            });
        }
    };

    // update page init for this page
    app.page.init = app.annualWellnessForm.init;

})(jQuery, window);

