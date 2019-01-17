import { StateType } from 'typesafe-actions';
import rootReducer from 'reducers/rootReducer';

export type State = StateType<typeof rootReducer>;
