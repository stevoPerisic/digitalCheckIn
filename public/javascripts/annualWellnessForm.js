/**
 * Created by stevoperisic on 7/1/17.
 *
 * FE JS for the annual wellness form
 */

(function ($, window) {
    var app = window.app;

    app.annualWellnessForm = {
        /*
        * creates the functionality for the custom inputs component
        * user can enter data into th efileds and t=it will be listed out above the component on
        * the click of the "Add" button
        * this is used to generate lists of medication, medical procedures and such
        * */
        createCustListInputs: function(){
            // get all the custom list inputs
            var componentsArr = $('.custListInput');
            var populateList = function(evt){
                evt.preventDefault();

                var $list = $(this).parent().prev();
                var inputs = $(this).siblings('input');
                var values = '';

                inputs.each(function(i, el){
                    values = values + $(el).val() + ' ';
                    $(el).val('');
                });

                $list.append('<li>'+values+'</li>');
            };

            // iterate over the array and process
            componentsArr.each(function(i, component){
                // assign the click event to the buttons
               $(component).find('.addToList').on('click', populateList);
            });


        },
        /*
        * Init function for the page
        * */
        init: function(){
            var me = app.annualWellnessForm;

            // custom choice inputs via https://bootsnipp.com/snippets/NBN6x
            $('.radioBtn').find('span').on('click', function(){
                var sel = $(this).data('value');
                var tog = $(this).data('toggle');
                $('#'+tog).val(sel);
                // You can change these lines to change classes (Ex. btn-default to btn-danger)
                $('span[data-toggle="'+tog+'"]').not('[data-value="'+sel+'"]').removeClass('active btn-primary').addClass('notActive btn-default');
                $('span[data-toggle="'+tog+'"][data-value="'+sel+'"]').removeClass('notActive btn-default').addClass('active btn-primary');
            });

            me.createCustListInputs();

            $('.loaderOverlay').hide();
        }
    };

    // update page init for this page
    app.page.init = app.annualWellnessForm.init;

})(jQuery, window);

