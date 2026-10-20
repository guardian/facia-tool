import {
	hasCapiHeadlineChanged,
	shouldRebaselineCapiHeadline,
} from '../headlineUpdate';

describe('headlineUpdate', () => {
	describe('hasCapiHeadlineChanged', () => {
		it('is false when there is no adopted baseline yet', () => {
			expect(hasCapiHeadlineChanged(false, undefined, 'New', 'Custom')).toBe(
				false,
			);
		});

		it('is false when there is no current CAPI headline', () => {
			expect(
				hasCapiHeadlineChanged(false, 'Baseline', undefined, 'Custom'),
			).toBe(false);
		});

		it('is false when CAPI has not changed since adoption', () => {
			expect(hasCapiHeadlineChanged(false, 'Same', 'Same', 'Custom')).toBe(
				false,
			);
		});

		it('is false when the card mirrors CAPI (no custom headline)', () => {
			// baseline is stale but the card has no custom headline, so it simply
			// follows CAPI and should never flag.
			expect(hasCapiHeadlineChanged(false, 'Old', 'New', undefined)).toBe(
				false,
			);
		});

		it('is false when the custom headline already matches the new CAPI headline', () => {
			expect(hasCapiHeadlineChanged(false, 'Old', 'New', 'New')).toBe(false);
		});

		it('is true when a custom headline diverges from a changed CAPI headline', () => {
			expect(hasCapiHeadlineChanged(false, 'Old', 'New', 'Custom')).toBe(true);
		});

		describe('with an active A/B test', () => {
			it('is true when CAPI has updated and the custom headline has diverged from the changed CAPI headline', () => {
				expect(hasCapiHeadlineChanged(true, 'Old', 'New', 'Custom')).toBe(true);
			});

			it('is true when CAPI has updated, even if the the card headline matches the CAPI headline', () => {
				// even though the underlying card headline might be the same, we always want to
				// indicate to users that the CAPI headline has been updated when the card has test on it.
				expect(hasCapiHeadlineChanged(true, 'Old', 'New', 'Custom')).toBe(true);
			});

			it('is false when CAPI matches the adopted baseline', () => {
				expect(hasCapiHeadlineChanged(true, 'Same', 'Same', 'Custom')).toBe(
					false,
				);
			});
		});
	});

	describe('shouldRebaselineCapiHeadline', () => {
		it('does not re-baseline without a current CAPI headline', () => {
			expect(shouldRebaselineCapiHeadline('Custom', 'Custom', undefined)).toBe(
				false,
			);
		});

		it('re-baselines when the card had no custom headline before the save', () => {
			expect(shouldRebaselineCapiHeadline(undefined, 'Custom', 'New')).toBe(
				true,
			);
		});

		it('re-baselines when the pre-save custom headline matched CAPI', () => {
			expect(shouldRebaselineCapiHeadline('New', 'Other', 'New')).toBe(true);
		});

		it('re-baselines when the editor adopts the current CAPI headline', () => {
			expect(shouldRebaselineCapiHeadline('Old', 'New', 'New')).toBe(true);
		});

		it('leaves the baseline untouched on an unrelated save while diverged', () => {
			// baseline stays put so an outstanding "headline changed" flag persists.
			expect(shouldRebaselineCapiHeadline('Custom', 'Custom', 'New')).toBe(
				false,
			);
		});
	});
});
