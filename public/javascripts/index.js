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
                var that = this;

                e.preventDefault();

                $('.loaderOverlay').show();

                // start the check-in flow
                $.ajax({
                    url: '/appointments/'+that.dataset.apptid+'/startcheckin/',
                    method: 'GET'
                }).then(function(data){
                    console.log(data);

                    // set the apptId cookie
                    var date = new Date();
                    var minutes = 30;
                    date.setTime(date.getTime() + (minutes * 60 * 1000));
                    console.log(document.cookie);

                    document.cookie = 'apptid='+that.dataset.apptid+'; path="/"; expires='+date.toGMTString();
                    document.cookie = 'patientid='+that.dataset.patientid+'; path="/"; expires='+date.toGMTString();

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
