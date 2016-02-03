import ko from 'knockout';
import * as contentApi from 'modules/content-api';
import 'widgets/config-collection-backfill.html!text';
import inject from 'test/utils/inject';
import backfill from 'test/utils/regions/backfill';

describe('Collection Backfill', function () {
    beforeEach(function (done) {
        this.meta = ko.observable();

        this.ko = inject(`
            <config-collection-backfill params="backfill: meta"></config-collection-backfill>
        `);

        spyOn(contentApi, 'fetchContent').and.callFake(() => this.fetchContent());

        this.ko.apply({ meta: this.meta }, true)
        .then(() => { this.backfill = backfill(this.ko.container); })
        .then(done);
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
            expect(this.meta()).toBe('error');
            expect(this.backfill.status()).toMatch(/checking/i);
            expect(this.backfill.results().length).toBe(0);

            return waiting.check;
        })
        .then(() => {
            expect(this.backfill.status()).toMatch(/no match/i);
            expect(this.backfill.results().length).toBe(0);
        })
        .then(done)
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
            expect(this.meta()).toBe('news');
            expect(this.backfill.status()).toMatch(/checking/i);
            expect(this.backfill.results().length).toBe(0);

            return waiting.check;
        })
        .then(() => {
            expect(this.backfill.status()).toMatch(/found match/i);
            expect(this.backfill.results().length).toBe(2);
        })
        .then(done)
        .catch(done.fail);
    });

    it('shows no match list on empty valid CAPI query', function (done) {
        this.fetchContent = () => Promise.resolve({
            error: 'not found'
        });

        this.backfill.type('empty')
        .then(waiting => {
            expect(this.backfill.text()).toBe('empty');
            expect(this.meta()).toBe('empty');
            expect(this.backfill.status()).toMatch(/checking/i);
            expect(this.backfill.results().length).toBe(0);

            return waiting.check;
        })
        .then(() => {
            expect(this.backfill.status()).toMatch(/no match/i);
            expect(this.backfill.results().length).toBe(0);
        })
        .then(done)
        .catch(done.fail);
    });

    it('goes from success to error on CAPI change', function (done) {
        this.fetchContent = () => Promise.resolve({
            content: [{ fields: { headline: 'Valid story' } }]
        });

        this.backfill.type('good')
        .then(waiting => waiting.check)
        .then(() => {
            expect(this.meta()).toBe('good');
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
            expect(this.meta()).toBe('bad');
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
            expect(this.meta()).toBe('again');
            expect(this.backfill.status()).toMatch(/found match/i);
            expect(this.backfill.results().length).toBe(1);
            expect(this.backfill.results()[0].text()).toMatch(/another story/i);
        })
        .then(done)
        .catch(done.fail);
    });
});
