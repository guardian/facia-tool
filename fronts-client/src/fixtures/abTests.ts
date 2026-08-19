import type { Card, Test } from 'types/Collection';

export const FUTURE = Date.now() + 100_000;
export const PAST = Date.now() - 100_000;

export const makeTest = (overrides: Partial<Test> = {}): Test => ({
	testUuid: 'test-1',
	variantMeta: [],
	createdByName: 'Jane Doe',
	createdByEmail: 'jane.doe@guardian.co.uk',
	hasManuallyEndedOnThisTrail: false,
	...overrides,
});

export const makeCard = (tests?: Test[]): Card =>
	({ uuid: 'card-1', id: 'card-1', meta: {}, tests }) as Card;
