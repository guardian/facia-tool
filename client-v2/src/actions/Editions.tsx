import React from 'react';
import { getIssueSummary, publishIssue } from 'services/editionsApi';
import { ThunkResult } from 'types/Store';
import { Dispatch } from 'redux';
import { actions } from 'bundles/editionsIssueBundle';
import { startConfirmModal } from './ConfirmModal';

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
        [],
        [],
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
        [],
        [],
        false
      )
    );
  }
};