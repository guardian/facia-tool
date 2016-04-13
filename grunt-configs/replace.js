module.exports = function() {
    return {
        static: {
            options: {
                patterns: [{
                    match: 'jspm_packages/npm/font-awesome',
                    replacement: '/assets/jspm_packages/npm/font-awesome'
                }],
                usePrefix: false
            },
            files: [{
                expand: true,
                src: '*.js',
                cwd: 'tmp/bundles',
                dest: 'tmp/bundles/'
            }]
        }
    };
};
