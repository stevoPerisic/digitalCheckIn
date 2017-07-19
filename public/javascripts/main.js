/**
 * Created by stevoperisic on 4/23/17.
 *
 * main JS for the app FE
 */

(function ($, window) {
    window.app = {
        page: {
            init: function () {
                return this;
            }
        }
    };

    $('document').ready(function () {
        var app = window.app;
        app.page.init();
    });

})($, window);

