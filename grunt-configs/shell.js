'use strict';
module.exports = function(grunt, options) {
    return {
        /**
         * Using this task to copy hooks, as Grunt's own copy task doesn't preserve permissions
         */
        copyHooks: {
            command: 'ln -s ../git-hooks .git/hooks',
            options: {
                failOnError: false
            }
        },
        npmInstall: {
            command: 'npm prune && npm install',
            options: {
                execOptions: {
                    cwd: 'facia-tool/public'
                }
            }
        },

        jspmInstall: {
            command: './node_modules/.bin/jspm install'
        }
    };
};
