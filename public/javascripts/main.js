/**
 * Created by stevoperisic on 4/23/17.
 *
 * main JS for the app FE
 */

(function ($, window) {
    window.app = {
        init: function () {
            var AppView = Backbone.View.extend({
                el: $('.main'),
                initialize: function(){
                    console.log('App initialized');
                }
            });

            var App = new AppView;
        },
        page: {
            init: function () {
                return this;
            }
        }
    };

    $('document').ready(function () {
        var app = window.app;
        app.init();
        app.page.init();
    });

})($, window);

