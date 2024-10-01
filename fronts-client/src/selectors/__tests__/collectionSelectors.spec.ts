import { selectIsCollectionLocked } from 'selectors/collectionSelectors';
import { frontsConfig } from 'fixtures/frontsConfig';

describe('Validating Front Collection configuration metadata', () => {
	it('validates correctly if Collection is uneditable ', () => {
		expect(
			selectIsCollectionLocked(
				{
					fronts: {
						frontsConfig,
					},
				} as any,
				'collection1',
			),
		).toEqual(true);
		expect(
			selectIsCollectionLocked(
				{
					fronts: {
						frontsConfig,
					},
				} as any,
				'collection2',
			),
		).toEqual(false);
	});
});
