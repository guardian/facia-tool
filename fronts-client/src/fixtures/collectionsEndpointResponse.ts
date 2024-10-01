export const scJohnsonPartnerZoneCollection = [
	{
		collection: {
			id: 'e59785e9-ba82-48d8-b79a-0a80b2f9f808',
			live: [],
			draft: [
				{
					id: 'internal-code/page/5607373',
					frontPublicationDate: 1547479659039,
				},
				{
					id: 'internal-code/page/5607569',
					frontPublicationDate: 1547479662461,
				},
			],
			lastUpdated: 1547479662508,
			updatedBy: 'Jonathon Herbert',
			updatedEmail: 'jonathon.herbert@guardian.co.uk',
			displayName: 'sc johnson partner zone',
			previously: [],
		},
		storiesVisibleByStage: {
			live: { desktop: 4, mobile: 4 },
			draft: { desktop: 4, mobile: 4 },
		},
	},
	{
		collection: {
			id: '4ab657ff-c105-4292-af23-cda00457b6b7',
			live: [],
			draft: [
				{
					id: 'internal-code/page/5607569',
					frontPublicationDate: 1547479667072,
				},
			],
			lastUpdated: 1547479667115,
			updatedBy: 'Jonathon Herbert',
			updatedEmail: 'jonathon.herbert@guardian.co.uk',
			displayName: 'popular in sustainable business',
			previously: [],
		},
		storiesVisibleByStage: {
			live: { desktop: 4, mobile: 4 },
			draft: { desktop: 4, mobile: 4 },
		},
	},
	null,
];

export const getCollectionsApiResponse = [
	{
		id: 'testCollection1',
		collection: {
			displayName: 'testCollection1',
			live: ['abc', 'def'],
			draft: [],
			lastUpdated: 1547479667115,
			previously: undefined,
			type: 'type',
		},
		storiesVisibleByStage: {
			live: { desktop: 4, mobile: 4 },
			draft: { desktop: 4, mobile: 4 },
		},
	},
	{
		id: 'testCollection2',
		collection: {
			displayName: 'testCollection2',
			live: ['abc'],
			draft: ['def'],
			lastUpdated: 1547479667115,
			previously: undefined,
			type: 'type',
		},
		storiesVisibleByStage: {
			live: { desktop: 4, mobile: 4 },
			draft: { desktop: 4, mobile: 4 },
		},
	},
	{
		id: 'geoLocatedCollection',
		collection: {
			displayName: 'geoLocatedCollection',
			live: ['abc'],
			draft: ['def'],
			lastUpdated: 1547479667115,
			previously: undefined,
			type: 'type',
			targetedTerritory: 'NZ',
		},
		storiesVisibleByStage: {
			live: { desktop: 4, mobile: 4 },
			draft: { desktop: 4, mobile: 4 },
		},
	},
];

export const getCollectionsApiResponseWithoutStoriesVisible = [
	{
		id: 'testCollection1',
		collection: {
			displayName: 'testCollection1',
			live: ['abc', 'def'],
			draft: [],
			lastUpdated: 1547479667115,
			previously: undefined,
			type: 'type',
		},
		storiesVisibleByStage: {},
	},
];
