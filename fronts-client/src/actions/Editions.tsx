import React from 'react';
import {
  proofIssue,
  publishIssue,
  checkIssue,
  putFrontHiddenState,
  putFrontMetadata,
} from 'services/editionsApi';
import { ThunkResult } from 'types/Store';
import { Dispatch } from 'redux';
import { EditionsFrontMetadata } from 'types/FaciaApi';
import noop from 'lodash/noop';
import { startOptionsModal } from './OptionsModal';
import IssueVersions from 'components/Editions/IssueVersions';

export const check = (id: string): ThunkResult<Promise<void>> => async (
  dispatch: Dispatch
) => {
  const errors = await checkIssue(id);
  if (errors.length === 0) {
    alert('No failed checks');
  } else {
    alert(`Check failure 1 of ${errors.length}: ${errors[0]}`);
  }
};

export const proofEditionIssue = (
  id: string
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  try {
    await proofIssue(id);
    dispatch(
      startOptionsModal(
        'Proof Succeeded',
        <>
          <p>
            This issue has been submitted for proofing, please check your app
            using the proof bucket setting, in the next few minutes.
          </p>
          <p>
            If you do not see the issue within 5 minutes please contact a member
            of the support team.
          </p>

          <IssueVersions issueId={id} />
        </>,
        [{ buttonText: 'Dismiss', callback: noop }],
        noop,
        false
      )
    );
  } catch (error) {
    dispatch(
      startOptionsModal(
        'Proofing Failed',
        <>
          <p>Failed to proof issue!</p>
          <p>If this problem persists, contact the support team.</p>
        </>,
        [],
        noop,
        true
      )
    );
  }
};

export const publishEditionIssue = (
  id: string,
  version?: string
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  if (!version) {
    alert('No issue version found');
  } else {
    try {
      await publishIssue(id, version);
      dispatch(
        startOptionsModal(
          'Publish Succeeded',
          <>
            <p>
              This issue has been submitted for publishing, please check your
              app in the next few minutes.
            </p>
            <p>
              If you do not see the issue within 5 minutes please contact a
              member of the support team.
            </p>
          </>,
          [{ buttonText: 'Dismiss', callback: noop }],
          noop,
          false
        )
      );
    } catch (error) {
      dispatch(
        startOptionsModal(
          'Published Failed',
          <>
            <p>Failed to publish issue!</p>
            <p>If this problem persists, contact the support team.</p>
          </>,
          [],
          noop,
          true
        )
      );
    }
  }
};

export const updateFrontMetadata = (
  id: string,
  metadata: EditionsFrontMetadata
): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  try {
    const nameOverride = metadata.nameOverride && metadata.nameOverride.trim();
    const serverMetadata = await putFrontMetadata(id, {
      ...metadata,
      nameOverride,
    });

    dispatch({
      type: 'FETCH_UPDATE_METADATA_SUCCESS',
      payload: {
        frontId: id,
        metadata: serverMetadata,
      },
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
        hidden: serverHidden,
      },
    });
  } catch (error) {
    // @todo implement centralised error handling
  }
};
