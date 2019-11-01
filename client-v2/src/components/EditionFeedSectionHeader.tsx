import React, { ReactNode } from 'react';
import { EditionsIssue } from '../types/Edition';
import { connect } from 'react-redux';
import { State } from '../types/State';
import { selectors as editionsIssueSelectors } from '../bundles/editionsIssueBundle';
import { Dispatch } from '../types/Store';
import { publishEditionIssue } from '../actions/Editions';
import { styled } from '../constants/theme';
import startCase from 'lodash/startCase';
import EditModeVisibility from './util/EditModeVisibility';
import Button from '../shared/components/input/ButtonDefault';
import { Link } from 'react-router-dom';
import urls from 'constants/urls';
import noop from 'lodash/noop';
import { startOptionsModal } from 'actions/OptionsModal';
import IssueVersions from './Editions/IssueVersions/index';

interface ComponentProps {
  editionsIssue: EditionsIssue;
  startConfirmPublishModal: (
    title: string,
    description: ReactNode,
    onAccept: () => void
  ) => void;
  publishEditionsIssue: (id: string) => Promise<void>;
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
  float: right;
  margin: 5px 10px 0 0;
`;

class EditionFeedSectionHeader extends React.Component<ComponentProps> {
  public render() {
    const { editionsIssue } = this.props;

    return (
      <>
        <ManageLink to={urls.manageEditions}>
          <EditionIssueInfo>
            <EditionTitle>{startCase(editionsIssue.edition)}</EditionTitle>
            <EditionDate>
              {new Date(editionsIssue.issueDate).toDateString()}
            </EditionDate>
          </EditionIssueInfo>
        </ManageLink>
        <EditionPublish>
          <EditModeVisibility visibleMode="editions">
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
          </EditModeVisibility>
        </EditionPublish>
      </>
    );
  }

  private confirmPublish = () => {
    const {
      startConfirmPublishModal,
      editionsIssue,
      publishEditionsIssue
    } = this.props;

    startConfirmPublishModal(
      'Confirm publish',
      <>
        <p>Confirm the publication of a new version of this issue.</p>
        <p>Publishing a new version will not halt in-progress versions.</p>
        <IssueVersions issueId={editionsIssue.id} />
      </>,
      () => publishEditionsIssue(editionsIssue.id)
    );
  };
}

const mapStateToProps = () => {
  return (state: State) => ({
    editionsIssue: editionsIssueSelectors.selectAll(state)
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startConfirmPublishModal: (
    title: string,
    description: ReactNode,
    onAccept: () => void
  ) =>
    dispatch(
      startOptionsModal(
        title,
        description,
        [{ buttonText: 'Publish', callback: onAccept }],
        noop
      )
    ),
  publishEditionsIssue: (id: string) => dispatch(publishEditionIssue(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditionFeedSectionHeader);
