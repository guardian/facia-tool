

import { Reducers } from 'reducers/rootReducer';
import { ExtractReturnType } from 'shared/types/Utility';

export State = $ObjMap<Reducers, ExtractReturnType>;
