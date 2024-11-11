import EventEmitter from 'EventEmitter';
import LatestArticles from 'models/collections/latest-articles';
import * as capi from 'modules/content-api';
import {CONST} from 'modules/vars';
import mediator from 'utils/mediator';
import * as wait from 'test/utils/wait';

describe('Latest articles errors', function() {
    beforeEach(function () {
        this.originalSearchDebounce = CONST.searchDebounceMs;
        CONST.searchDebounceMs = 100;

        this.loadSpy = jasmine.createSpy('loadSpy');
        this.errorSpy = jasmine.createSpy('errorSpy');
        this.fetchEmitter = new EventEmitter();
        this.shouldNextRequestFail = true;

        spyOn(capi, 'fetchLatest').and.callFake(() => {
            setTimeout(() => {
                this.fetchEmitter.emit('done');
            }, 10);
            return this.shouldNextRequestFail ?
                Promise.reject(new Error('this is bad')) :
                Promise.resolve({ results: [] });
        });
        mediator.on('capi:error', this.errorSpy);
    });
    afterEach(function () {
        CONST.searchDebounceMs = this.originalSearchDebounce;
    });

    it('doesn\'t stop page load', function (done) {
        const latest = new LatestArticles({
            callback: this.loadSpy,
            showingDrafts: () => false
        });
        latest.search();

        wait.event('done', this.fetchEmitter).then(() => {
            expect(this.loadSpy).toHaveBeenCalled();
            expect(this.errorSpy).toHaveBeenCalled();
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('hides some errors when page is already loaded', function (done) {
        const latest = new LatestArticles({
            callback: false, // <- not in the loading process
            showingDrafts: () => false,
            container: {
                querySelector: () => { return {}; }
            }
        });
        latest.on('search:update', this.loadSpy);
        latest.search();

        wait.event('done', this.fetchEmitter).then(() => {
            expect(this.loadSpy).not.toHaveBeenCalled();
            expect(latest.errorCount).toBe(1);

            this.shouldNextRequestFail = false;
            latest.search();
            return wait.event('done', this.fetchEmitter);
        })
        .then(() => {
            expect(this.loadSpy).toHaveBeenCalled();

            this.shouldNextRequestFail = true;
            this.loadSpy.calls.reset();

            let waiting = Promise.resolve();
            for (let i = 0; i < CONST.failsBeforeError + 1; i += 1) {
                waiting = waiting.then(() => {
                    latest.search();
                    return wait.event('done', this.fetchEmitter);
                });
            }
            return waiting;
        })
        .then(() => {
            expect(this.loadSpy).toHaveBeenCalled();
            expect(this.errorSpy).toHaveBeenCalled();
        })
        .then(() => done())
        .catch(done.fail);
    });
});
