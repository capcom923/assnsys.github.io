'use strict';

(function (win) {
    require.config({
        waitSeconds: 20,
        map: {
            '*': {
                css: 'jslibs/css.js',
                text: '../jslibs/text.js',
                template: '../jslibs/template.js'
            }
        },
        paths: {
            'jquery': '../jslibs/jquery/jquery',
            'angular': '../jslibs/angular-1.6.5/angular.min',
            'bootstrap': '../jslibs/bootstrap/js/bootstrap.min',
            'bootstrap-css': '../jslibs/bootstrap/css/bootstrap',
            'angular-ui-bootstrap-tpls': '../jslibs/angular-ui-bootstrap-2.5.0/ui-bootstrap-tpls.min',

            "echarts": "../jslibs/echarts/echarts/echarts",
            //"echarts-gl": "/jslibs/echarts/echarts-gl/echarts-gl",

            'app': '../jsmodels/app'
        },
        shim: {
            'bootstrap': {
                deps: [
                    'jquery',
                    'css!bootstrap-css'
                ]
            },
            'angular': {
                deps: ['jquery', 'bootstrap'],
                exports: 'angular'
            },
            'angular-ui-bootstrap-tpls': {
                deps: ['angular']
            },
            'app': {
                deps: [
                    'angular-ui-bootstrap-tpls',
                    //"echarts-gl",
                    "echarts",
                ]
            }
        }
    })(['app'], function (app) {
        app.tools = app.tools || {};

        var injector = angular.bootstrap(document, [app.name]);
        app.tools.injector = injector;
        return injector;
    });

})(window);