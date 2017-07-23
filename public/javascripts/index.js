/**
 * Created by stevoperisic on 7/14/17.
 *
 * home page specific scripts
 */

(function ($, window) {
    var app = window.app;

    app.homePage = {
        bindEvents: function(){
            $('.start-check-in').on('click', function(e){
                e.preventDefault();

                $('.loaderOverlay').show();

                console.log('first POST to /appointments/:apptId/startcheckin/');
                var that = this;

                // start the check-in flow
                $.ajax({
                    url: '/appointments/'+that.dataset.apptid+'/startcheckin/',
                    method: 'GET'
                }).then(function(data){
                    console.log(data);
                    window.location = '/patientRegistration/'+that.dataset.apptid+'/'+that.dataset.patientid;
                }).catch(function(err){
                    console.log(err);
                    $('.loaderOverlay').hide();
                });
            });
        },
        init: function(){
            console.log('Init home page');
            var me = app.homePage;

            me.bindEvents();
        }
    };

    // update page init for this page
    app.page.init = app.homePage.init;

})(jQuery, window);
