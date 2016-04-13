'use strict';
module.exports = function() {
    return {
        static: {
            options: {
                assets: ['tmp/bundles/*.js'],
                deleteOriginals: true,
                jsonOutput: true,
                jsonOutputFilename: 'tmp/bundles/assets-map.json'
            },
            src: ['index.html']
        }
    };
};
