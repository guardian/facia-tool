import { FrontConfig } from '../../types/FaciaApi';

const editorialFrontsInConfig: FrontConfig[] = [
	{ collections: ['collection1'], id: 'editorialFront', priority: 'editorial' },
	{
		collections: ['collection6'],
		id: 'editorialFront2',
		priority: 'editorial',
	},
];

const additionalEditorialFronts: FrontConfig[] = [
	{
		collections: ['collection2'],
		id: 'editorialNotShared',
		priority: 'editorial',
	},
	{
		collections: ['collection5', 'collection3'],
		id: 'editorialSharedWithTraining',
		priority: 'editorial',
	},
];

const trainingFronts: FrontConfig[] = [
	{
		collections: ['collection3'],
		id: 'trainingFront',
		priority: 'training',
	},
];

const commercialFronts: FrontConfig[] = [
	{
		collections: ['collection1'],
		id: 'commercialFront',
		priority: 'commercial',
	},
];

export {
	editorialFrontsInConfig,
	additionalEditorialFronts,
	trainingFronts,
	commercialFronts,
};
