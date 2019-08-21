import React from 'react';
import {
  getIssueSummary,
  publishIssue,
  putFrontHiddenState,
  putFrontMetadata
} from 'services/editionsApi';
import { ThunkResult } from 'types/Store';
import { Dispatch } from 'redux';
import { actions } from 'bundles/editionsIssueBundle';
import { startConfirmModal } from './ConfirmModal';
import { EditionsFrontMetadata } from 'types/FaciaApi';
import noop from 'lodash/noop';

export const getEditionIssue = (
  id: string
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  try {
    dispatch(actions.fetchStart());
    const issue = await getIssueSummary(id);
    dispatch(actions.fetchSuccess(issue));
  } catch (error) {
    dispatch(actions.fetchError('Failed to get issue'));
  }
};

export const publishEditionIssue = (
  id: string
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  try {
    await publishIssue(id);
    dispatch(
      startConfirmModal(
        'Publish Succeeded',
        <>
          <p>
            This issue has been submitted for publishing, please check your app
            in the next few minutes.
          </p>
          <p>
            If you do not see the issue within 5 minutes please contact a member
            of the suport team.
          </p>
        </>,
        noop,
        noop,
        false
      )
    );
  } catch (error) {
    dispatch(
      startConfirmModal(
        'Published Failed',
        <>
          <p>Failed to publish issue!</p>
          <p>If this problem persists, contact the support team.</p>
        </>,
        noop,
        noop,
        false
      )
    );
  }
};

export const updateFrontMetadata = (
  id: string,
  metadata: EditionsFrontMetadata
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  try {
    const serverMetadata = await putFrontMetadata(id, metadata);
    dispatch({
      type: 'FETCH_UPDATE_METADATA_SUCCESS',
      payload: {
        frontId: id,
        metadata: serverMetadata
      }
    });
  } catch (error) {
    // @todo implement centralised error handling
  }
};

export const setFrontHiddenState = (
  id: string,
  hidden: boolean
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  try {
    const serverHidden = await putFrontHiddenState(id, hidden);
    dispatch({
      type: 'FETCH_FRONT_HIDDEN_STATE_SUCCESS',
      payload: {
        frontId: id,
        hidden: serverHidden
      }
    });
  } catch (error) {
    // @todo implement centralised error handling
  }
};
