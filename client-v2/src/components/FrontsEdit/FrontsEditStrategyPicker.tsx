import React from 'react';
import { match } from 'react-router-dom';
import Edit, { EditProps } from './Edit';
import { Dispatch } from 'types/Store';
import { connect } from 'react-redux';
import getFrontsConfig from 'actions/Fronts';
import {
  fetchEditionsIssueAsConfig,
  fetchFrontsConfig
} from 'services/faciaApi';
import { PriorityName } from 'types/Priority';

type FrontsEditStrategyPicker = EditProps & {
  match: match<{ priority: string; editionId?: string }>;
  dispatch: Dispatch;
};

const isValidPathForEdition = (priority: string, id?: string): id is string =>
  !!id && priority === 'edition';

const isValidPathForOtherPriority = (priority: string, id?: string) =>
  !id && priority !== 'edition';

const getConfigThunk = (
  dispatch: Dispatch,
  priority: string,
  editionId?: string
) => {
  if (isValidPathForEdition(priority, editionId)) {
    return () =>
      dispatch(getFrontsConfig(() => fetchEditionsIssueAsConfig(editionId)));
  } else if (isValidPathForOtherPriority(priority, editionId)) {
    return () => dispatch(getFrontsConfig(fetchFrontsConfig));
  }
  return null;
};

const FrontsEditStrategyPicker = ({
  match: {
    params: { priority, editionId }
  },
  dispatch,
  ...props
}: FrontsEditStrategyPicker) => {
  const thunk = getConfigThunk(dispatch, priority, editionId);

  if (!thunk) {
    // TODO - this should never happen but can we handle this more gracefully than rendering nothing
    // tslint:disable-next-line
    console.error(`Invalid URL`);
    return null;
  }

  return (
    <Edit
      {...props}
      priority={priority as PriorityName}
      getFrontsConfig={thunk}
    />
  );
};

export default connect(
  null,
  (dispatch: Dispatch) => ({ dispatch })
)(FrontsEditStrategyPicker);
