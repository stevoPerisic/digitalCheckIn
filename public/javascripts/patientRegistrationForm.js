/**
 * Created by stevoperisic on 6/19/17.
 *
 * FE JS for the patient registration
 */

/*
 * For submitting privacy verification refer to :
 * https://developer.athenahealth.com/docs/read/patientinfo/Verify_Privacy_Information
 *
 * */


(function ($, window) {
    var app = window.app;

    app.patientRegistrationForm = {
        sigPad: $('#signature-pad').find('canvas')[0],
        sigPadWitness: $('#signature-pad-witness').find('canvas')[0],
        $patientRegistrationForm: $('#patientRegistrationForm'),
        bindEvents: function () {
            var me = app.patientRegistrationForm;
            var sigPad = $('#signature-pad');
            var sigPadWitness = $('#signature-pad-witness');

            // custom choice inputs via https://bootsnipp.com/snippets/NBN6x
            $('.radioBtn').find('span').on('click', function () {
                var sel = $(this).data('value');
                var tog = $(this).data('toggle');
                $('#' + tog).val(sel);
                // You can change these lines to change classes (Ex. btn-default to btn-danger)
                $('span[data-toggle="' + tog + '"]').not('[data-value="' + sel + '"]').removeClass('active btn-primary').addClass('notActive btn-default');
                $('span[data-toggle="' + tog + '"][data-value="' + sel + '"]').removeClass('notActive btn-default').addClass('active btn-primary');
            });

            // if patient wants to edit just click the edit link and show the input field
            $('.patientDataFilled .edit').on('click', function (e) {
                e.preventDefault();

                $(this).parents('.patientDataFilled').next().show();
                $(this).parents('.patientDataFilled').hide();
            });

            sigPad.find('[data-action=clear]').on('click', function (event) {
                me.signaturePad.clear();
            });

            sigPad.find('[data-action=save]').on('click', function (event) {
                if (me.signaturePad.isEmpty()) {
                    alert("Please provide signature first.");
                } else {
                    window.open(me.signaturePad.toDataURL());
                }
            });

            sigPadWitness.find('[data-action=clear]').on('click', function (event) {
                me.signaturePadWitness.clear();
            });

            sigPadWitness.find('[data-action=save]').on('click', function (event) {
                if (me.signaturePadWitness.isEmpty()) {
                    alert("Please provide signature first.");
                } else {
                    window.open(me.signaturePadWitness.toDataURL());
                }
            });

            $('#collapseFive').on('shown.bs.collapse', function (e) {
                app.utilities.resizeCanvas();
                me.signaturePad = new SignaturePad(me.sigPad);
                me.signaturePadWitness = new SignaturePad(me.sigPadWitness);
            });

            // insured/responsible party relationship select
            $('#relationshiptoinsuredid').on('change', function (e) {
                var $relationshiptoinsurediddata = $('.relationshiptoinsurediddata');

                if (e.currentTarget.value !== '1') {
                    $relationshiptoinsurediddata.removeClass('hidden');
                } else {
                    $relationshiptoinsurediddata.addClass('hidden');
                }
                /**
                 * Remove the pre-filled insurance related data when the user changes the relationship drop-down
                 **/
                var prefilledfields = $('.insuredRelationship').find('.patientDataFilled[data-show=true]');
                $.each(prefilledfields, function(i, item){
                    $(item).addClass('hidden');
                    $(item).next().removeClass('hidden');
                });
            });

            /**
             * Updating patient demographics
             * https://developer.athenahealth.com/docs/read/patientinfo/Patient_Information#section-5
             * */
            $('.btn.submit').on('click',
                {form: me.$patientRegistrationForm, URL:'/patientRegistration' },
                app.utilities.formSubmit
            );


            $('.btn.next').on('click',
                {form: $('#patientDemographics'), URL:'/patientRegistration/patient' },
                app.utilities.formSubmit
            );
        },
        init: function () {
            var me = app.patientRegistrationForm;

            app.utilities.formSetUp();
            me.bindEvents();

            window.onresize = app.utilities.resizeCanvas;

            $('.loaderOverlay').hide();
        }
    };

    // update page init for this page
    app.page.init = app.patientRegistrationForm.init;

})(jQuery, window);
