/**
 * Created by stevoperisic on 5/14/17.
 *
 * Appointments specific scripts
 */

(function ($, window) {
    var app = window.app;

    app.appointments = {
        init: function(){
            $('.apptRow').on('click', function(){
                console.log(this.dataset);

                // start the check-in flow
                // 1) call checkIn API - returns 
            });
        }
    };

    // update page init for this page
    app.page.init = app.appointments.init;

})(jQuery, window);