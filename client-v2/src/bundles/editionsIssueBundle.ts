import createAsyncResourceBundle, {
  State
} from 'lib/createAsyncResourceBundle';
import { EditionsIssue } from 'types/Edition';

export const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle<EditionsIssue>('editionsIssue', {
  indexById: false,
  initialData: undefined
});

export type EditionsIssueState = State<EditionsIssue>;

export default reducer;
