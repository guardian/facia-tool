import configureStore from 'util/configureStore';
import { fetchChefs } from '../chefsBundle';
import { selectors as chefSelectors } from 'bundles/chefsBundle';
import { FeastGraphQL } from '@guardian/feast-multiplatform-backend-api';

describe('chefsBundle', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('fetchChefs should fetch chef details by param, and add them to the state', async () => {
		const faciaChefSearchMock = jest
			.spyOn(FeastGraphQL.prototype, 'faciaChefSearch')
			.mockResolvedValue([
				{
					contributorId: 'profile/anna-jones',
					webTitle: 'Anna Jones',
					bylineImageUrl:
						'https://uploads.guim.co.uk/2018/01/29/Anna-Jones.jpg',
					bio: '<p>Anna Jones is a chef, writer, and author.</p>',
				},
				{
					contributorId: 'profile/anna-del-conte',
					webTitle: 'Anna Del Conte',
					bio: '<p>Anna Del Conte is the doyenne of Italian cookery.</p>',
				},
			]);

		const store = configureStore();
		await store.dispatch(fetchChefs({ query: 'anna' }) as any);

		expect(faciaChefSearchMock).toHaveBeenCalledWith(50, 'anna', null);
		expect(chefSelectors.selectAll(store.getState())).toEqual({
			'profile/anna-del-conte': {
				id: 'profile/anna-del-conte',
				type: 'Profile',
				webTitle: 'Anna Del Conte',
				webUrl: 'https://www.theguardian.com/profile/anna-del-conte',
				bio: 'Anna Del Conte is the doyenne of Italian cookery.',
			},
			'profile/anna-jones': {
				id: 'profile/anna-jones',
				type: 'Profile',
				webTitle: 'Anna Jones',
				webUrl: 'https://www.theguardian.com/profile/anna-jones',
				bio: 'Anna Jones is a chef, writer, and author.',
				bylineImageUrl: 'https://uploads.guim.co.uk/2018/01/29/Anna-Jones.jpg',
			},
		});
	});
});
