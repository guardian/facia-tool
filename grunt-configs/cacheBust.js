'use strict';
module.exports = function() {
    return {
        static: {
            options: {
                baseDir: 'public/fronts-client-v1/bundles/',
                assets: ['*.js'],
                deleteOriginals: true,
                jsonOutput: true,
                jsonOutputFilename: 'assets-map.json'
            },
            src: ['index.html']
        }
    };
};
