import { Card, VariantId, Test } from '../types/Collection';

export const isActiveTest = (test: Test) =>
	!test.hasManuallyEndedOnThisTrail &&
	!!test.expiryDate &&
	test.expiryDate > Date.now();

const isDraftTest = (test: Test) =>
	!test.hasManuallyEndedOnThisTrail && typeof test.expiryDate === 'undefined';

export const hasActiveAbTestOnCard = (card: Card | undefined) =>
	!!card?.tests?.some(isActiveTest);

export const findActiveOrDraftTest = (card: Card) =>
	card.tests?.find((test) => isActiveTest(test) || isDraftTest(test));

// we can extend this in future to 'getVariantField'
export const getVariantHeadline = (
	test: Test | undefined,
	variantId: VariantId,
) => {
	return test?.variantMeta.find((variant) => variant.id === variantId)?.meta
		.headline;
};
