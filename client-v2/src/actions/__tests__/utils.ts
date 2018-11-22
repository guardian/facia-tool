export interface ArticleFragmentMap {
  [uuid: string]: {
    uuid: string;
    id: string;
    meta: object;
  };
}

export type ArticleFragmentSpec = [string, string, Array<[string, string]> | null];

export const createArticleFragmentStateFromSpec = (
  specs: ArticleFragmentSpec[]
) =>
  specs.reduce(
    (acc, [uuid, id, supporting]) => ({
      ...acc,
      [uuid]: {
        uuid,
        id,
        meta: {
          supporting: supporting && supporting.map(([suuid]) => suuid)
        }
      },
      ...(supporting
        ? supporting.reduce(
            (sacc, [suuid, sid]) => ({
              ...sacc,
              [suuid]: {
                uuid: suuid,
                id: sid,
                meta: {}
              }
            }),
            {} as ArticleFragmentMap
          )
        : {})
    }),
    {} as ArticleFragmentMap
  );
