import Article from 'models/collections/article';
import serialize from 'utils/serialize-article-meta';
import * as contentApi from './modules/content-api';

describe('Serialize Article Meta', function () {
    beforeEach(function () {
        spyOn(contentApi, 'decorateItems');
    });

    it('trim and sanitize strings', function () {
        const article = new Article({
            meta: {
                headline: '   <script>\nalert("banana")\n</script>  Headline   with \t\n spaces  '
            }
        });

        expect(serialize(article)).toEqual({
            headline: 'Headline with spaces'
        });
    });

    it('explicit about values equal to their default', function () {
        const article = new Article({
            meta: {
                showQuotedHeadline: true,
                showByline: false,
                headline: 'meta defaults'
            },
            webUrl: 'something',
            fields: {
                headline: 'headline from CAPI'
            },
            frontsMeta: {
                defaults: {
                    showQuotedHeadline: true,
                    showByline: true
                }
            },
            group: {}
        }, true);

        expect(serialize(article)).toEqual({
            headline: 'meta defaults',
            showQuotedHeadline: true,
            showByline: false
        });
    });

    it('ignores values equal to the overridden field', function () {
        const article = new Article({
            meta: {
                trailText: 'trail text',
                headline: 'same trail text as CAPI'
            },
            webUrl: 'something',
            fields: {
                headline: 'headline from CAPI',
                trailText: 'trail text'
            }
        }, true);

        expect(serialize(article)).toEqual({
            headline: 'same trail text as CAPI'
        });
    });

    it('converts number to strings', function () {
        const article = new Article({
            meta: {
                imageSrcWidth: 100
            }
        });

        expect(serialize(article)).toEqual({
            imageSrcWidth: '100'
        });
    });

    it('serializes supporting links', function () {
        const article = new Article({
            group: {},
            meta: {
                supporting: [{
                    id: 'first'
                }, {
                    id: 'second'
                }]
            }
        });

        expect(serialize(article)).toEqual({
            supporting: [{ id: 'first' }, { id: 'second' }]
        });
    });

    it('cleans sparse array', function () {
        const article = new Article({
            meta: {
                slideshow: [{
                    path: 'image one'
                }, null, undefined, {
                    path: 'image four'
                }]
            }
        });

        expect(serialize(article)).toEqual({
            slideshow: [{ path: 'image one' }, { path: 'image four' }]
        });
    });

    it('drops empty arrays', function () {
        const article = new Article({
            meta: {
                headline: 'empty array',
                slideshow: [null, null]
            }
        });

        expect(serialize(article)).toEqual({
            headline: 'empty array'
        });
    });

    it('converts number to strings in nested structures', function () {
        const article = new Article({
            meta: {
                slideshow: [{
                    path: 'image',
                    number: 12
                }]
            }
        });

        expect(serialize(article)).toEqual({
            slideshow: [{
                path: 'image',
                number: '12'
            }]
        });
    });

    it('includes the group index', function () {
        const article = new Article({
            group: {
                parentType: 'Collection',
                index: 1
            }
        });

        expect(serialize(article)).toEqual({
            group: '1'
        });
    });

    it('ignore empty meta data', function () {
        const article = new Article({
            meta: {
                headline: 'headline from CAPI'
            },
            webUrl: 'anywhere',
            fields: {
                headline: 'headline from CAPI'
            }
        }, true);

        expect(serialize(article)).toBeUndefined();
    });
});
