/**
 * Created by stevoperisic on 6/28/17.
 *
 * FE JS for the patient registration
 */

(function ($, window) {
    var app = window.app;

    app.patientMedicalHistoryForm = {
        bindEvents: function () {
            $('.custChkBx.chkBx').on('click', function (e) {
                $(e.currentTarget).toggleClass('checked');
            });
        },

        init: function () {
            console.log('Patient Medical History Form started...');

            var me = app.patientMedicalHistoryForm;

            me.bindEvents();
        }
    };

    // update page init for this page
    app.page.init = app.patientMedicalHistoryForm.init;

})(jQuery, window);
