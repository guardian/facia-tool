import { Card } from '../types/Collection';

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
