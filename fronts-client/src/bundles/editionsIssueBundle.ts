import createAsyncResourceBundle, {
	State,
} from 'lib/createAsyncResourceBundle';
import { EditionsIssue } from 'types/Edition';
import { ThunkResult, Dispatch } from 'types/Store';
import {
	getIssueSummary,
	getLastProofedIssueVersion,
} from 'services/editionsApi';

export const { actions, actionNames, reducer, selectors, initialState } =
	createAsyncResourceBundle<EditionsIssue>('editionsIssue', {
		indexById: false,
		initialData: undefined,
	});

export type EditionsIssueState = State<EditionsIssue>;

export default reducer;

export const getEditionIssue =
	(id: string): ThunkResult<Promise<void>> =>
	async (dispatch: Dispatch) => {
		try {
			dispatch(actions.fetchStart());
			const issuePromise = getIssueSummary(id);
			const lastProofedVersion = await getLastProofedIssueVersion(id);
			const issueWithVersion = {
				...(await issuePromise),
				lastProofedVersion,
			};
			dispatch(actions.fetchSuccess(issueWithVersion));
		} catch (error) {
			dispatch(actions.fetchError('Failed to get issue'));
		}
	};

export const refreshEditionVersion =
	(issueId: string): ThunkResult<Promise<void>> =>
	async (dispatch, getState) => {
		try {
			dispatch(actions.fetchStart());
			// Get current issue
			const issue = selectors.selectAll(getState());
			if (!issue) {
				// wtf??
				return;
			}

			// Fetch new version
			const lastProofedVersion = await getLastProofedIssueVersion(issueId);

			// Update current issue with new version
			dispatch(
				actions.fetchSuccess({
					...issue,
					lastProofedVersion,
				}),
			);
		} catch (error) {
			dispatch(actions.fetchError('Failed to update issue version'));
		}
	};
