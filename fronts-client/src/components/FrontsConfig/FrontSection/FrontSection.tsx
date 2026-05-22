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
import { FrontConfig } from 'types/FaciaApi';
import type { State } from 'types/State';
import SectionHeader from '../../layout/SectionHeader';
import SectionContent from '../../layout/SectionContent';
import { CardSets, Collection, Stages } from 'types/Collection';
import { toTitleCase } from 'util/stringUtils';
import { RadioButton, RadioGroup } from 'components/inputs/RadioButtons';
import {
	PreviewEyeIcon,
	ClearIcon,
	GuardianRoundel,
} from 'components/icons/Icons';
import { createFrontId } from 'util/editUtils';
import EditModeVisibility from 'components/util/EditModeVisibility';
import FrontsContainer from '../FrontContainer';
import { selectShouldUseCODELinks } from '../../../selectors/configSelectors';
import './front-section.css';
import { selectFront } from 'selectors/shared';

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

const Link = styled.a`
	text-decoration: none;
`;

const LinkButtons = styled.div`
	display: flex;
	gap: 10px;
`;

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
	padding: 0 15px;
	gap: 8px;
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
	};
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
		const { frontId, isOverviewOpen, shouldUseCODELinks } = this.props;
		const title = this.getTitle();

		return (
			<SingleFrontContainer
				key={frontId}
				id={createFrontId(frontId)}
				isOverviewOpen={isOverviewOpen}
			>
				<FrontContainer>
					<FrontHeader greyHeader={true} className="front-header">
						<FrontsHeaderText title={title} data-testid="front-name">
							{title}
						</FrontsHeaderText>
						<FrontHeaderMeta>
							<EditModeVisibility visibleMode="fronts">
								<LinkButtons>
									<Link
										href={`${
											shouldUseCODELinks
												? urls.previewUrlCODE
												: urls.previewUrlPROD
										}${this.props.frontId}`}
										target="preview"
									>
										<FrontHeaderButton>
											<PreviewEyeIcon size="xl" />
											<LinkButtonText className="visible-based-on-front-header-width">
												Preview
											</LinkButtonText>
										</FrontHeaderButton>
									</Link>
									<Link
										href={`${
											shouldUseCODELinks ? urls.liveUrlCODE : urls.liveUrlPROD
										}${this.props.frontId}`}
										target="live"
									>
										<FrontHeaderButton priority="transparent">
											<GuardianRoundel size="xl" />
											<LinkButtonText className="visible-based-on-front-header-width">
												See live
											</LinkButtonText>
										</FrontHeaderButton>
									</Link>
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

		// Some fronts are missing a title, and are named by their id. This makes them more legible to editorial staff.
		return startCase(name);
	};
}

const createMapStateToProps = () => {
	return (state: State, { frontId }: FrontsContainerProps) => ({
		selectedFront: selectFront(state, { frontId }),
		isOverviewOpen: selectIsFrontOverviewOpen(state, frontId),
		shouldUseCODELinks: selectShouldUseCODELinks(state),
	});
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	frontsActions: {
		fetchLastPressed: (id: string) => dispatch(fetchLastPressed(id)),
		updateCollection: (collection: Collection) =>
			dispatch(updateCollection(collection, 'overwrite')),
		editorCloseFront: (id: string) => dispatch(editorCloseFront(id)),
		changeBrowsingStage: (id: string, browsingStage: Stages) =>
			dispatch(changedBrowsingStage(id, browsingStage)),
	},
});

export { FrontSection };
export { FrontsComponentProps };

export default connect(createMapStateToProps, mapDispatchToProps)(FrontSection);
