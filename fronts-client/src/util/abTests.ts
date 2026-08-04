import { Card, VariantId, Test } from '../types/Collection';

// TODO: add unit test
export const hasAbTestOnCard = (card: Card | undefined) => {
	if (!card) {
		return false;
	}
	if (!card.tests) {
		return false;
	}

	return card.tests.some(
		(test) =>
			!test.hasManuallyEndedOnThisTrail &&
			test.expiryDate &&
			test.expiryDate > Date.now(),
	);
};

// TODO: add unit test
export const findActiveOrDraftTest = (card: Card) => {
	if (!card.tests) {
		return undefined;
	}

	return card.tests.find(
		(test) =>
			!test.hasManuallyEndedOnThisTrail &&
			((test.expiryDate && test.expiryDate > Date.now()) ||
				typeof test.expiryDate === 'undefined'),
	);
};

// we can extend this in future to 'getVariantField'
export const getVariantHeadline = (
	test: Test | undefined,
	variantId: VariantId,
) => {
	return test?.variantMeta.find((variant) => variant.id === variantId)?.meta
		.headline;
};
