import { State as StateInterface } from 'reducers/rootReducer';
import sharedRootReducer from 'reducers/sharedReducer';

export type State = StateInterface;
export type SharedState = ReturnType<typeof sharedRootReducer>;
