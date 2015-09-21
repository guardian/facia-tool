'use strict';
module.exports = function(grunt, options) {
    return {
        'facia-tool': {
            files: [{
                expand: true,
                cwd: 'facia-tool/public/js/',
                src: [
                    '**/*.js',
                    '!jspm-config.js',
                    '!components/**/*.js'
                ]
            }]
        }
    };
};
