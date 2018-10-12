

import { combineReducers } from 'redux';
import articleFragments from './articleFragmentsReducer';
import groups from './groupsReducer';
import { reducer as collections } from '../bundles/collectionsBundle';
import { reducer as externalArticles } from '../bundles/externalArticlesBundle';

const reducers = {
  articleFragments,
  groups,
  collections,
  externalArticles
};

export Reducers = typeof reducers;

export default combineReducers(reducers);
