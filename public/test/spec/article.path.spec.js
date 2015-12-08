import articlePath from 'utils/article-path';

describe('Article Path', function () {

    it('returns correct path if url is from  guardian website', function () {
        var url = 'http://www.theguardian.com/business/2015/example';

        expect(articlePath(url)).toEqual('business/2015/example');
    });

    it('returns correct path if url is from viewer preview', function () {
        var url = 'http://viewer.gutools.co.uk/preview/business/2015/example';

        expect(articlePath(url)).toEqual('business/2015/example');
    });

    it('returns correct path if url is from viewer live', function () {
        var url = 'http://viewer.gutools.co.uk/live/business/2015/example';

        expect(articlePath(url)).toEqual('business/2015/example');
    });
});

