import { getIssue } from 'services/editionsApi';
import { ThunkResult } from 'types/Store';
import { Dispatch } from 'redux';
import { actions } from 'bundles/editionsIssueBundle';

export const getEditionIssue = (
  id: string
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  try {
    dispatch(actions.fetchStart());
    const issue = await getIssue(id);
    dispatch(actions.fetchSuccess(issue));
  } catch (error) {
    dispatch(actions.fetchError('Failed to get issue'));
  }
};
