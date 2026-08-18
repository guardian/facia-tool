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

export type AbTestHeadlineErrorType = 'duplicate' | 'incomplete';
/**
 * Validates the headline A/B test (if any) on a card. Returns:
 *  - 'incomplete' when either variant headline is missing, empty or
 *    whitespace-only
 *  - 'duplicate' when both variant headlines are identical
 *  - null when there is no active or draft test or the test is valid
 */
export const getCurrentAbTestHeadlineError = (
	card: Card,
): AbTestHeadlineErrorType | null => {
	const currentTest =
		card.tests?.find(isActiveTest) || card.tests?.find(isDraftTest);
	if (!currentTest) {
		return null;
	}

	const headlineA = getVariantHeadline(currentTest, 'A')?.trim();
	const headlineB = getVariantHeadline(currentTest, 'B')?.trim();

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
