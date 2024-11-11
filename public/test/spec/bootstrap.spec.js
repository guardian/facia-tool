import {CONST} from 'modules/vars';
import Bootstrap from 'modules/bootstrap';
import {scope} from 'test/utils/mockjax';
import sinon from 'sinon';

describe('Bootstrap', function () {
    var ajax,
        originalSetTimeout = window.setTimeout,
        objects = generateMockObjects(),
        tick = function (ms) {
            jasmine.clock().tick(ms);
            return new Promise(function (resolve) {
                originalSetTimeout(function () {
                    resolve();
                }, 10);
            });
        };

    beforeEach(function () {
        // Ensure unhandled errors do not fail tests.
        // Jasmine reports false positives here – see https://github.com/jasmine/jasmine/issues/1843.
        spyOn(window, 'onerror');
        jasmine.clock().install();
        ajax = scope();
    });
    afterEach(function () {
        jasmine.clock().uninstall();
        ajax.clear();
    });

    it('loads all endpoints correctly', function (done) {
        ajax.apply(null, objects['ajax-success-mock-one']);

        var bootstrap = new Bootstrap(),
            success = sinon.spy(),
            fail = sinon.spy(),
            every = sinon.spy(),
            one = sinon.spy(),
            two = sinon.spy();

        bootstrap
            .onload(success)
            .onfail(fail)
            .every(every);

        tick(100)
        .then(function () {

            expect(fail.called).toBe(false);
            expect(success.called).toBe(true);
            expect(success.getCall(0).args[0]).toEqual(objects['expected-object-one']);
            expect(every.called).toBe(true);
            expect(every.getCall(0).args[0]).toEqual(objects['expected-object-one']);

            ajax.clear();
            // Change the config in the meantime
            ajax.apply(null, objects['ajax-success-mock-two']);

            return tick(CONST.configSettingsPollMs);
        })
        .then(function () {
            expect(every.getCall(1).args[0]).toEqual(objects['expected-object-two']);
            // get callbacks should not be called again
            expect(success.calledOnce).toBe(true);

            bootstrap
                .every(one)
                .every(two);

            return tick(CONST.configSettingsPollMs);
        })
        .then(function () {
            expect(one.getCall(0).args[0]).toEqual(objects['expected-object-two']);
            expect(two.getCall(0).args[0]).toEqual(objects['expected-object-two']);
            expect(success.calledOnce).toBe(true);

            // dispose the bootstrap, check that 'every' is not called anymore
            bootstrap.dispose();
            return tick(5 * CONST.configSettingsPollMs);
        })
        .then(function () {
            expect(every.calledThrice).toBe(true);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('fails validation', function (done) {
        ajax.apply(null, objects['ajax-fail-validation']);

        var bootstrap = new Bootstrap(),
            success = sinon.spy(),
            fail = sinon.spy();

        bootstrap
            .onload(success)
            .onfail(fail);

        tick(100).then(function () {
            expect(fail.called).toBe(true);
            expect(fail.getCall(0).args[0]).toMatch(/config is invalid/);
            expect(success.called).toBe(false);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('fails on network error', function (done) {
        ajax.apply(null, objects['ajax-network-error']);

        var bootstrap = new Bootstrap(),
            success = sinon.spy(),
            fail = sinon.spy();

        bootstrap
            .onload(success)
            .onfail(fail);

        tick(100).then(function () {
            expect(fail.called).toBe(true);
            expect(fail.getCall(0).args[0]).toMatch(/defaults is invalid/);
            expect(success.called).toBe(false);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('fails in the every callback', function (done) {
        ajax.apply(null, objects['ajax-success-mock-one']);

        var bootstrap = new Bootstrap(),
            fail = sinon.spy(),
            every = sinon.spy();

        bootstrap.every(every, fail);

        tick(100).then(function () {
            expect(fail.called).toBe(false);
            expect(every.called).toBe(true);
            expect(every.getCall(0).args[0]).toEqual(objects['expected-object-one']);

            ajax.clear();
            ajax.apply(null, objects['ajax-fail-validation']);

            return tick(CONST.configSettingsPollMs);
        })
        .then(function () {
            expect(every.calledOnce).toBe(true);
            expect(fail.calledOnce).toBe(true);
        })
        .then(() => done())
        .catch(done.fail);
    });
});

function generateMockObjects () {
    var objects = {};

    objects['ajax-success-mock-one'] = [{
        url: '/config',
        responseText: {
            fronts: ['uk'],
            collections: ['one', 'two']
        }
    }, {
        url: '/defaults',
        responseText: {
            email: 'yours'
        }
    }];

    objects['expected-object-one'] = {
        config: {
            fronts: ['uk'],
            collections: ['one', 'two']
        },
        defaults: {
            email: 'yours'
        }
    };

    objects['ajax-success-mock-two'] = [{
        url: '/config',
        responseText: {
            fronts: ['uk', 'us'],
            collections: ['one']
        }
    }, {
        url: '/defaults',
        responseText: {
            email: 'yours'
        }
    }];

    objects['expected-object-two'] = {
        config: {
            fronts: ['uk', 'us'],
                collections: ['one']
        },
        defaults: {
            email: 'yours'
        }
    };

    objects['ajax-fail-validation'] = [{
        url: '/config',
        responseText: {
            banana: 'yellow'
        }
    }, {
        url: '/defaults',
        responseText: {
            email: 'yours'
        }
    }];

    objects['ajax-network-error'] = [{
        url: '/config',
        responseText: {
            fronts: ['uk'],
            collections: ['one', 'two']
        }
    }, {
        url: '/defaults',
        status: 404
    }];

    return objects;
}
