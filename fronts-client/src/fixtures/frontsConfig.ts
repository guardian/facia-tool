import { FrontsConfig } from 'types/FaciaApi';

const frontsConfig: { data: FrontsConfig } = {
	data: {
		fronts: {
			editorialFront: {
				id: 'editorialFront',
				collections: ['collection1'],
				priority: 'editorial',
			},
			editorialFront2: {
				id: 'editorialFront2',
				collections: ['collection6'],
				priority: 'editorial',
			},
			'editions-front-3': {
				id: 'editions-front-3',
				collections: ['collection6'],
				priority: '9120723d-7d0d-4598-a22d-d9cf4dc7cbe6',
			},
			commercialFront: {
				id: 'commercialFront',
				collections: ['collection1'],
				priority: 'commercial',
			},
		},
		collections: {
			collection1: {
				id: 'collection1',
				displayName: 'name',
				type: 'collection',
				uneditable: true,
				backfill: {
					type: 'capi',
					query:
						'uk/commentisfree?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true',
				},
			},
			collection2: {
				id: 'collection1',
				displayName: 'name',
				type: 'collection',
			},
		},
	},
};

export { frontsConfig };
