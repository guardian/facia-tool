import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { match } from 'react-router-dom';
import { styled } from 'constants/theme';
import getFrontsConfig from 'actions/Fronts';
import {} from 'bundles/frontsUIBundle';
import {
  editorOpenFront,
  selectEditorFrontsByPriority
} from 'bundles/frontsUIBundle';
import { State } from 'types/State';
import { ActionError } from 'types/Action';
import FrontContainer from './FrontContainer';
import FeedSection from '../FeedSection';
import ErrorBannner from '../ErrorBanner';
import SectionContainer from '../layout/SectionContainer';
import SectionsContainer from '../layout/SectionsContainer';
import FrontsMenu from './FrontsMenu';
import PressFailAlert from '../PressFailAlert';

interface Props {
  match: match<{ priority: string }>;
  error: ActionError;
  frontIds: string[];
  staleFronts: { [id: string]: boolean };
  editorOpenFront: (frontId: string) => void;
  getFrontsConfig: () => void;
}

const FrontsEditContainer = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const SingleFrontContainer = styled('div')`
  height: 100%;
`;

const FeedContainer = styled(SectionContainer)`
  height: 100%;
`;

const FrontsContainer = styled(SectionContainer)`
  overflow-x: scroll;
`;

class FrontsEdit extends React.Component<Props> {
  public componentDidMount() {
    this.props.getFrontsConfig();
  }

  public render() {
    return (
      <FrontsEditContainer>
        <ErrorBannner error={this.props.error} />
        <PressFailAlert staleFronts={this.props.staleFronts} />
        <SectionsContainer>
          <FeedContainer>
            <FeedSection />
          </FeedContainer>
          <FrontsContainer>
            {this.props.frontIds.map(frontId => (
              <SingleFrontContainer key={frontId}>
                <FrontContainer frontId={frontId} />
              </SingleFrontContainer>
            ))}
          </FrontsContainer>
        </SectionsContainer>
        <FrontsMenu onSelectFront={this.props.editorOpenFront} />
      </FrontsEditContainer>
    );
  }
}

const mapStateToProps = (state: State, props: Props) => ({
  error: state.error,
  staleFronts: state.staleFronts,
  frontIds: selectEditorFrontsByPriority(
    state,
    props.match.params.priority || ''
  )
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      editorOpenFront,
      getFrontsConfig
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontsEdit);
