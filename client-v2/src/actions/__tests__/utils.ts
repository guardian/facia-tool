export interface ArticleFragmentMap {
  [uuid: string]: {
    uuid: string;
    id: string;
    meta: object;
  };
}

export type ArticleFragmentSpec = [
  string, // uuid
  string, // id
  Array<[string, string]> | undefined, // all of supporting articles,
  object // metadata changes
];

export const specToFragment = ([
  uuid,
  id,
  supporting,
  meta
]: ArticleFragmentSpec) => ({
  uuid,
  id,
  frontPublicationDate: 0,
  meta: {
    ...meta,
    supporting: supporting && supporting.map(([suuid]) => suuid)
  }
});

export const createArticleFragmentStateFromSpec = (
  specs: ArticleFragmentSpec[]
) =>
  specs.reduce(
    (acc, [uuid, id, supporting, meta]) => ({
      ...acc,
      [uuid]: specToFragment([uuid, id, supporting, meta]),
      ...(supporting
        ? supporting.reduce(
            (sacc, [suuid, sid]) => ({
              ...sacc,
              [suuid]: {
                uuid: suuid,
                id: sid,
                meta: { ...meta }
              }
            }),
            {} as ArticleFragmentMap
          )
        : {})
    }),
    {} as ArticleFragmentMap
  );
