/**
 * Created by stevoperisic on 6/28/17.
 *
 * FE JS for the patient registration
 */

(function ($, window) {
    var app = window.app;

    app.patientMedicalHistoryForm = {
        $medicalHistoryForm: $('#medicalHistoryForm'),
        /**
         * @function bindEvents
         * @description Bind jQuery events to DOM elements
         **/
        bindEvents: function () {
            var me = app.patientMedicalHistoryForm;

            /** Custom check-box click event **/
            $('.custChkBx.chkBx').on('click', function (e) {
                var checkBox = $(e.currentTarget)
                    .parents('.form-check')
                    .find('input.custChkBx.form-check-input');

                checkBox.attr('checked', !checkBox.attr('checked'));

                $(e.currentTarget).toggleClass('checked');
            });

            /**
             * Custom choice inputs Click event
             * via https://bootsnipp.com/snippets/NBN6x
             **/
            $('.radioBtn').find('span').on('click', function () {
                var sel = $(this).data('value');
                var tog = $(this).data('toggle');
                $('#' + tog).val(sel);
                // You can change these lines to change classes (Ex. btn-default to btn-danger)
                $('span[data-toggle="' + tog + '"]').not('[data-value="' + sel + '"]').removeClass('active btn-primary').addClass('notActive btn-default');
                $('span[data-toggle="' + tog + '"][data-value="' + sel + '"]').removeClass('notActive btn-default').addClass('active btn-primary');
            });

            /** Add a row on the table **/
            $('.addrow').on('click', function (e) {
                e.preventDefault();
                var tbody = $(this).parents('table').find('tbody');
                var newRow = $('<tr>');
                tbody.find('.tableFormInputs input').each(function (i, el) {
                    newRow.append('<td>' + $(el).val() + '</td>');
                    $(el).val('');
                });
                tbody.find('tr:last-child').prepend(newRow);
            });

            /** Personal Information form Submit event **/
            // $('#personalInformationForm').on('submit', me.pIFormSubmit);

            /** Family History form Submit event **/
            // $('#familyHistory').on('submit', me.fHFormSubmit);

            /** All forms submit **/
            $('form').on('submit', function (e) {
                e.preventDefault();
                var $form = $(e.currentTarget);

                if (e.currentTarget.id === 'personalInformationForm') {
                    me.pIFormSubmit(e);
                } else if (e.currentTarget.id === 'familyHistory') {
                    me.fHFormSubmit(e);
                } else {
                    app.utilities.formSubmit( app.utilities.getFormData($form), $form )
                }
            });
        },
        /**
         * @function pIFormSubmit
         * @description Submit the Personal Information form
         * @param {object} e Event object passed in by the $.on func call
         **/
        pIFormSubmit: function (e) {
            e.preventDefault();
            var data = app.utilities.getFormData($(e.currentTarget)),
                $form = $(e.currentTarget),
                /** Having issues picking up the checkboxes using form.serializeArray() **/
                $checkboxes = $form.find('input[type="checkbox"]'),
                $customAllergies = $('.customAllergiesList');

            /** Create an allergies array to store allergies **/
            data.allergies = [];
            $checkboxes.each(function (i, chkbox) {
                if (chkbox.attributes.checked) {
                    console.log(chkbox.value);
                    data.allergies.push(chkbox.value)
                }
            });

            if ($customAllergies.length > 0) {
                data.customAllergies = [];
                $customAllergies.children().each(function (i, li) {
                    data.customAllergies.push(li.textContent);
                });
            }

            app.utilities.formSubmit(data, $form);
        },
        /**
         * @function fHFormSubmit
         * @description Submit the Family History form
         * @param {object} e Event object passed in by the $.on func call
         **/
        fHFormSubmit: function (e) {
            e.preventDefault();
            var data = app.utilities.getFormData($(e.currentTarget)),
                $form = $(e.currentTarget);

            console.log(data);
        },
        /**
         * @function init
         * @description Initialize the Patient Medical History Form page
         **/
        init: function () {
            console.log('Patient Medical History Form started...');

            var me = app.patientMedicalHistoryForm;

            me.bindEvents();
            app.utilities.createCustListInputs();
            app.utilities.formSetUp();

            $('.loaderOverlay').hide();
        }
    };

    // update page init for this page
    app.page.init = app.patientMedicalHistoryForm.init;

})(jQuery, window);
