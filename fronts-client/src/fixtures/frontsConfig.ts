import { FrontsConfig } from 'types/FaciaApi';

const frontsConfig: { data: FrontsConfig } = {
	data: {
		fronts: {
			editorialFront: {
				id: 'editorialFront',
				collections: ['collectionUuid1'],
				priority: 'editorial',
			},
			editorialFront2: {
				id: 'editorialFront2',
				collections: ['collectionUuid6'],
				priority: 'editorial',
			},
			'editions-front-3': {
				id: 'editions-front-3',
				collections: ['collectionUuid6'],
				priority: '9120723d-7d0d-4598-a22d-d9cf4dc7cbe6',
			},
			commercialFront: {
				id: 'commercialFront',
				collections: ['collectionUuid1'],
				priority: 'commercial',
			},
		},
		collections: {
			collectionUuid1: {
				id: 'collectionUuid1',
				displayName: 'name',
				type: 'collection',
				uneditable: true,
				backfill: {
					type: 'capi',
					query:
						'uk/commentisfree?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true',
				},
			},
			collectionUuid2: {
				id: 'collectionUuid2',
				displayName: 'name',
				type: 'collection',
			},
		},
	},
};

export { frontsConfig };
