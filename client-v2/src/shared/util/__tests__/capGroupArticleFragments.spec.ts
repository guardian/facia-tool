import { capGroupArticleFragments } from '../capGroupArticleFragments';
import { Group } from 'shared/types/Collection';

let id = 0;
let uuid = 0;
let afid = 0;

const createGroup = (articleFragments = 0): Group => ({
  id: `${id}`,
  uuid: `${uuid++}`,
  name: `Group ${id++}`,
  articleFragments: Array.from({ length: articleFragments }, () => `${afid++}`)
});

const createGroups = (...groupArticleFragmentCount: number[]) =>
  groupArticleFragmentCount.map(createGroup);

const toFragmentArray = (groups: Group[]) =>
  groups.map(({ articleFragments }) => articleFragments);

describe('capGroupArticleFragments', () => {
  it('removes articleFragments in an array of groups after a given maximum', () => {
    const groups = createGroups(10);
    const pre = toFragmentArray(groups);
    const post = toFragmentArray(capGroupArticleFragments(groups, 5));

    expect(post[0]).toHaveLength(5);
    expect(post[0]).toEqual(pre[0].slice(0, 5));
  });

  it('keeps the same array reference if the articleFragments remain untouched', () => {
    const groups = createGroups(2, 3, 3, 5);
    const pre = toFragmentArray(groups);
    const post = toFragmentArray(capGroupArticleFragments(groups, 10));
    expect(post[0]).toBe(pre[0]);
    expect(post[1]).toBe(pre[1]);
    expect(post[2]).toBe(pre[2]);
    expect(post[3]).toHaveLength(2);
    expect(post[3]).toEqual(post[3].slice(0, 2));
  });
});
