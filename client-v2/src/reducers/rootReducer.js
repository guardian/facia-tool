// @flow

import { combineReducers } from 'redux';
import config from './configReducer';
import frontsConfig from './frontsConfigReducer';
import error from './errorReducer';
import path from './pathReducer';
import collections from './collectionsReducer';
import articleFragments from './articleFragmentsReducer';
import externalArticles from './externalArticlesReducer';

const reducers = {
  config,
  frontsConfig,
  error,
  path,
  collections,
  articleFragments,
  externalArticles
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
