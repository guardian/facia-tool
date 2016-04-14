'use strict';
module.exports = function() {
    return {
        static: {
            options: {
                baseDir: 'tmp/bundles/',
                assets: ['*.js'],
                deleteOriginals: true,
                jsonOutput: true,
                jsonOutputFilename: 'assets-map.json'
            },
            src: ['index.html']
        }
    };
};
