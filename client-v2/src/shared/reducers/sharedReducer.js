// @flow

import { combineReducers } from 'redux';
import articleFragments from './articleFragmentsReducer';
import collections from './collectionsReducer';
import externalArticles from './externalArticlesReducer';

const reducers = {
  articleFragments,
  collections,
  externalArticles
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
