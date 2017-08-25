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
             * @description Format phone numbers
             * @function formatPhoneNumber
             * @param s {string} - string to format into the phone number formatting (***) *** - *****
             * @returns formatted string in the format (***) *** - *****
             **/
            formatPhoneNumber: function (s) {
                var s2 = ("" + s).replace(/\D/g, '');
                var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
                return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
            },
            /**
             * @description Adjust canvas coordinate space taking into account pixel ratio,
             * to make it look crisp on mobile devices.
             * This also causes canvas to be cleared.
             * @function resizeCanvas
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
            /**
             * @description Creates the functionality for the custom inputs component
             * user can enter data into th efileds and t=it will be listed out above the component on
             * the click of the "Add" button.
             * This is used to generate lists of medication, medical procedures and such
             * @function createCustListInputs
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
            /**
             * @description Sets up the custom form components such as
             * - the Custom toggle component
             * - the Custom select component
             * - the Patient pre-filled data component -> hide the input fields
             * @function formSetUp
             * */
            formSetUp: function () {
                /**
                 * Update customToggle elements with selected values, if any
                 **/
                $('.custToggle-group').each(function (i, el) {
                    var selectedToggle = $(el).children('[data-value="' + el.dataset.selected + '"]');

                    selectedToggle.removeClass('notActive btn-default').addClass('active btn-primary');
                    selectedToggle.siblings().removeClass('active btn-primary').addClass('notActive btn-default');
                });

                /**
                 * Update the custom selects with the known patient data
                 **/
                $('.custSelect select').each(function (i, el) {
                    $(el).children('[value="' + el.dataset.selected + '"]')
                        .prop('selected', 'selected')
                });

                /**
                 * hide all the input fields next to the patient filled data from the server
                 **/
                $('.patientDataFilled[data-show="true"]').next().addClass('hidden');

                /**
                 * set up validation
                 **/
                $.validate({
                    modules: 'location, date, security, file',
                    onModulesLoaded: function () {
                        // $('#country').suggestCountry();
                        console.log('modules loaded');
                    }
                });
            },
            /**
             * @description General form submit helper to get only the inputs that are being updated
             * @function formSubmit
             * @param evt {object} the submit button event so that we can preventDefault
             * @param evt.data.form {object} jQuery form object that is collected on each form page
             * @param evt.data.URL {string} URL to POST to
             **/
            formSubmit: function (evt) {
                evt.preventDefault();
                var $form = evt.data.form;
                var URL = evt.data.URL;
                var formData = $form.serializeArray();
                var data = {};

                /**
                 * @todo add validator data attributes to the input fields so that the validator would actually run
                 **/
                $form.validate();

                formData.forEach(function (input, i) {
                    /**
                     * check if the input is still hidden and the user did NOT reveal it
                     * to update by clicking the Edit btn thus revealing the input field
                     **/
                    if (!$('input[name=' + input.name + ']').parent().hasClass('hidden')) {
                        data[input.name] = input.value;
                    }
                });

                $.ajax({
                    method: 'POST',
                    url: URL,
                    data: data,
                    contentType: 'application/x-www-form-urlencoded'
                }).done(function (data, xhr) {
                    console.log(data);
                    console.log(xhr);
                    if (xhr === 'success') {
                        $form.parents('.panel-collapse').siblings('.panel-heading').addClass('success');
                    }
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

