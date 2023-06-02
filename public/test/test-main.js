import _ from 'underscore';
import * as vars from './modules/vars';
import testConfig from 'test/config';
import $ from 'jquery';

window.jQuery = $;

export function run (filterTests, allFiles) {
    return Promise.resolve().then(() => {
        var tests = [],
            specFileExpr = /.*\.spec\.js$/;

        filterTests = _.map(filterTests, function (test) {
            return test.split('=')[1] + '.spec.js';
        });

        var filterSpecFiles = function (test) {
            return specFileExpr.test(test);
        };
        var filterLoadedTests = filterTests.length ? function (spec) {
            return _.find(filterTests, function (test) {
                return spec.indexOf(test) !== -1;
            });
        } : function () {
            return true;
        };

        tests = _.chain(allFiles)
            .keys()
            .filter(filterSpecFiles)
            .filter(filterLoadedTests)
            .value();

        vars.init(testConfig);

        return _.reduce(tests, function (wait, test) {
            return wait.then(() => System.import(test));
        }, Promise.resolve());
    });
}
