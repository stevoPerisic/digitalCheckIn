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

                var that = this;

                // start the check-in flow
                // 1) call checkIn API - returns
                $.ajax({
                    url: '/appointments/'+that.dataset.apptId+'/checkIn/',
                    method: 'GET'
                }).then(function(data){
                    console.log(data);
                    window.location = '/patientRegistration/'+that.dataset.patientId;
                    // fire off the form filling :)

                    // 1) Demographics
                    // 2) Consent Forms
                    // 3) Health History Forms
                    // 4) Insurance

                    // Preferably some of this can be pre-filled at the front desk
                    // by scanning the ID and insurance card

                }).catch(function(err){
                    console.log(err);
                });
            });
        }
    };

    // update page init for this page
    app.page.init = app.appointments.init;

})(jQuery, window);