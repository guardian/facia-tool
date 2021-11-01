'use strict';
module.exports = function() {
    return {
        "rules": {
            "no-redeclare": ["error", { "builtinGlobals": false }]
        },
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
