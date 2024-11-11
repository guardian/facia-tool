import set from 'lodash/fp/set';
import { state, data } from './fixtures';
import { reducer } from '../pageViewDataReducer';
import { pageViewDataReceivedAction } from '../../actions/PageViewData';

describe('Page view data reducer', () => {
	it('adds data to the store when it is received', () => {
		const action = pageViewDataReceivedAction(
			[data],
			'frontId',
			'collectionId',
		);
		const newState = reducer(undefined, action);
		expect(newState).toEqual(state);
	});
	it('clears out previous data when `clearPreviousData` is true', () => {
		const newData = set(['articleId'], 'articleId2', data);
		const action = pageViewDataReceivedAction(
			[newData],
			'frontId',
			'collectionId',
			true,
		);
		const expectedState = set(
			['frontId', 'collections', 'collectionId', 'stories'],
			{
				articleId2: newData,
			},
			state,
		);
		const newState = reducer(state, action);
		expect(newState).toEqual(expectedState);
	});
});
