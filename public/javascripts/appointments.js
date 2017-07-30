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
                }).catch(function(err){
                    console.log(err);
                });
            });
        }
    };

    // update page init for this page
    app.page.init = app.appointments.init;

})(jQuery, window);