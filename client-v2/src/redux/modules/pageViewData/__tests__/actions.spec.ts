import { buildRequestUrl } from '..';
import { ArticlePathAndId } from 'shared/types/PageViewData';

describe('buildRequestUrl', () => {
  const correctOphanCall =
    '?referring-path=/au/business&path=/film/2015/aug/13/dads-army-film-first-trailer-bill-nighy-toby-jones-catherine-zeta-jones&path=/commentisfree/2015/aug/13/intern-tent-david-hyde-un-internship-geneva&path=/uk-news/2018/mar/14/sharp-rise-in-number-of-eu-nationals-applying-for-uk-citizenship&hours=1&interval=10';

  const frontIds = 'au/business';
  const articleIds: ArticlePathAndId[] = [
    {
      articlePath:
        'film/2015/aug/13/dads-army-film-first-trailer-bill-nighy-toby-jones-catherine-zeta-jones',
      articleId: ''
    },
    {
      articlePath:
        'commentisfree/2015/aug/13/intern-tent-david-hyde-un-internship-geneva',
      articleId: ''
    },
    {
      articlePath:
        'uk-news/2018/mar/14/sharp-rise-in-number-of-eu-nationals-applying-for-uk-citizenship',
      articleId: ''
    }
  ];

  it('generates a url for ophan which lists all fronts and articles requested in correct format', () => {
    expect(buildRequestUrl(frontIds, articleIds)).toBe(correctOphanCall);
  });
});
