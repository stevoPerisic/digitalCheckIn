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
        sigPadPatResps: $('#signature-pad-patResps').find('canvas')[0],
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

            // format the SSN filed input in the XXX-XX-XXXX always
            $('#ssn, #insurancepolicyholderssn').on('keyup', function (e) {
                var val = e.currentTarget.value.replace(/\D/g, '');
                var newVal = '';
                if (val.length > 4) {
                    this.value = val;
                }
                if ((val.length > 3) && (val.length < 6)) {
                    newVal += val.substr(0, 3) + '-';
                    val = val.substr(3);
                }
                if (val.length > 5) {
                    newVal += val.substr(0, 3) + '-';
                    newVal += val.substr(3, 2) + '-';
                    val = val.substr(5);
                }
                newVal += val;
                e.currentTarget.value = newVal.substring(0, 11);
            });

            // auto format the phone number
            $('[type="tel"]').on('keyup', function (e) {
                var val = e.currentTarget.value.replace(/\D/g, '');
                var newVal = '';
                if (val.length > 4) {
                    this.value = val;
                }
                if ((val.length > 3) && (val.length < 6)) {
                    newVal += '(' + val.substr(0, 3) + ')-';
                    val = val.substr(3);
                }
                if (val.length > 5) {
                    newVal += '(' + val.substr(0, 3) + ')-';
                    newVal += val.substr(3, 3) + '-';
                    val = val.substr(6);
                }
                newVal += val;
                e.currentTarget.value = newVal.substring(0, 14);
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

            $('#collapsePatRespos').on('shown.bs.collapse', function (e) {
                app.utilities.resizeCanvas();
                me.signaturePadPatResps = new SignaturePad(me.sigPadPatResps);
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
                $.each(prefilledfields, function (i, item) {
                    $(item).addClass('hidden');
                    $(item).next().removeClass('hidden');
                });
            });

            /**
             * Updating patient demographics
             * https://developer.athenahealth.com/docs/read/patientinfo/Patient_Information#section-5
             **/
            $('#patientDemographics').on('submit', function (e) {
                e.preventDefault();
                var data = app.utilities.getFormData($(e.currentTarget)),
                    $form = $(e.currentTarget);
                app.utilities.formSubmit(data, $form);
            });


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
