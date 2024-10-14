import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router-dom';
import { styled } from 'constants/theme';
import getFrontsConfig from 'actions/Fronts';
import {
	editorOpenFront,
	editorFavouriteFront,
	editorUnfavouriteFront,
	selectEditorFrontIdsByPriority,
	selectIsCurrentFrontsMenuOpen,
	selectIsClipboardOpen,
} from 'bundles/frontsUI';
import type { State } from 'types/State';
import { ActionError } from 'types/Action';
import FrontContainer from './FrontSection';
import FeedSection from '../feed/FeedSection';
import ErrorBannner from '../ErrorBanner';
import SectionContainer from '../layout/SectionContainer';
import SectionsContainer from '../layout/SectionsContainer';
import FrontsMenu from './FrontsMenu';
import PressFailAlert from '../PressFailAlert';
import { frontsContainerId } from 'util/editUtils';
import { FrontsEditParams } from 'routes/routes';

interface Props {
	match: match<FrontsEditParams>;
	error: ActionError;
	frontIds: string[];
	staleFronts: { [id: string]: boolean };
	editorOpenFront: (frontId: string, priority: string) => void;
	editorFavouriteFront: (frontId: string, priority: string) => void;
	editorUnfavouriteFront: (frontId: string, priority: string) => void;
	getFrontsConfig: () => void;
	isCurrentFrontsMenuOpen: boolean;
	isClipboardOpen: boolean;
}

const FrontsEditContainer = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
`;

const FeedContainer = styled(SectionContainer)`
	height: 100%;
`;

const FrontsContainer = styled(SectionContainer)<{
	makeRoomForExtraHeader: boolean;
}>`
	display: flex;
	flex-grow: 1;
	height: 100%;
	overflow-y: hidden;
	overflow-x: scroll;
	transition: transform 0.15s;
	${({ makeRoomForExtraHeader }) =>
		makeRoomForExtraHeader &&
		`
    transform: translate3d(0, 60px, 0);
    height: calc(100% - 60px)`}
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
						<FeedSection isClipboardOpen={this.props.isClipboardOpen} />
					</FeedContainer>
					<FrontsContainer
						id={frontsContainerId}
						makeRoomForExtraHeader={this.props.isCurrentFrontsMenuOpen}
					>
						{this.props.frontIds.map((id) => (
							<FrontContainer key={id} frontId={id} />
						))}
					</FrontsContainer>
				</SectionsContainer>
				<FrontsMenu
					onSelectFront={(id) =>
						this.props.editorOpenFront(id, this.props.match.params.priority)
					}
					onFavouriteFront={(id) =>
						this.props.editorFavouriteFront(
							id,
							this.props.match.params.priority,
						)
					}
					onUnfavouriteFront={(id) =>
						this.props.editorUnfavouriteFront(
							id,
							this.props.match.params.priority,
						)
					}
				/>
			</FrontsEditContainer>
		);
	}
}

const mapStateToProps = (state: State, props: Props) => ({
	error: state.error,
	staleFronts: state.staleFronts,
	frontIds: selectEditorFrontIdsByPriority(
		state,
		props.match.params.priority || '',
	),
	isCurrentFrontsMenuOpen: selectIsCurrentFrontsMenuOpen(state),
	isClipboardOpen: selectIsClipboardOpen(state),
});

const mapDispatchToProps = (dispatch: Dispatch, props: Props) => ({
	editorOpenFront: (id: string) => {
		dispatch(editorOpenFront(id, props.match.params.priority));
	},
	editorFavouriteFront: (id: string) =>
		dispatch(editorFavouriteFront(id, props.match.params.priority)),
	editorUnfavouriteFront: (id: string) =>
		dispatch(editorUnfavouriteFront(id, props.match.params.priority)),
	getFrontsConfig: () => dispatch(getFrontsConfig()),
});

export default connect(mapStateToProps, mapDispatchToProps)(FrontsEdit);
