import ko from 'knockout';
import * as contentApi from 'modules/content-api';
import modalDialog from 'modules/modal-dialog';
import 'widgets/config-collection-backfill.html!text';
import drag from 'test/utils/drag';
import inject from 'test/utils/inject';
import backfill from 'test/utils/regions/backfill';

describe('Collection Backfill - API query', function () {
    beforeEach(function (done) {
        this.meta = ko.observable();

        this.ko = inject(`
            <config-collection-backfill params="backfill: meta"></config-collection-backfill>
        `);

        spyOn(contentApi, 'fetchContent').and.callFake(() => this.fetchContent());

        this.ko.apply({ meta: this.meta }, true)
        .then(() => { this.backfill = backfill(this.ko.container); })
        .then(() => done());
    });
    afterEach(function () {
        this.ko.dispose();
    });

    it('shows error message on invalid CAPI query', function (done) {
        this.fetchContent = () => {
            return Promise.reject();
        };

        this.backfill.type('error')
        .then(waiting => {
            expect(this.backfill.text()).toBe('error');
            expect(this.meta()).toEqual({
                type: 'capi',
                query: 'error'
            });
            expect(this.backfill.status()).toMatch(/checking/i);
            expect(this.backfill.results().length).toBe(0);

            return waiting.check;
        })
        .then(() => {
            expect(this.backfill.status()).toMatch(/no match/i);
            expect(this.backfill.results().length).toBe(0);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('shows list on valid CAPI query', function (done) {
        this.fetchContent = () => Promise.resolve({
            content: [
                { fields: { headline: 'First story' } },
                { fields: { headline: 'Second story' } }
            ]
        });

        // sanitize spaces
        this.backfill.type('ne  ws')
        .then(waiting => {
            expect(this.backfill.text()).toBe('news');
            expect(this.meta()).toEqual({
                type: 'capi',
                query: 'news'
            });
            expect(this.backfill.status()).toMatch(/checking/i);
            expect(this.backfill.results().length).toBe(0);

            return waiting.check;
        })
        .then(() => {
            expect(this.backfill.status()).toMatch(/found match/i);
            expect(this.backfill.results().length).toBe(2);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('shows no match list on empty valid CAPI query', function (done) {
        this.fetchContent = () => Promise.resolve({
            error: 'not found'
        });

        this.backfill.type('empty')
        .then(waiting => {
            expect(this.backfill.text()).toBe('empty');
            expect(this.meta()).toEqual({
                type: 'capi',
                query: 'empty'
            });
            expect(this.backfill.status()).toMatch(/checking/i);
            expect(this.backfill.results().length).toBe(0);

            return waiting.check;
        })
        .then(() => {
            expect(this.backfill.status()).toMatch(/no match/i);
            expect(this.backfill.results().length).toBe(0);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('goes from success to error on CAPI change', function (done) {
        this.fetchContent = () => Promise.resolve({
            content: [{ fields: { headline: 'Valid story' } }]
        });

        this.backfill.type('good')
        .then(waiting => waiting.check)
        .then(() => {
            expect(this.meta()).toEqual({
                type: 'capi',
                query: 'good'
            });
            expect(this.backfill.status()).toMatch(/found match/i);
            expect(this.backfill.results().length).toBe(1);
            expect(this.backfill.results()[0].text()).toMatch(/valid story/i);
        })
        .then(() => {
            this.fetchContent = () => {
                return Promise.reject();
            };

            return this.backfill.type('bad');
        })
        .then(waiting => waiting.check)
        .then(() => {
            expect(this.meta()).toEqual({
                type: 'capi',
                query: 'bad'
            });
            expect(this.backfill.status()).toMatch(/no match/i);
            expect(this.backfill.results().length).toBe(0);
        })
        .then(() => {
            this.fetchContent = () => Promise.resolve({
                content: [{ fields: { headline: 'Another story' } }]
            });

            return this.backfill.type('again');
        })
        .then(waiting => waiting.check)
        .then(() => {
            expect(this.meta()).toEqual({
                type: 'capi',
                query: 'again'
            });
            expect(this.backfill.status()).toMatch(/found match/i);
            expect(this.backfill.results().length).toBe(1);
            expect(this.backfill.results()[0].text()).toMatch(/another story/i);
        })
        .then(() => done())
        .catch(done.fail);
    });
});

describe('Collection Backfill - Parent collection', function () {
        beforeEach(function (done) {
        this.meta = ko.observable({});

        this.ko = inject(`
            <config-collection-backfill params="backfill: meta"></config-collection-backfill>
        `);

        spyOn(contentApi, 'fetchContent').and.callFake(() => this.fetchContent());
        spyOn(modalDialog, 'confirm').and.callFake(() => Promise.resolve());

        this.ko.apply({ meta: this.meta }, true)
        .then(() => { this.backfill = backfill(this.ko.container); })
        .then(() => done());
    });
    afterEach(function () {
        this.ko.dispose();
    });

    it('shows error message when dragging invalid links', function (done) {
        this.backfill.drop({ 'Text': 'plain link' })
        .then(waiting => waiting.check.cancel())
        .then(() => {
            expect(this.backfill.text()).toBe('');
            expect(this.meta()).toEqual({});
            expect(this.backfill.status()).toBe('');
            expect(this.backfill.results().length).toBe(0);
        })
        .then(() => {
            expect(modalDialog.confirm).toHaveBeenCalled();
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('drags a valid collection', function (done) {
        this.backfill.drop(
            new drag.ConfigCollection({
                id: 'parent-1234'
            })
        )
        .then(waiting => {
            expect(this.backfill.hasParentCollection()).toBe(true);
            expect(this.backfill.parentCollectionText()).toBe('unknown');
            expect(this.meta()).toEqual({
                type: 'collection',
                query: 'parent-1234'
            });

            return waiting.check;
        })
        .then(() => {
            expect(this.backfill.status()).toBe('');
            expect(this.backfill.results().length).toBe(0);

            // Drag another collection
            return this.backfill.drop(
                new drag.ConfigCollection({
                    id: 'parent-5678'
                })
            )
            .then(waiting => waiting.check);
        })
        .then(() => {
            expect(this.backfill.hasParentCollection()).toBe(true);
            expect(this.backfill.parentCollectionText()).toBe('unknown');
            expect(this.meta()).toEqual({
                type: 'collection',
                query: 'parent-5678'
            });
            expect(this.backfill.status()).toBe('');
            expect(this.backfill.results().length).toBe(0);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('removes a valid collection', function (done) {
        this.backfill.drop(
            new drag.ConfigCollection({
                id: 'parent-1234'
            })
        )
        .then(waiting => waiting.check)
        .then(() => {
            expect(this.backfill.hasParentCollection()).toBe(true);
            expect(this.backfill.parentCollectionText()).toBe('unknown');
            expect(this.meta()).toEqual({
                type: 'collection',
                query: 'parent-1234'
            });

            return this.backfill.clearParentCollection();
        })
        .then(() => {
            expect(this.backfill.hasParentCollection()).toBe(false);
            expect(this.backfill.hasApiQuery()).toBe(true);
            expect(this.meta()).toBe(undefined);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('reverts to the api query', function (done) {
        this.fetchContent = () => Promise.resolve({
            content: [{ fields: { headline: 'Valid story' } }]
        });

        this.backfill.type('anything')
        .then(waiting => waiting.check)
        .then(() => {
            expect(this.backfill.text()).toBe('anything');
            expect(this.meta()).toEqual({
                type: 'capi',
                query: 'anything'
            });

            return this.backfill.drop(
                new drag.ConfigCollection({
                    id: 'parent-override'
                })
            );
        })
        .then(waiting => waiting.check)
        .then(() => {
            expect(this.backfill.hasParentCollection()).toBe(true);
            expect(this.backfill.parentCollectionText()).toBe('unknown');
            expect(this.meta()).toEqual({
                type: 'collection',
                query: 'parent-override'
            });

            return this.backfill.clearParentCollection();
        })
        .then(() => {
            expect(this.backfill.hasParentCollection()).toBe(false);
            expect(this.backfill.hasApiQuery()).toBe(true);
            expect(this.meta()).toEqual({
                type: 'capi',
                query: 'anything'
            });
        })
        .then(() => done())
        .catch(done.fail);
    });
});
