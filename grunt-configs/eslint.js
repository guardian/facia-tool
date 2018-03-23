'use strict';
module.exports = function() {
    return {
        'static': {
            files: [{
                expand: true,
                cwd: 'public/src',
                src: [
                    '**/*.js',
                    '*.js',
                    '!js/jspm-config.js',
                    '!js/components/**/*.js',
                    '!jspm_packages/**/*.js'
                ]
            }, {
                expand: true,
                cwd: 'public/test',
                src: [
                    '**/*.js',
                    '*.js'
                ]
            }]
        }
    };
};
