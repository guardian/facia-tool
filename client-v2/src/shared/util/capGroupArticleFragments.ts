import { Group } from 'shared/types/Collection';

// runs through an array of groups, assumed to be ordered, and removes all
// article fragments beyond maxArticleFragments
export const capGroupArticleFragments = (
  groups: Group[],
  maxArticleFragments: number
) =>
  groups.reduce(
    ({ arr, remaining }, sibling) => ({
      arr: [
        ...arr,
        {
          ...sibling,
          articleFragments:
            remaining < sibling.articleFragments.length
              ? sibling.articleFragments.slice(0, remaining)
              : sibling.articleFragments
        }
      ],
      remaining: Math.max(remaining - sibling.articleFragments.length, 0)
    }),
    {
      arr: [],
      remaining: maxArticleFragments
    } as {
      arr: Group[];
      remaining: number;
    }
  ).arr;
