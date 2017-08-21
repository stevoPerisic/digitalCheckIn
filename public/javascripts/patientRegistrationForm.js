/**
 * Created by stevoperisic on 6/19/17.
 *
 * FE JS for the patient registration
 */


(function ($, window) {
    var app = window.app;

    app.patientRegistrationForm = {
        sigPad: $('canvas')[0],
        // Adjust canvas coordinate space taking into account pixel ratio,
        // to make it look crisp on mobile devices.
        // This also causes canvas to be cleared.
        resizeCanvas: function () {
            var me = app.patientRegistrationForm;
            // When zoomed out to less than 100%, for some very strange reason,
            // some browsers report devicePixelRatio as less than 1
            // and only part of the canvas is cleared then.
            var ratio =  Math.max(window.devicePixelRatio || 1, 1);
            me.sigPad.width = me.sigPad.offsetWidth * ratio;
            me.sigPad.height = me.sigPad.offsetHeight * ratio;
            me.sigPad.getContext("2d").scale(ratio, ratio);
        },
        bindEvents: function () {
            var me = app.patientRegistrationForm;

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

            $('[data-action=clear]').on('click', function (event) {
                me.signaturePad.clear();
            });

            $('[data-action=save]').on('click', function (event) {
                if (me.signaturePad.isEmpty()) {
                    alert("Please provide signature first.");
                } else {
                    window.open(me.signaturePad.toDataURL());
                }
            });

            $('#collapseFive').on('shown.bs.collapse', function (e) {
               // console.log(e);
                me.resizeCanvas();
                me.signaturePad = new SignaturePad(me.sigPad);
            });
        },
        formSetUp: function () {
            // Update customToggle elements with selected values, if any
            $('.custToggle-group').each(function (i, el) {
                $(el).children('[data-value="' + el.dataset.selected + '"]')
                    .removeClass('notActive')
                    .addClass('active');
            });

            // Update the custom selects with the known patient data
            $('.custSelect select').each(function (i, el) {
                $(el).children('[value="' + el.dataset.selected + '"]')
                    .prop('selected', 'selected')
            });

            // hide all the input fields next to the patient filled data from the server
            $('.patientDataFilled[data-show="true"]').next().hide();

            // insured/responsible party relationship select
            $('#relationshiptoinsuredid').on('change', function(e){
                if(e.currentTarget.value !== '1'){
                    $('.relationshiptoinsurediddata').removeClass('hidden');
                } else {
                    $('.relationshiptoinsurediddata').addClass('hidden');
                }
            })
        },
        init: function () {
            var me = app.patientRegistrationForm;

            me.formSetUp();
            me.bindEvents();

            window.onresize = me.resizeCanvas;

            $('.loaderOverlay').hide();
        }
    };

    // update page init for this page
    app.page.init = app.patientRegistrationForm.init;

})(jQuery, window);
