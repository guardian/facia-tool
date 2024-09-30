import { CardMeta } from 'types/Collection';

export interface CardMap {
	[uuid: string]: {
		uuid: string;
		id: string;
		frontPublicationDate: number;
		meta: object;
	};
}

export type CardSpec = [
	string, // uuid
	string, // id
	Array<[string, string]> | undefined, // all of supporting articles,
	CardMeta?, // metadata changes
];

export const specToCard = ([uuid, id, supporting, meta]: CardSpec) => ({
	uuid,
	id,
	frontPublicationDate: 0,
	meta: {
		...meta,
		supporting: supporting && supporting.map(([suuid]) => suuid),
	},
});

export const createCardStateFromSpec = (specs: CardSpec[]) =>
	specs.reduce(
		(acc, [uuid, id, supporting, meta]) => ({
			...acc,
			[uuid]: specToCard([uuid, id, supporting, meta]),
			...(supporting
				? supporting.reduce(
						(sacc, [suuid, sid]) => ({
							...sacc,
							[suuid]: {
								uuid: suuid,
								id: sid,
								frontPublicationDate: 1234,
								meta: { ...meta },
							},
						}),
						{} as CardMap,
					)
				: {}),
		}),
		{} as CardMap,
	);
