'use strict';
module.exports = function() {
    return {
        riffraff: {
            options: {
                archive: 'tmp/artifacts.zip'
            },
            files: [
                {cwd: 'tmp/riffraff', expand: true, src: ['**']}
            ]
        }
    };
};
