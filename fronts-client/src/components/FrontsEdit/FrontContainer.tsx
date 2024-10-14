import React from 'react';
import { styled } from 'constants/theme';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { State } from 'types/State';
import { Dispatch } from 'types/Store';
import {
	editorSelectCard,
	editorOpenOverview,
	editorCloseOverview,
	selectIsFrontOverviewOpen,
} from 'bundles/frontsUI';
import {
	editorOpenAllCollectionsForFront,
	editorCloseAllCollectionsForFront,
} from 'bundles/frontsUI/thunks';
import { selectors as editionsIssueSelectors } from '../../bundles/editionsIssueBundle';
import { CardSets, Card as TCard } from 'types/Collection';
import { initialiseCollectionsForFront } from 'actions/Collections';
import { setFocusState } from 'bundles/focusBundle';
import { theme } from 'constants/theme';
import ButtonCircularCaret from 'components/inputs/ButtonCircularCaret';
import ButtonRoundedWithLabel, {
	ButtonLabel,
} from 'components/inputs/ButtonRoundedWithLabel';
import { DownCaretIcon } from 'components/icons/Icons';
import FrontCollectionsOverview from './FrontCollectionsOverview';
import FrontContent from './FrontContent';
import DragToAddSnap from './CollectionComponents/DragToAddSnap';
import { selectPriority } from 'selectors/pathSelectors';
import { Priorities } from 'types/Priority';
import { DragToAddFeastCollection } from './CollectionComponents/DragToAddFeastCollection';
import Button from '../inputs/ButtonDefault';
import { addFrontCollection } from '../../actions/Editions';

const FrontWrapper = styled.div`
	height: 100%;
	display: flex;
`;

const SectionContentMetaContainer = styled.div`
	display: flex;
	flex-shrink: 0;
	justify-content: flex-start;
	flex-wrap: wrap;
	align-content: center;
	gap: 5px;
	padding: 5px 5px 5px 0px;
`;

const OverviewToggleContainer = styled.div<{ active: boolean }>`
	font-size: 13px;
	font-weight: bold;
	padding-left: 10px;
	padding-top: 3px;
	border-left: ${`solid 1px  ${theme.colors.greyVeryLight}`};
	padding-top: 13px;
	padding-bottom: 10px;
	text-align: right;
	margin-left: ${(props) => (props.active ? '0' : '-1px')};
	cursor: pointer;
`;

const DragToAddContainer = styled.div`
	margin-right: auto;
`;

const OverviewHeading = styled.label`
	margin-right: 5px;
	cursor: pointer;
`;

const OverviewHeadingButton = styled(ButtonRoundedWithLabel)`
	& svg {
		vertical-align: middle;
	}
	:hover {
		background-color: ${theme.base.colors.backgroundColorFocused};
	}
	height: 20px;
`;

// min-height required here to display scrollbar in Firefox:
// https://stackoverflow.com/questions/28636832/firefox-overflow-y-not-working-with-nested-flexbox
const BaseFrontContentContainer = styled.div`
	height: 100%;
	min-height: 0;
	/* Min-width is set to allow content within this container to shrink completely */
	min-width: 0;
`;

const FrontContentContainer = styled(BaseFrontContentContainer)`
	width: 100%;
`;

const FrontDetailContainer = styled(BaseFrontContentContainer)`
	/* We don't want to shrink our overview or form any smaller than the containing content */
	flex-shrink: 0;
`;

const ButtonInSectionContentMetaContainer = styled(Button)`
	padding: 0px 5px;
	font-family: TS3TextSans;
	font-size: 12px;
	font-weight: bold;
	height: 20px;
`;

interface FrontPropsBeforeState {
	id: string;
	browsingStage: CardSets;
	priority?: keyof Priorities;
}

type FrontProps = FrontPropsBeforeState & {
	selectCard: (
		cardId: string,
		collectionId: string,
		frontId: string,
		isSupporting: boolean,
	) => void;
	handleArticleFocus: (groupId: string, card: TCard, frontId: string) => void;
	toggleOverview: (open: boolean) => void;
	overviewIsOpen: boolean;
	editorOpenAllCollectionsForFront: typeof editorOpenAllCollectionsForFront;
	editorCloseAllCollectionsForFront: typeof editorCloseAllCollectionsForFront;
	isFeast: boolean;
	addFrontCollection: (frontId: string) => void;
};

interface FrontState {
	error: string | void;
	currentlyScrolledCollectionId: string | undefined;
}

class FrontContainer extends React.Component<FrontProps, FrontState> {
	public state = {
		error: undefined,
		currentlyScrolledCollectionId: undefined,
	};

	public handleError = (error: string) => {
		this.setState({
			error,
		});
	};

	public render() {
		const { overviewIsOpen, id, browsingStage, priority, isFeast } = this.props;
		return (
			<React.Fragment>
				<div
					style={{
						background: theme.base.colors.backgroundColorLight,
						display: this.state.error ? 'block' : 'none',
						padding: '1em',
						position: 'absolute',
						width: '100%',
					}}
				>
					{this.state.error || ''}
				</div>
				<FrontWrapper>
					<FrontContentContainer>
						<SectionContentMetaContainer>
							{priority === 'email' && (
								<DragToAddContainer>
									<DragToAddSnap />
								</DragToAddContainer>
							)}
							{isFeast && (
								<DragToAddContainer>
									<DragToAddFeastCollection />
								</DragToAddContainer>
							)}
							{isFeast && (
								<ButtonInSectionContentMetaContainer
									onClick={() => this.addFrontCollection()}
								>
									Add New Container
								</ButtonInSectionContentMetaContainer>
							)}
							<OverviewHeadingButton onClick={this.handleOpenCollections}>
								<ButtonLabel>Expand all&nbsp;</ButtonLabel>
								<DownCaretIcon fill={theme.base.colors.text} />
							</OverviewHeadingButton>
							<OverviewHeadingButton onClick={this.handleCloseCollections}>
								<ButtonLabel>Collapse all&nbsp;</ButtonLabel>
								<DownCaretIcon direction="up" fill={theme.base.colors.text} />
							</OverviewHeadingButton>
							{!overviewIsOpen && this.overviewToggle(overviewIsOpen)}
						</SectionContentMetaContainer>
						<FrontContent
							id={id}
							browsingStage={browsingStage}
							handleArticleFocus={this.handleArticleFocus}
							onChangeCurrentCollectionId={this.handleChangeCurrentCollectionId}
						/>
					</FrontContentContainer>
					{overviewIsOpen && (
						<FrontDetailContainer>
							{this.overviewToggle(overviewIsOpen)}
							<FrontCollectionsOverview
								id={this.props.id}
								browsingStage={this.props.browsingStage}
								currentCollection={this.state.currentlyScrolledCollectionId}
							/>
						</FrontDetailContainer>
					)}
				</FrontWrapper>
			</React.Fragment>
		);
	}

	private overviewToggle = (overviewIsOpen: boolean) => {
		const overviewToggleId = `btn-overview-toggle-${this.props.id}`;

		return (
			<>
				<OverviewToggleContainer
					onClick={() => this.props.toggleOverview(!this.props.overviewIsOpen)}
					active={this.props.overviewIsOpen}
				>
					<OverviewHeading htmlFor={overviewToggleId}>
						{overviewIsOpen ? 'Hide overview' : 'Overview'}
					</OverviewHeading>
					<ButtonCircularCaret
						id={overviewToggleId}
						style={{
							margin: '0',
						}}
						openDir="right"
						active={this.props.overviewIsOpen}
						preActive={false}
						small={true}
					/>
				</OverviewToggleContainer>
			</>
		);
	};

	private handleOpenCollections = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.editorOpenAllCollectionsForFront(
			this.props.id,
			this.props.browsingStage,
		);
	};

	private handleCloseCollections = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.editorCloseAllCollectionsForFront(this.props.id);
	};

	private handleChangeCurrentCollectionId = (id: string) => {
		this.setState({ currentlyScrolledCollectionId: id });
	};

	private handleArticleFocus = (
		e: React.FocusEvent<HTMLDivElement>,
		groupId: string,
		card: TCard,
		frontId: string,
	) => {
		this.props.handleArticleFocus(groupId, card, frontId);
		e.stopPropagation();
	};

	private addFrontCollection = () => {
		this.props.addFrontCollection(this.props.id);
	};
}

const mapStateToProps = (state: State, { id }: FrontPropsBeforeState) => {
	return {
		overviewIsOpen: selectIsFrontOverviewOpen(state, id),
		priority: selectPriority(state),
		isFeast: editionsIssueSelectors.selectAll(state)?.platform === 'feast',
	};
};

const mapDispatchToProps = (
	dispatch: Dispatch,
	{ id, browsingStage }: FrontPropsBeforeState,
) => {
	return {
		initialiseFront: () =>
			dispatch(initialiseCollectionsForFront(id, browsingStage)),
		addFrontCollection: (id: string) => dispatch(addFrontCollection(id)),
		handleArticleFocus: (groupId: string, card: TCard, frontId: string) =>
			dispatch(
				setFocusState({
					type: 'collectionArticle',
					groupId,
					card,
					frontId,
				}),
			),
		toggleOverview: (open: boolean) =>
			dispatch(open ? editorOpenOverview(id) : editorCloseOverview(id)),
		...bindActionCreators(
			{
				selectCard: editorSelectCard,
				editorOpenAllCollectionsForFront,
				editorCloseAllCollectionsForFront,
			},
			dispatch,
		),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(FrontContainer);
