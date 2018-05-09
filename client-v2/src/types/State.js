// @flow

import { type Reducers } from 'reducers/rootReducer';
import { type ExtractReturnType } from './Utility';

export type State = $ObjMap<Reducers, ExtractReturnType>;
