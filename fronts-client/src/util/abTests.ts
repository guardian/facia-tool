import { Card, VariantId, Test } from '../types/Collection';

const isActiveTest = (test: Test) =>
	!test.hasManuallyEndedOnThisTrail &&
	!!test.expiryDate &&
	test.expiryDate > Date.now();

const isDraftTest = (test: Test) =>
	!test.hasManuallyEndedOnThisTrail && typeof test.expiryDate === 'undefined';

export const hasActiveAbTestOnCard = (card: Card | undefined) =>
	!!card?.tests?.some(isActiveTest);

export const findActiveOrDraftTest = (card: Card) =>
	card.tests?.find((test) => isActiveTest(test) || isDraftTest(test));

export type AbTestHeadlineErrorType = 'duplicate' | 'incomplete';

/**
 * Validates the active headline A/B test (if any) on a card. Returns:
 *  - 'incomplete' when either variant headline is missing/empty
 *  - 'duplicate' when both variant headlines are identical
 *  - null when there is no active test or the test is valid
 */
export const getActiveAbTestHeadlineError = (
	card: Card,
): AbTestHeadlineErrorType | null => {
	const activeTest = card.tests?.find(isActiveTest);
	if (!activeTest) {
		return null;
	}

	const headlineA = getVariantHeadline(activeTest, 'A');
	const headlineB = getVariantHeadline(activeTest, 'B');

	if (!headlineA || !headlineB) {
		return 'incomplete';
	}

	if (headlineA === headlineB) {
		return 'duplicate';
	}

	return null;
};

// we can extend this in future to 'getVariantField'
export const getVariantHeadline = (
	test: Test | undefined,
	variantId: VariantId,
): string | undefined => {
	return test?.variantMeta.find((variant) => variant.id === variantId)?.meta
		.headline;
};
