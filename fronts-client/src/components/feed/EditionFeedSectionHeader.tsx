import React, { ReactNode } from 'react';
import { EditionsIssue } from '../../types/Edition';
import { connect } from 'react-redux';
import type { State } from 'types/State';
import { selectors as editionsIssueSelectors } from '../../bundles/editionsIssueBundle';
import { Dispatch } from '../../types/Store';
import {
  publishEditionIssue,
  proofEditionIssue,
  check,
} from '../../actions/Editions';
import { styled } from '../../constants/theme';
import startCase from 'lodash/startCase';
import EditModeVisibility from '../util/EditModeVisibility';
import Button from '../inputs/ButtonDefault';
import { Link } from 'react-router-dom';
import url from 'constants/url';
import noop from 'lodash/noop';
import { startOptionsModal } from 'actions/OptionsModal';
import IssueVersions from '../Editions/IssueVersions';
import { getEditionIssue } from 'bundles/editionsIssueBundle';
import format from 'date-fns/format';

enum ProofOrPublish {
  Proof = 'Proof',
  Publish = 'Publish',
}

export type StartConfirmProofOrPublishModal = (
  title: string,
  description: ReactNode,
  buttonText: ProofOrPublish,
  onAccept: () => void
) => void;

interface ComponentProps {
  editionsIssue: EditionsIssue;
  startConfirmProofOrPublishModal: StartConfirmProofOrPublishModal;
  proofEditionsIssue: (id: string) => Promise<void>;
  publishEditionsIssue: (id: string, version?: string) => Promise<void>;
  checkIssue: (id: string) => Promise<void>;
}

const ManageLink = styled(Link)`
  color: white;
  text-decoration: none;
`;

const EditionIssueInfo = styled.div`
  height: 100%;
  display: inline-block;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;
  line-height: 1em;
`;

const EditionTitle = styled.div`
  font-size: 20px;
`;

const EditionDate = styled.div`
  font-size: 16px;
`;

const EditionPublish = styled.div`
  margin-left: auto;
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

class EditionFeedSectionHeader extends React.Component<ComponentProps> {
  public render() {
    const { editionsIssue } = this.props;

    return (
      <>
        <ManageLink to={url.manageEditions + editionsIssue.edition}>
          <EditionIssueInfo>
            <EditionTitle>{startCase(editionsIssue.edition)}</EditionTitle>
            <EditionDate>
              {new Date(editionsIssue.issueDate).toDateString()}
            </EditionDate>
          </EditionIssueInfo>
        </ManageLink>
        &nbsp;
        <EditionPublish>
          <EditModeVisibility visibleMode="editions">
            {editionsIssue.supportsProofing && (
              <Button
                data-testid="publish-edition-button"
                size="l"
                priority="primary"
                onClick={() => this.confirmProof()}
                tabIndex={-1}
                title="Proof Edition"
              >
                Proof
              </Button>
            )}
          </EditModeVisibility>
          &nbsp;
          <Button
            data-testid="publish-edition-button"
            size="l"
            priority="primary"
            onClick={() => this.confirmPublish()}
            tabIndex={-1}
            title="Publish Edition"
          >
            Publish
          </Button>
        </EditionPublish>
      </>
    );
  }

  private check = () => {
    const { editionsIssue, checkIssue } = this.props;
    checkIssue(editionsIssue.id);
  };

  private confirmProof = () => {
    const {
      startConfirmProofOrPublishModal,
      editionsIssue,
      proofEditionsIssue,
    } = this.props;

    startConfirmProofOrPublishModal(
      'Confirm proof',
      <>
        <p>Confirm the proofing of a new version of this issue.</p>
        <IssueVersions issueId={editionsIssue.id} />
      </>,
      ProofOrPublish.Proof,
      () => proofEditionsIssue(editionsIssue.id)
    );
  };

  private confirmPublish = () => {
    const {
      startConfirmProofOrPublishModal,
      editionsIssue,
      publishEditionsIssue,
    } = this.props;
    const { id, lastProofedVersion } = editionsIssue;
    getEditionIssue(id);

    const timeAndTimeZone = displayTime(lastProofedVersion);

    if (!editionsIssue.supportsProofing) {
      publishEditionsIssue(id, 'proofing-not-required'); // string here is a `magic value` to avoid the `undefined` case leading to accidental publishing
    } else {
      startConfirmProofOrPublishModal(
        'Confirm publish',
        <>
          <p>Confirm the publication of a new version of this issue.</p>
          <p>Publishing a new version will not halt in-progress versions.</p>
          <strong>Version to be published is: {timeAndTimeZone}</strong>
        </>,
        ProofOrPublish.Publish,
        () => publishEditionsIssue(id, lastProofedVersion)
      );
    }
  };
}

function displayTime(lastProofedVersion: string | undefined) {
  if (!lastProofedVersion) {
    return 'No proofed version available';
  }
  return format(lastProofedVersion, 'HH:mm:ss') + `(${lastProofedVersion})`;
}

const mapStateToProps = () => {
  return (state: State) => ({
    editionsIssue: editionsIssueSelectors.selectAll(state),
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startConfirmProofOrPublishModal: (
    title: string,
    description: ReactNode,
    buttonText: ProofOrPublish,
    onAccept: () => void
  ) =>
    dispatch(
      startOptionsModal(
        title,
        description,
        [{ buttonText, callback: onAccept }],
        noop
      )
    ),
  proofEditionsIssue: (id: string) => dispatch(proofEditionIssue(id)),
  publishEditionsIssue: (id: string, version?: string) =>
    dispatch(publishEditionIssue(id, version)),
  checkIssue: (id: string) => dispatch(check(id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditionFeedSectionHeader);
