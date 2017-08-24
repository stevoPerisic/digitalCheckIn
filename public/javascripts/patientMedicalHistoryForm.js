/**
 * Created by stevoperisic on 6/28/17.
 *
 * FE JS for the patient registration
 */

(function ($, window) {
    var app = window.app;

    app.patientMedicalHistoryForm = {
        $medicalHistoryForm: $('#medicalHistoryForm'),
        bindEvents: function () {
            var me = app.patientMedicalHistoryForm;

            $('.custChkBx.chkBx').on('click', function (e) {
                $(e.currentTarget).toggleClass('checked');
            });

            // custom choice inputs via https://bootsnipp.com/snippets/NBN6x
            $('.radioBtn').find('span').on('click', function(){
                var sel = $(this).data('value');
                var tog = $(this).data('toggle');
                $('#'+tog).val(sel);
                // You can change these lines to change classes (Ex. btn-default to btn-danger)
                $('span[data-toggle="'+tog+'"]').not('[data-value="'+sel+'"]').removeClass('active btn-primary').addClass('notActive btn-default');
                $('span[data-toggle="'+tog+'"][data-value="'+sel+'"]').removeClass('notActive btn-default').addClass('active btn-primary');
            });

            $('.addrow').on('click', function(e){
                e.preventDefault();
                var tbody = $(this).parents('table').find('tbody');
                var newRow = $('<tr>');
                tbody.find('.tableFormInputs input').each(function(i, el){
                    newRow.append('<td>'+$(el).val()+'</td>');
                    $(el).val('');
                });
                tbody.prepend(newRow);
            });

            /**
             * Updating medical history
             * https://developer.athenahealth.com/docs/read/patientinfo/Patient_Information#section-5
             * */
            $('.btn.submit').on('click',
                {form: me.$medicalHistoryForm, URL:'/patientMedicalHistory' },
                app.utilities.formSubmit
            );
        },
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
