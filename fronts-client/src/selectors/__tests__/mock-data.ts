import { FrontConfig } from '../../types/FaciaApi';

const editorialFrontsInConfig: FrontConfig[] = [
	{
		collections: ['collectionUuid1'],
		id: 'editorialFront',
		priority: 'editorial',
	},
	{
		collections: ['collectionUuid6'],
		id: 'editorialFront2',
		priority: 'editorial',
	},
];

const additionalEditorialFronts: FrontConfig[] = [
	{
		collections: ['collectionUuid2'],
		id: 'editorialNotShared',
		priority: 'editorial',
	},
	{
		collections: ['collectionUuid5', 'collectionUuid3'],
		id: 'editorialSharedWithTraining',
		priority: 'editorial',
	},
];

const trainingFronts: FrontConfig[] = [
	{
		collections: ['collectionUuid3'],
		id: 'trainingFront',
		priority: 'training',
	},
];

const commercialFronts: FrontConfig[] = [
	{
		collections: ['collectionUuid1'],
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
