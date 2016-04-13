'use strict';
/* global module: false, process: false */
module.exports = function (grunt) {

    require('time-grunt')(grunt);

    var options = {
        singleRun:       grunt.option('single-run') !== false,
        color: grunt.option('color') !== false
    };

    // Load config and plugins (using jit-grunt)
    require('load-grunt-config')(grunt, {
        configPath: require('path').join(process.cwd(), 'grunt-configs'),
        data: options
    });

    // Default task
    grunt.registerTask('default', function () {
        grunt.task.run(['validate', 'test']);
    });

    /**
     * Validate tasks
     */
    grunt.registerTask('validate', ['eslint']);

    /**
     * Test tasks
     */
    grunt.registerTask('test', function () {
        if (options.singleRun === false) {
            grunt.config.set('karma.options.singleRun', false);
            grunt.config.set('karma.options.autoWatch', true);
        }

        grunt.task.run('karma');
    });

    /**
     * Compile tasks
     */
    grunt.registerTask('compile', function () {
        grunt.task.run(['clean', 'shell:collections', 'shell:config', 'replace', 'cacheBust']);
    });
    grunt.registerTask('bundle', function () {
        grunt.task.run(['compile', 'copy:static', 'copy:debian', 'copy:deploy', 'compress:riffraff']);
    });
    grunt.registerTask('upload', function () {
        var done = this.async();
        process.env.ARTEFACT_PATH = __dirname;
        var riffraff = require('node-riffraff-artefact');
        var path = require('path');
        riffraff.settings.leadDir = path.join(__dirname, 'tmp');
        riffraff.s3Upload()
        .then(function () {
            grunt.log.writeln('Artifacts uploaded!');
            done();
        })
        .catch(function () {
            grunt.log.error('Error uploading artifacts.');
            done(false);
        });
    });
};
