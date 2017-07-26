'use strict';
module.exports = function() {
    return {
        static: {
            files: [{
                expand: true,
                src: ['**'],
                cwd: 'tmp/bundles',
                dest: 'tmp/riffraff/packages/static-facia-tool/'
            }]
        },
        debian: {
            files: [{
                expand: true,
                src: ['facia-tool*.deb'],
                cwd: 'target/',
                dest: 'tmp/riffraff/packages/facia-tool/'
            }]
        },
        deploy: {
            files: [{
                expand: true,
                src: ['deploy.json'],
                cwd: 'conf/',
                dest: 'tmp/riffraff/'
            }]
        }
    };
};
