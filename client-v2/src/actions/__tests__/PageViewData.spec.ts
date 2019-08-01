import { buildRequestUrl } from '../PageViewData';

describe('buildRequestUrl', () => {
  const correctOphanCall =
    '?referring-path=/au/business&path=/film/2015/aug/13/dads-army-film-first-trailer-bill-nighy-toby-jones-catherine-zeta-jones&path=/commentisfree/2015/aug/13/intern-tent-david-hyde-un-internship-geneva&path=/uk-news/2018/mar/14/sharp-rise-in-number-of-eu-nationals-applying-for-uk-citizenship&hours=1&interval=10';

  const frontIds = 'au/business';
  const articleIds = [
    'film/2015/aug/13/dads-army-film-first-trailer-bill-nighy-toby-jones-catherine-zeta-jones',
    'commentisfree/2015/aug/13/intern-tent-david-hyde-un-internship-geneva',
    'uk-news/2018/mar/14/sharp-rise-in-number-of-eu-nationals-applying-for-uk-citizenship'
  ];

  it('generates a url for ophan which lists all fronts and articles requested in correct format', () => {
    expect(buildRequestUrl(frontIds, articleIds)).toBe(correctOphanCall);
  });
});
