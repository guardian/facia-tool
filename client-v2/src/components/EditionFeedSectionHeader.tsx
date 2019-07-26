import React from 'react';
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

interface ComponentProps {
  editionsIssue: EditionsIssue;
  publishEditionsIssue: (id: string) => Promise<void>;
}

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
    const { editionsIssue, publishEditionsIssue } = this.props;

    return (
      <>
        <Link to="/manage-editions/daily-edition">
          <EditionIssueInfo>
            <EditionTitle>{startCase(editionsIssue.displayName)}</EditionTitle>
            <EditionDate>
              {new Date(editionsIssue.issueDate).toDateString()}
            </EditionDate>
          </EditionIssueInfo>
        </Link>
        <EditionPublish>
          <EditModeVisibility visibleMode="editions">
            <Button
              size="l"
              priority="primary"
              onClick={() => publishEditionsIssue(editionsIssue.id)}
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
}

const mapStateToProps = () => {
  return (state: State) => ({
    editionsIssue: editionsIssueSelectors.selectAll(state)
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  publishEditionsIssue: (id: string) => dispatch(publishEditionIssue(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditionFeedSectionHeader);
