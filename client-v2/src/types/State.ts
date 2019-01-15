<<<<<<< HEAD
import reducer from 'reducers/rootReducer';
import { StateType } from 'typesafe-actions';
=======
import { StateType } from 'typesafe-actions'
>>>>>>> Bang, and the unused stuff is gone
import rootReducer from 'reducers/rootReducer';

export type State = StateType<typeof rootReducer>;
