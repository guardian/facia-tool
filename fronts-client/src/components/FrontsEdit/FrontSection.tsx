import React from 'react';
import { connect } from 'react-redux';
import startCase from 'lodash/startCase';
import { styled, theme } from 'constants/theme';
import { Dispatch } from 'types/Store';
import { fetchLastPressed } from 'actions/Fronts';
import { updateCollection } from 'actions/Collections';
import {
	editorCloseFront,
	selectIsFrontOverviewOpen,
	changedBrowsingStage,
} from 'bundles/frontsUI';
import Button from 'components/inputs/ButtonDefault';
import { frontStages } from 'constants/fronts';
import urls from 'constants/url';
import { FrontConfig, EditionsFrontMetadata } from 'types/FaciaApi';
import type { State } from 'types/State';
import { selectFront } from 'selectors/frontsSelectors';
import SectionHeader from '../layout/SectionHeader';
import SectionContent from '../layout/SectionContent';
import { CardSets, Collection, Stages } from 'types/Collection';
import { toTitleCase } from 'util/stringUtils';
import { RadioButton, RadioGroup } from 'components/inputs/RadioButtons';
import { PreviewEyeIcon, ClearIcon, LiveIcon } from 'components/icons/Icons';
import { createFrontId } from 'util/editUtils';
import EditModeVisibility from 'components/util/EditModeVisibility';
import { setFrontHiddenState, updateFrontMetadata } from 'actions/Editions';
import FrontsContainer from './FrontContainer';
import { isMode } from '../../selectors/pathSelectors';
import { selectShouldUseCODELinks } from '../../selectors/configSelectors';

const FrontHeader = styled(SectionHeader)`
	display: flex;
	border-right: 1px solid #767676;
`;

const FrontHeaderMeta = styled.div`
	display: flex;
	position: relative;
	margin-left: auto;
	font-family: TS3TextSans;
	font-size: 14px;
	white-space: nowrap;
`;

const FrontsHeaderText = styled.span`
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: ${theme.colors.blackDark};
`;

const FrontsHeaderInput = styled.input`
	font-size: 22px;
	font-family: GHGuardianHeadline;
	font-weight: bold;
	width: 20em;
`;

const LinkButtons = styled.div`
	display: flex;
	gap: 4px;
`

const StageSelectButtons = styled.div`
	color: ${theme.colors.blackDark};
	padding: 0px 15px;
`;

const SingleFrontContainer = styled.div<{
	isOverviewOpen: boolean;
}>`
	/**
   * We parameterise the min-width of the fronts container to handle the
   * presence of the form and overview content. When containers are at their
   * minimum widths and a form or overview is opened, we increase the min-width
   * of the front container proportionally to keep the collection container the
   * same width.
   */
	min-width: ${({ isOverviewOpen }) =>
		isOverviewOpen
			? theme.front.minWidth + theme.front.overviewMinWidth + 10
			: theme.front.minWidth}px;
	flex: 1 1;
	height: 100%;
`;

const FrontContainer = styled.div`
	height: 100%;
	transform: translate3d(0, 0, 0);
`;

const FrontSectionContent = styled(SectionContent)`
	padding-top: 0;
`;

const FrontHeaderButton = styled(Button).attrs({ size: 'l' })`
	color: #fff;
	padding: 0 5px;
	gap: 5px;
	display: flex;
	align-items: center;

	&:not(:last-child) {
		margin-right: 10px;
	}
`;

const LinkButtonText = styled.span`
	text-decoration: none;
`;
interface FrontsContainerProps {
	frontId: string;
}

type FrontsComponentProps = FrontsContainerProps & {
	selectedFront: FrontConfig;
	isOverviewOpen: boolean;
	shouldUseCODELinks: boolean;
	frontsActions: {
		fetchLastPressed: (frontId: string) => void;
		editorCloseFront: (frontId: string) => void;
		updateCollection: (collection: Collection) => void;
		changeBrowsingStage: (frontId: string, browsingState: Stages) => void;
		updateFrontMetadata: (
			frontId: string,
			metadata: EditionsFrontMetadata,
		) => void;
		setFrontHiddenState: (id: string, hidden: boolean) => void;
	};
	isEditions: boolean;
};

interface ComponentState {
	collectionSet: CardSets;
	frontNameValue: string;
	editingFrontName: boolean;
}

class FrontSection extends React.Component<
	FrontsComponentProps,
	ComponentState
> {
	public state = {
		collectionSet: frontStages.draft,
		frontNameValue: '',
		editingFrontName: false,
	};

	public handleCollectionSetSelect(key: string) {
		const browsingStage = frontStages[key];
		this.setState({
			collectionSet: browsingStage,
		});
		this.props.frontsActions.changeBrowsingStage(
			this.props.frontId,
			browsingStage,
		);
	}

	public handleRemoveFront = () => {
		this.props.frontsActions.editorCloseFront(this.props.frontId);
	};

	public render() {
		const { frontId, isOverviewOpen, isEditions, shouldUseCODELinks } =
			this.props;
		const title = this.getTitle();

		const { frontNameValue, editingFrontName } = this.state;
		const isSpecial = this.props.selectedFront
			? this.props.selectedFront.isSpecial
			: false;

		const isHidden = this.props.selectedFront
			? this.props.selectedFront.isHidden
			: false;

		return (
			<SingleFrontContainer
				key={frontId}
				id={createFrontId(frontId)}
				isOverviewOpen={isOverviewOpen}
			>
				<FrontContainer>
					<FrontHeader greyHeader={true}>
						{editingFrontName ? (
							<FrontsHeaderInput
								data-testid="rename-front-input"
								value={frontNameValue}
								autoFocus
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									this.setState({ frontNameValue: e.target.value })
								}
								onKeyDown={(e: React.KeyboardEvent) => {
									if (e.key === 'Enter') {
										this.setName();
									}
								}}
								onBlur={this.setName}
							/>
						) : (
							<FrontsHeaderText title={title} data-testid="front-name">
								{title}
							</FrontsHeaderText>
						)}
						<FrontHeaderMeta>
							<EditModeVisibility visibleMode="fronts">
								<LinkButtons>
									<a
										href={`${
											shouldUseCODELinks
												? urls.previewUrlCODE
												: urls.previewUrlPROD
										}${this.props.frontId}`}
										target="preview"
									>
										<FrontHeaderButton>
											<PreviewEyeIcon size="xl" />
											<LinkButtonText>Preview</LinkButtonText>
										</FrontHeaderButton>
									</a>
									<a
										href={`${
											shouldUseCODELinks
												? urls.liveUrlCODE
												: urls.liveUrlPROD
										}${this.props.frontId}`}
										target="live"
									>
										<FrontHeaderButton>
											<LiveIcon size="l" />
											<LinkButtonText>See live</LinkButtonText>
										</FrontHeaderButton>
									</a>
								</LinkButtons>
								<StageSelectButtons>
									<RadioGroup>
										{Object.keys(frontStages).map((key) => (
											<RadioButton
												inline
												key={key}
												name={`${this.props.frontId} - frontStages`}
												checked={frontStages[key] === this.state.collectionSet}
												onChange={() => this.handleCollectionSetSelect(key)}
												label={toTitleCase(frontStages[key])}
											/>
										))}
									</RadioGroup>
								</StageSelectButtons>
							</EditModeVisibility>
							{isSpecial && (
								<>
									<FrontHeaderButton
										data-testid="toggle-hidden-front-button"
										onClick={() => this.setFrontHiddenState(!isHidden)}
									>
										{isHidden ? 'Unhide' : 'Hide'}
									</FrontHeaderButton>
								</>
							)}
							{isEditions && (
								<FrontHeaderButton
									data-testid="rename-front-button"
									onClick={this.renameFront}
								>
									Rename
								</FrontHeaderButton>
							)}
							<FrontHeaderButton onClick={this.handleRemoveFront}>
								<ClearIcon size="xl" />
							</FrontHeaderButton>
						</FrontHeaderMeta>
					</FrontHeader>
					<FrontSectionContent direction="column">
						{this.props.selectedFront && (
							<FrontsContainer
								id={this.props.frontId}
								browsingStage={this.state.collectionSet}
							/>
						)}
					</FrontSectionContent>
				</FrontContainer>
			</SingleFrontContainer>
		);
	}

	private renameFront = () => {
		this.setState({
			frontNameValue: this.getTitle() || '',
			editingFrontName: true,
		});
	};

	private setFrontHiddenState = (hidden: boolean) => {
		this.props.frontsActions.setFrontHiddenState(
			this.props.selectedFront.id,
			hidden,
		);
	};

	// private addFrontCollection = () => {
	//   this.props.frontsActions.addFrontCollection(this.props.selectedFront.id);
	// };

	private getTitle = () => {
		const { selectedFront } = this.props;

		if (!selectedFront) {
			return;
		}

		const nameOverride = selectedFront.metadata?.nameOverride;
		if (nameOverride) {
			return nameOverride;
		}

		const name =
			this.props.selectedFront.displayName || this.props.selectedFront.id;
		return this.props.isEditions
			? name
			: // Some fronts are missing a title, and are named by their id. This makes them more legible to editorial staff.
				startCase(name);
	};

	private setName = () => {
		const metadata =
			this.state.frontNameValue !== ''
				? {
						...this.props.selectedFront.metadata,
						nameOverride: this.state.frontNameValue,
					}
				: {
						...this.props.selectedFront.metadata,
						nameOverride: undefined,
					};

		this.props.frontsActions.updateFrontMetadata(
			this.props.selectedFront.id,
			metadata,
		);

		this.setState({ editingFrontName: false });
	};
}

const createMapStateToProps = () => {
	return (state: State, { frontId }: FrontsContainerProps) => ({
		selectedFront: selectFront(state, { frontId }),
		isOverviewOpen: selectIsFrontOverviewOpen(state, frontId),
		isEditions: isMode(state, 'editions'),
		shouldUseCODELinks: selectShouldUseCODELinks(state),
	});
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	frontsActions: {
		fetchLastPressed: (id: string) => dispatch(fetchLastPressed(id)),
		updateCollection: (collection: Collection) =>
			dispatch(updateCollection(collection)),
		editorCloseFront: (id: string) => dispatch(editorCloseFront(id)),
		changeBrowsingStage: (id: string, browsingStage: Stages) =>
			dispatch(changedBrowsingStage(id, browsingStage)),
		updateFrontMetadata: (id: string, metadata: EditionsFrontMetadata) =>
			dispatch(updateFrontMetadata(id, metadata)),
		setFrontHiddenState: (id: string, hidden: boolean) =>
			dispatch(setFrontHiddenState(id, hidden)),
	},
});

export { FrontSection };
export { FrontsComponentProps };

export default connect(createMapStateToProps, mapDispatchToProps)(FrontSection);
