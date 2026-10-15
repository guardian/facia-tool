/**
 * Pure logic for the "headline updated in article" indicator.
 *
 * The only durable state we keep is `card.meta.baselineCapiHeadline`: the CAPI headline
 * the editor last adopted (set on card creation and re-baselined on save). The
 * "headline updated in article" badge is then derived by comparing that baseline with
 * the current CAPI headline and the card's custom headline.
 */

export const hasCapiHeadlineChanged = (
	hasAbTest: boolean,
	baselineCapiHeadline?: string,
	articleHeadline?: string,
	cardHeadline?: string,
): boolean => {
	// We can only detect a change once we have both an adopted baseline
	// (baselineCapiHeadline) and a current CAPI headline to compare it against.
	if (baselineCapiHeadline === undefined || articleHeadline === undefined) {
		return false;
	}
	// CAPI hasn't changed since the editor last adopted a headline.
	if (articleHeadline === baselineCapiHeadline) {
		return false;
	}
	// When the card has an A/B test, the variant headlines drive what's displayed,
	// so we can ignore the card headline and flag purely on CAPI having changed
	// since the baseline was adopted.
	if (hasAbTest) {
		return true;
	}
	// Otherwise only flag when the editor has a custom headline that diverges from
	// the new CAPI headline. A card with no custom headline simply mirrors CAPI.
	return cardHeadline !== undefined && cardHeadline !== articleHeadline;
};

/**
 * Decide whether a save should re-adopt the current CAPI headline as the new
 * baseline. We re-baseline whenever the card is in sync with CAPI either before
 * the save (no custom headline, or custom headline matched CAPI) or after it
 * (the editor has just adopted the current CAPI headline). An unrelated save
 * while a divergent custom headline is in place leaves the baseline untouched,
 * so an outstanding "headline changed" flag is preserved.
 */
export const shouldRebaselineCapiHeadline = (
	cardHeadlineBeforeSave: string | undefined,
	cardHeadlineAfterSave: string | undefined,
	externalHeadline: string | undefined,
): boolean => {
	if (externalHeadline === undefined) {
		return false;
	}
	const cardMatchedCapiBeforeSave =
		cardHeadlineBeforeSave === undefined ||
		cardHeadlineBeforeSave === externalHeadline;
	const cardMatchesCapiAfterSave = cardHeadlineAfterSave === externalHeadline;
	return cardMatchedCapiBeforeSave || cardMatchesCapiAfterSave;
};
