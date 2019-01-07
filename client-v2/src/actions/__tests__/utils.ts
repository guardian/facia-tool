export interface ArticleFragmentMap {
  [uuid: string]: {
    uuid: string;
    id: string;
    meta: object;
  };
}

export type ArticleFragmentSpec = [
  string,
  string,
  Array<[string, string]> | undefined
];

export const specToFragment = ([uuid, id, supporting]: ArticleFragmentSpec) => ({
  uuid,
  id,
  frontPublicationDate: 0,
  meta: {
    supporting: supporting && supporting.map(([suuid]) => suuid)
  }
});

export const specToExternalArticle = (id: string) => ({
  id,
  fields: {
    isLive: 'true'
  }
});

export const createArticleFragmentStateFromSpec = (
  specs: ArticleFragmentSpec[]
) =>
  specs.reduce(
    (acc, [uuid, id, supporting]) => ({
      ...acc,
      [uuid]: specToFragment([uuid, id, supporting]),
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

  export const creatExternalArticleStateFromSpec = (
    specs: ArticleFragmentSpec[]
  ) =>
    specs.reduce(
      (acc, [_, id, supporting]) => ({
        ...acc,
        [id]: specToExternalArticle(id),
        ...(supporting
          ? supporting.reduce(
              (sacc, [__, sid]) => ({
                ...sacc,
                [sid]: specToExternalArticle(sid)
              }),
              {}
            )
          : {})
      }),
      {}
    );
