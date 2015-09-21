module.exports = function(grunt, options) {
    return {
        options: {
            frameworks: ['jasmine'],
            reporters: ['spec'],
            singleRun: options.singleRun,
            browserDisconnectTimeout: 10000,
            browserDisconnectTolerance: 3,
            browserNoActivityTimeout: 60000,
            reportSlowerThan: 2000,
            colors: options.color,
            port: 9876,
            autoWatch: true,
            browsers: ['PhantomJS'],
            captureTimeout: 60000
        },
        'facia-tool': {
            configFile: 'facia-tool/test/public/conf/karma.conf.js'
        }
    };
};
