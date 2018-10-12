

import { type Reducers } from '../reducers/sharedReducer';
import { type ExtractReturnType } from './Utility';

export type State = $ObjMap<Reducers, ExtractReturnType>;
