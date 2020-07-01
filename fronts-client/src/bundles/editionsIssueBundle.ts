import createAsyncResourceBundle, {
  State,
} from 'lib/createAsyncResourceBundle';
import { EditionsIssue } from 'types/Edition';
import { ThunkResult, Dispatch } from 'types/Store';
import { getIssueSummary, getLastProofedIssueVersion } from 'services/editionsApi';

export const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState,
} = createAsyncResourceBundle<EditionsIssue>('editionsIssue', {
  indexById: false,
  initialData: undefined,
});

export type EditionsIssueState = State<EditionsIssue>;

export default reducer;

export const getEditionIssue = (
  id: string
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  try {
    dispatch(actions.fetchStart());
    const issuePromise = getIssueSummary(id);
    const version = await getLastProofedIssueVersion(id);
    const i = {
      ...await issuePromise,
      version,
    }
    dispatch(actions.fetchSuccess(i));
  } catch (error) {
    dispatch(actions.fetchError('Failed to get issue'));
  }
};
