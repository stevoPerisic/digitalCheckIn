/**
 * Created by stevoperisic on 4/23/17.
 *
 * main JS for the app FE
 */

(function ($, window) {
    window.app = {
        page: {
            init: function () {
                return this;
            },
            bindGlobalEvents: function () {
                console.log('Binding global events');
                $('.panel-collapse .btn.next').on('click', function (e) {
                    e.preventDefault();
                    var parentCollapse = $(e.currentTarget).parents('.panel-collapse');
                    console.log('Run form verification on the fields here');
                    parentCollapse.collapse('hide');
                    parentCollapse.parents('.panel').next().find('.panel-collapse').collapse('show')
                });
            }
        },
        utilities: {
            /**
             * Adjust canvas coordinate space taking into account pixel ratio,
             * to make it look crisp on mobile devices.
             * This also causes canvas to be cleared.
             */
            resizeCanvas: function () {
                var sigPads = $('canvas');
                // When zoomed out to less than 100%, for some very strange reason,
                // some browsers report devicePixelRatio as less than 1
                // and only part of the canvas is cleared then.
                var ratio = Math.max(window.devicePixelRatio || 1, 1);

                sigPads.each(function (i, sigPad) {
                    sigPad.width = sigPad.offsetWidth * ratio;
                    sigPad.height = sigPad.offsetHeight * ratio;
                    sigPad.getContext("2d").scale(ratio, ratio);
                });
            },
            /*
             * creates the functionality for the custom inputs component
             * user can enter data into th efileds and t=it will be listed out above the component on
             * the click of the "Add" button
             * this is used to generate lists of medication, medical procedures and such
             * */
            createCustListInputs: function () {
                // get all the custom list inputs
                var componentsArr = $('.custListInput');
                var populateList = function (evt) {
                    evt.preventDefault();

                    var $list = $(this).parent().prev();
                    var inputs = $(this).siblings('input');
                    var values = '';

                    inputs.each(function (i, el) {
                        values = values + $(el).val() + ' ';
                        $(el).val('');
                    });

                    $list.append('<li>' + values + '</li>');
                };

                // iterate over the array and process
                componentsArr.each(function (i, component) {
                    // assign the click event to the buttons
                    $(component).find('.addToList').on('click', populateList);
                });
            },
        }
    };

    $('document').ready(function () {
        var app = window.app;
        app.page.bindGlobalEvents();
        app.page.init();
    });

})($, window);

