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
            /**
             * @description bindGlobalEvents | Bind app wide events
             * - click event for the "Next" button in the accordion, also SUBMITS THE PARENT FORM!
             **/
            bindGlobalEvents: function () {
                console.log('Binding global events');

                $('.panel-collapse .btn.next').on('click', function (e) {
                    e.preventDefault();
                    var parentCollapse = $(e.currentTarget).parents('.panel-collapse');

                    /**
                     * Submit the parent form
                     * @todo form validation
                     **/
                    $(e.currentTarget).parents('form').submit();

                    parentCollapse.collapse('hide');
                    parentCollapse.parents('.panel').next().find('.panel-collapse').collapse('show');
                });

                /**
                 * Click the edit link and show the input field
                 **/
                $('.patientDataFilled .edit').on('click', function (e) {
                    e.preventDefault();

                    $(this).parents('.patientDataFilled').next().removeClass('hidden').find('input').focus();
                    $(this).parents('.patientDataFilled').addClass('hidden');
                });

                /**
                 * Login form submit loading overlay
                 **/
                $('.logInForm').on('submit', function () {
                    $('.loaderOverlay').show();
                })
            }
        },
        utilities: {
            /**
             * @function initGMap
             * @description Initialize Google Map for pharmacies
             **/
            initGMap: function () {
                /**
                 * @todo one more call once the pharmacy name is submitted by the input filed on the form
                 * @todo add onclick listener to teh markers to save the users preference of pharmacy
                 **/
                window.app.utilities.map = this.map || {};
                var geocoder = new google.maps.Geocoder();
                var myOptions = {
                    zoom: 7,
                    // center: new google.maps.LatLng(0, 0),
                    mapTypeId: 'terrain'
                };
                window.app.utilities.map = new google.maps.Map($('#map')[0], myOptions);
                geocoder.geocode({'address': patLoc}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        //In this case it creates a marker, but you can get the lat and lng from the location.LatLng
                        window.app.utilities.map.setCenter(results[0].geometry.location);
                    } else {
                        alert('Geocode was not successful for the following reason: ' + status);
                    }
                });

                // var addresses = ['Norway', 'Africa', 'Asia', 'North America', 'South America'];

                // window.app.utilities.gMap_addPahramacies(addresses);
            },
            /**
             * @function gMap_addPahramacies
             * @description Add addresses to the map as markers
             **/
            gMap_addPahramacies: function (pharmacies) {
                var markers = [];
                for (var x = 0; x < pharmacies.length; x++) {
                    $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + pharmacies[x] + '&sensor=false', null, function (data) {
                        var p = data.results[0].geometry.location
                        var latlng = new google.maps.LatLng(p.lat, p.lng);
                        markers.push(new google.maps.Marker({
                            position: latlng,
                            map: window.app.utilities.map
                        }));

                        markers.forEach(function (marker) {
                            marker.addListener('click', function () {
                                //map.setZoom(8);
                                //map.setCenter(marker.getPosition());
                                console.log(marker);
                            });
                        })

                    });
                }
            },
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
             * @description Serializes the form inputs into an array and transforms it into a JSON onbect for submission
             * @function getFormData
             * @param $form {object} form DOM element
             **/
            getFormData: function ($form) {
                var data = {};
                var formData = $form.serializeArray();
                formData.forEach(function (input, i) {
                    /**
                     * check if the input is still hidden and the user did NOT reveal it
                     * to update by clicking the Edit btn thus revealing the input field
                     **/
                    if (!$('input[name=' + input.name + ']').parent().hasClass('hidden')) {
                        data[input.name] = input.value;
                    }
                });
                return data;
            },
            /**
             * @description General form submit helper to send a POST request
             * @function formSubmit
             * @param data {object} data to send via the POST
             * @param $form {object} jQuery form object that is collected on each form page
             **/
            formSubmit: function (data, $form) {
                /**
                 * add patient and appt id from session storage to the data
                 **/
                $.ajax({
                    method: 'POST',
                    url: $form[0].dataset.url,
                    data: data,
                    contentType: 'application/x-www-form-urlencoded'
                    /*beforeSend: function(request) {
                     request.setRequestHeader('patientid', sessionStorage.getItem('patientid'));
                     request.setRequestHeader('apptid', sessionStorage.getItem('apptid'));
                     }*/
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

        console.log('Remove appt. related cookies');
        /**
         * @todo Why am I removing cookies here????
         * @todo perhaps store the patient id and teh appt id in the session storage?
         * @todo clear the session once the user has checked in
         **/
        document.cookie = "apptid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "patientid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        app.page.bindGlobalEvents();
        app.page.init();
    });

})($, window);

