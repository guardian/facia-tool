import { StateType } from 'typesafe-actions';
import rootReducer from 'reducers/rootReducer';
import sharedRootReducer from 'reducers/sharedReducer';

export type State = StateType<typeof rootReducer>;
export type SharedState = ReturnType<typeof sharedRootReducer>;
