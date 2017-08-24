/**
 * Created by stevoperisic on 7/1/17.
 *
 * FE JS for the annual wellness form
 */

(function ($, window) {
    var app = window.app;

    app.annualWellnessForm = {
        $annualWellnessForm: $('#annualWellnessForm'),
        sigPadAdvancedDirective: $('#signature-pad-advancedDirective canvas')[0],
        sigPadReviewedBy: $('#signature-pad-reviewedBySignature canvas')[0],
        bindEvents: function () {
            var me = app.annualWellnessForm;

            $('.custChkBx.chkBx').on('click', function (e) {
                $(e.currentTarget).toggleClass('checked');
            });

            // custom choice inputs via https://bootsnipp.com/snippets/NBN6x
            $('.radioBtn').find('span').on('click', function () {
                var sel = $(this).data('value');
                var tog = $(this).data('toggle');
                $('#' + tog).val(sel);
                // You can change these lines to change classes (Ex. btn-default to btn-danger)
                $('span[data-toggle="' + tog + '"]').not('[data-value="' + sel + '"]').removeClass('active btn-primary').addClass('notActive btn-default');
                $('span[data-toggle="' + tog + '"][data-value="' + sel + '"]').removeClass('notActive btn-default').addClass('active btn-primary');
            });

            $('#signature-pad-advancedDirective').find('[data-action=clear]').on('click', function (event) {
                me.signaturePadAdvancedDirective.clear();
            });

            $('#signature-pad-advancedDirective').find('[data-action=save]').on('click', function (event) {
                if (me.signaturePadAdvancedDirective.isEmpty()) {
                    alert("Please provide signature first.");
                } else {
                    window.open(me.signaturePadAdvancedDirective.toDataURL());
                }
            });

            $('#signature-pad-reviewedBySignature').find('[data-action=clear]').on('click', function (event) {
                me.signaturePadReviewedBy.clear();
            });

            $('#signature-pad-reviewedBySignature').find('[data-action=save]').on('click', function (event) {
                if (me.signaturePadReviewedBy.isEmpty()) {
                    alert("Please provide signature first.");
                } else {
                    window.open(me.signaturePadReviewedBy.toDataURL());
                }
            });

            $('#collapseTwelve').on('shown.bs.collapse', function (e) {
                app.utilities.resizeCanvas();
                me.signaturePadAdvancedDirective = new SignaturePad(me.sigPadAdvancedDirective);
                me.signaturePadReviewedBy = new SignaturePad(me.sigPadReviewedBy);
            });

            /**
             * Updating Annual Wellness data
             * */
            $('.btn.submit').on('click',
                {form: me.$annualWellnessForm, URL:'/annualWellnessVisit' },
                app.utilities.formSubmit
            );
        },
        /*
         * Init function for the page
         * */
        init: function () {
            var me = app.annualWellnessForm;

            me.bindEvents();
            app.utilities.createCustListInputs();
            app.utilities.formSetUp();

            window.onresize = app.utilities.resizeCanvas;

            $('.loaderOverlay').hide();
        }
    };

    // update page init for this page
    app.page.init = app.annualWellnessForm.init;

})(jQuery, window);

