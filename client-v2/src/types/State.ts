

import { type Reducers } from 'reducers/rootReducer';
import { type ExtractReturnType } from 'shared/types/Utility';

export type State = $ObjMap<Reducers, ExtractReturnType>;
