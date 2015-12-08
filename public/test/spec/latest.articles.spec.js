import ko from 'knockout';
import $ from 'jquery';
import * as capi from 'modules/content-api';
import * as wait from 'test/utils/wait';
import {CONST} from 'modules/vars';
import {injectColumnWidget} from 'test/utils/inject';
import * as mockjax from 'test/utils/mockjax';
import textInside from 'test/utils/text-inside';

describe('Latest widget', function () {
    beforeEach(function () {
        this.originalsearchDebounceMs = CONST.searchDebounceMs;
        this.originallatestArticlesDebounce = CONST.latestArticlesDebounce;
        this.originallatestArticlesPollMs = CONST.latestArticlesPollMs;
        this.ko = injectColumnWidget('latest-widget');
        this.scope = mockjax.scope();
        CONST.latestArticlesDebounce = 30;
        CONST.latestArticlesPollMs = 1000 * 60 * 60;
    });
    afterEach(function () {
        CONST.searchDebounceMs = this.originalsearchDebounceMs;
        CONST.latestArticlesDebounce = this.originallatestArticlesDebounce;
        CONST.latestArticlesPollMs = this.originallatestArticlesPollMs;
        this.scope.clear();
        this.ko.dispose();
    });
    function getAutocomplete (host) {
        return ko.contextFor(host.container.querySelector('autocomplete').firstChild)
            .$component;
    }

    it('toggles draft and live content', function (done) {
        var latest;
        spyOn(capi, 'fetchLatest').and.callFake(function () {
            return Promise.resolve({
                results: [],
                currentPage: 1
            });
        });
        // short time for polling
        CONST.latestArticlesPollMs = 6 * CONST.searchDebounceMs;

        var waitingOn = wait.event('main:widget:loaded').then(widget => {
            latest = widget.latestArticles;
            return widget.loaded;
        });

        this.ko.apply({
            switches: ko.observable({
                'facia-tool-draft-content': true
            })
        })
        .then(() => waitingOn)
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(1);
            expect(capi.fetchLatest.calls.argsFor(0)[0].isDraft).toBe(false);
            expect($('a.live-mode').hasClass('active')).toBe(true);
            expect($('a.draft-mode').hasClass('active')).toBe(false);

            return $('.draft-mode').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(2);
            expect(capi.fetchLatest.calls.argsFor(1)[0].isDraft).toBe(true);
            expect($('a.live-mode').hasClass('active')).toBe(false);
            expect($('a.draft-mode').hasClass('active')).toBe(true);

            // Polling
            return wait.ms(CONST.latestArticlesPollMs + CONST.searchDebounceMs);
        })
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(3);
        })
        .then(done)
        .catch(done.fail);
    });

    it('searches articles', function (done) {
        var latest, autocomplete;
        spyOn(capi, 'fetchLatest').and.callFake(function () {
            return Promise.resolve({
                results: [],
                currentPage: 1
            });
        });

        this.scope({
            url: /api\/preview\/section/,
            responseText: {
                response: {
                    results: [{ id: 'section-one' }, { id: 'section-two' }]
                }
            }
        });

        var waitingOn = Promise.all([
            wait.event('main:widget:loaded').then(widget => {
                latest = widget.latestArticles;
                return widget.loaded;
            }),
            wait.event('widget:load').then(() => {
                autocomplete = getAutocomplete(this.ko);
            })
        ]);

        this.ko.apply({
            switches: ko.observable({
                'facia-tool-draft-content': false
            })
        })
        .then(() => waitingOn)
        .then(() => {
            expect(capi.fetchLatest).toHaveBeenCalled();
            expect(capi.fetchLatest.calls.argsFor(0)[0].term).toBe('');
            expect(capi.fetchLatest.calls.argsFor(0)[0].filter).toBe('');
            expect(capi.fetchLatest.calls.argsFor(0)[0].filterType).toBe('section');

            $('.search--term').val('banana').change();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(2);
            expect(capi.fetchLatest.calls.argsFor(1)[0].term).toBe('banana');
            expect(capi.fetchLatest.calls.argsFor(1)[0].filter).toBe('');
            expect(capi.fetchLatest.calls.argsFor(1)[0].filterType).toBe('section');

            return $('.search--filter').val('fruit').change().trigger('keyup');
        })
        .then(() => wait.event('update', autocomplete))
        .then(() => {
            expect($('.suggestions li').length).toBe(2);
            $('.suggestions a:nth(0)').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(3);
            expect(capi.fetchLatest.calls.argsFor(2)[0].term).toBe('banana');
            expect(capi.fetchLatest.calls.argsFor(2)[0].filter).toBe('section-one');
            expect(capi.fetchLatest.calls.argsFor(2)[0].filterType).toBe('section');

            // Repeat the same search
            $('.search-tools .fa-refresh').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(4);
            expect(capi.fetchLatest.calls.argsFor(3)[0].term).toBe('banana');
            expect(capi.fetchLatest.calls.argsFor(3)[0].filter).toBe('section-one');
            expect(capi.fetchLatest.calls.argsFor(3)[0].filterType).toBe('section');

            // Reset
            $('.search-tools .fa-remove').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(5);
            expect(capi.fetchLatest.calls.argsFor(4)[0].term).toBe('');
            expect(capi.fetchLatest.calls.argsFor(4)[0].filter).toBe('');
            expect(capi.fetchLatest.calls.argsFor(4)[0].filterType).toBe('section');
        })
        .then(done)
        .catch(done.fail);
    });

    it('pagination', function (done) {
        var latest;
        spyOn(capi, 'fetchLatest').and.callFake(function (opts) {
            return Promise.resolve({
                results: [{
                    webUrl: '/banana/' + opts.page,
                    fields: { headline: 'Banana on page ' + opts.page }
                }],
                currentPage: opts.page,
                pages: 3
            });
        });
        function paginationText () {
            return textInside('.finder__controls:nth(0)').toLowerCase();
        }

        var waitingOn = wait.event('main:widget:loaded').then(widget => {
            latest = widget.latestArticles;
            return widget.loaded;
        });

        this.ko.apply({
            switches: ko.observable({
                'facia-tool-draft-content': false
            })
        })
        .then(() => waitingOn)
        .then(() => {
            expect(paginationText()).toBe('page 1 next');

            $('.pagination--next:nth(0)').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.argsFor(1)[0].page).toBe(2);
            expect(paginationText()).toBe('page 2 next prev');

            $('.pagination--next:nth(0)').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.argsFor(2)[0].page).toBe(3);
            expect(paginationText()).toBe('page 3 last prev top');

            $('.pagination--prev:nth(0)').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.argsFor(3)[0].page).toBe(2);
            expect(paginationText()).toBe('page 2 next prev');

            $('.pagination--next:nth(0)').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.argsFor(4)[0].page).toBe(3);
            expect(paginationText()).toBe('page 3 last prev top');

            $('.pagination--top:nth(0)').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.argsFor(5)[0].page).toBe(1);
            expect(paginationText()).toBe('page 1 next');
        })
        .then(done)
        .catch(done.fail);
    });

    it('reacts to switches changes', function (done) {
        var latest, switches = ko.observable({
            'facia-tool-draft-content': true
        });
        spyOn(capi, 'fetchLatest').and.callFake(function () {
            return Promise.resolve({
                results: [],
                currentPage: 1
            });
        });

        var waitingOn = wait.event('main:widget:loaded').then(widget => {
            latest = widget.latestArticles;
            return widget.loaded;
        });

        this.ko.apply({ switches })
        .then(() => waitingOn)
        .then(() => {
            expect($('a.live-mode').hasClass('active')).toBe(true);
            expect($('a.draft-mode').hasClass('active')).toBe(false);

            return $('.draft-mode').click();
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(2);
            expect(capi.fetchLatest.calls.argsFor(1)[0].isDraft).toBe(true);
            expect($('a.live-mode').hasClass('active')).toBe(false);
            expect($('a.draft-mode').hasClass('active')).toBe(true);

            switches({
                'facia-tool-draft-content': false
            });
        })
        .then(() => wait.event('search:update', latest))
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(3);
            expect(capi.fetchLatest.calls.argsFor(2)[0].isDraft).toBe(false);
            expect($('a.live-mode').hasClass('active')).toBe(true);
            expect($('a.draft-mode').length).toBe(0);

            switches({
                'facia-tool-draft-content': true
            });
        })
        .then(() => {
            expect(capi.fetchLatest.calls.count()).toBe(3);
            expect($('a.live-mode').hasClass('active')).toBe(true);
            expect($('a.draft-mode').hasClass('active')).toBe(false);
        })
        .then(done)
        .catch(done.fail);
    });
});
