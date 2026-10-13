/**
 * Pure logic for the "CAPI headline has changed" indicator.
 *
 * The only durable state we keep is `card.meta.capiHeadline`: the CAPI headline
 * the editor last adopted (set on card creation and re-baselined on save). The
 * badge/dot is then derived - never persisted - by comparing that baseline with
 * the current CAPI headline and the card's custom headline.
 */

export const hasCapiHeadlineChanged = (
	hasActiveAbTest: boolean,
	capiHeadline?: string,
	articleHeadline?: string,
	cardHeadline?: string,
): boolean => {
	// We can only detect a change once we have both an adopted baseline
	// (capiHeadline) and a current CAPI headline to compare it against.
	if (capiHeadline === undefined || articleHeadline === undefined) {
		return false;
	}
	// CAPI hasn't moved since the editor last adopted a headline.
	if (articleHeadline === capiHeadline) {
		return false;
	}
	// During an active A/B test the variant headlines drive what's displayed, so
	// flag purely on CAPI having moved since the baseline was adopted.
	if (hasActiveAbTest) {
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
	preSaveCardHeadline: string | undefined,
	newCardHeadline: string | undefined,
	externalHeadline: string | undefined,
): boolean => {
	if (externalHeadline === undefined) {
		return false;
	}
	const preSaveInSync =
		preSaveCardHeadline === undefined ||
		preSaveCardHeadline === externalHeadline;
	const newInSync = newCardHeadline === externalHeadline;
	return preSaveInSync || newInSync;
};
