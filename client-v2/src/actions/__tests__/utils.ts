import { CardMeta } from 'shared/types/Collection';

export interface CardMap {
  [uuid: string]: {
    uuid: string;
    id: string;
    meta: object;
  };
}

export type CardSpec = [
  string, // uuid
  string, // id
  Array<[string, string]> | undefined, // all of supporting articles,
  CardMeta? // metadata changes
];

export const specToFragment = ([
  uuid,
  id,
  supporting,
  meta
]: CardSpec) => ({
  uuid,
  id,
  frontPublicationDate: 0,
  meta: {
    ...meta,
    supporting: supporting && supporting.map(([suuid]) => suuid)
  }
});

export const createCardStateFromSpec = (
  specs: CardSpec[]
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
            {} as CardMap
          )
        : {})
    }),
    {} as CardMap
  );
