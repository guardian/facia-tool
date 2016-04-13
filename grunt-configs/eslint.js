'use strict';
module.exports = function() {
    return {
        'static': {
            files: [{
                expand: true,
                cwd: 'public/',
                src: [
                    '**/*.js',
                    '!src/js/jspm-config.js',
                    '!src/js/components/**/*.js',
                    '!src/jspm_packages/**/*.js'
                ]
            }]
        }
    };
};
