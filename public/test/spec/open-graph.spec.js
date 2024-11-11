import openGraph from 'utils/open-graph';
import * as mockjax from 'test/utils/mockjax';

describe('Open Graph', function () {
    beforeEach(function () {
        this.scope = mockjax.scope();
    });
    afterEach(function () {
        this.scope.clear();
    });

    it('fetches data from open graph - off site', function (done) {
        this.scope({
            url: '/http/proxy/*',
            status: 200,
            responseText: `
                <html><head>
                <meta property="og:title" content="oddly shaped fruit" />
                <meta property="og:description" content="elongated and yellow" />
                <meta property="og:site_name" content="fruit" />
                <title>Banana</title>
                </head><body>Hello</body></html>
            `
        });

        openGraph('offSite').then(response => {
            expect(response).toEqual({
                title: 'oddly shaped fruit',
                description: 'elongated and yellow',
                siteName: 'fruit'
            });
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('fetches data from innerHTML - off site', function (done) {
        this.scope({
            url: '/http/proxy/*',
            status: 200,
            responseText: `
                <html><head>
                <title>Banana</title>
                </head><body>Hello</body></html>
            `
        });

        openGraph('http://www.offsite.com/page').then(response => {
            expect(response).toEqual({
                title: 'Banana',
                siteName: 'offsite.com'
            });
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('fetches data from site - guardian', function (done) {
        this.scope({
            url: '/http/proxy/*',
            status: 200,
            responseText: `
                <html><head>
                <title>the Guardian</title>
                </head><body>Hello</body></html>
            `
        });

        openGraph('http://theguardian.com/page').then(response => {
            expect(response).toEqual({
                title: 'the Guardian'
            });
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('handles failures', function (done) {
        this.scope({
            url: '/http/proxy/*',
            status: 404,
            responseText: `
                <html><head>
                <title>the Guardian</title>
                </head><body>Hello</body></html>
            `
        });

        openGraph('http://theguardian.com/page')
        .then(done.fail)
        .catch(error => {
            expect(error.message).toMatch(/unable to fetch/i);
            done();
        });
    });
});
