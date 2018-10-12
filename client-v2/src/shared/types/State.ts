

import { Reducers } from '../reducers/sharedReducer';
import { ExtractReturnType } from './Utility';

export State = $ObjMap<Reducers, ExtractReturnType>;
