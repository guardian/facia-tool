import {
	getVisibilityArticleDetails,
	combineCollectionWithConfig,
} from '../frontsUtils';
import { card } from 'fixtures/card';
import { frontsConfig } from 'fixtures/frontsConfig';
import { CollectionWithNestedArticles } from 'types/Collection';

describe('Front utilities', () => {
	describe('getVisibilityArticleDetails', () => {
		it('summarise articles correctly according to group ', () => {
			const result = getVisibilityArticleDetails([[card], [card]]);
			expect(result[0]).toEqual({ group: 1 });
			expect(result[1]).toEqual({ group: 0 });
		});
	});

	describe('combineCollectionWithConfig', () => {
		const collectionName = 'collection-name';
		const collectionConfig = frontsConfig.data.collections.collectionUuid1;
		const collection: CollectionWithNestedArticles = {
			id: 'collectionUuid1',
			displayName: collectionName,
			isHidden: false,
			lastUpdated: 1583857626481,
			updatedBy: 'Foo Bar',
			updatedEmail: 'foo.bar@guardian.co.uk',
			live: [],
			targetedRegions: [],
			excludedRegions: [],
		};
		it('should fallback to config displayName by default', () => {
			const actual = combineCollectionWithConfig(collectionConfig, collection);
			expect(actual.displayName).toBe('name');
		});
		it('should use collection name if `useCollectionDisplayName` is true', () => {
			const actual = combineCollectionWithConfig(
				collectionConfig,
				collection,
				true,
			);
			expect(actual.displayName).toBe(collectionName);
		});
	});
});
