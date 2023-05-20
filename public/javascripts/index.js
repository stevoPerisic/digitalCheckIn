/**
 * Created by stevoperisic on 7/14/17.
 *
 * home page specific scripts
 */

(function ($, window) {
    var app = window.app;

    app.homePage = {
        /**
         * @todo MUST CHECK Patient readiness before starting check-in process
         **/
        bindEvents: function () {
            $('.start-check-in').on('click', function (e) {
                var that = this;
                e.preventDefault();

                var date = new Date();
                var minutes = 30;
                date.setTime(date.getTime() + (minutes * 60 * 1000));
                // console.log(document.cookie);
                document.cookie = 'apptid=' + that.dataset.apptid + '; path="/"; expires=' + date.toGMTString();
                document.cookie = 'patientid=' + that.dataset.patientid + '; path="/"; expires=' + date.toGMTString();

                /**
                 * @todo start loading patient data async with the start-check-in call
                 * - this way some of the data should be pre-loaded
                 **/
                $.ajax({
                    url: '/patients/'+that.dataset.patientid+'/loadData/',
                    method: 'GET'
                }).then(function(data){
                    console.log('patient loaded');
                    console.log(data);
                });

                $('.loaderOverlay').show();

                /** start the check-in flow **/
                $.ajax({
                    url: '/appointments/checkin/startcheckin/',
                    method: 'POST'
                }).then(function (data) {
                    // console.log(data);
                    if (data.success) {
                        window.location = '/patientRegistration/';
                    } else {
                        $('.loaderOverlay').hide();
                        $('#myModal').modal();
                    }
                }).catch(function (err) {
                    console.error(err);
                    $('.loaderOverlay').hide();
                });
            });
        },
        init: function () {
            console.log('Init home page');
            var me = app.homePage;

            me.bindEvents();
        }
    };

    // update page init for this page
    app.page.init = app.homePage.init;

})(jQuery, window);
