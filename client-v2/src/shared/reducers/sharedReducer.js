// @flow

import { combineReducers } from 'redux';
import articleFragments from './articleFragmentsReducer';
import { reducer as collections } from '../bundles/collectionsBundle';
import { reducer as externalArticles } from '../bundles/externalArticlesBundle';

const reducers = {
  articleFragments,
  collections,
  externalArticles
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
