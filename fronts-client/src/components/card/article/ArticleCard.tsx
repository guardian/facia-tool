import React from 'react';
import { styled } from 'constants/theme';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

import {
	createSelectArticleFromCard,
	createSelectLiveCardForGivenCardId,
	selectCard,
} from '../../../selectors/shared';
import { selectors } from 'bundles/externalArticlesBundle';
import type { State } from 'types/State';
import { DerivedArticle } from '../../../types/Article';
import CardBody from '../CardBody';
import CardContainer from '../CardContainer';
import CardMetaHeading from '../CardMetaHeading';
import ArticleBody from './ArticleBody';
import {
	CardSizes,
	OtherCollectionsOnSameFrontThisCardIsOn,
} from 'types/Collection';
import DragIntentContainer from '../../DragIntentContainer';
import { selectFeatureValue } from 'selectors/featureSwitchesSelectors';
import { theme } from 'constants/theme';
import { getPillarColor } from 'util/getPillarColor';
import { dragEventHasImageData } from 'util/validateImageSrc';
import { Criteria } from 'types/Grid';
import { getMainMediaVideoAtom } from '../../../util/externalArticle';
import { intendedAudienceFromTags } from 'lib/capi/IntendedAudience';
import { hasActiveAbTestOnCard } from '../../../util/abTests';

const ArticleBodyContainer = styled(CardBody)<{
	pillarId: string | undefined;
	isLive: boolean;
}>`
	position: relative;
	justify-content: space-between;
	border-top-color: ${({ size, pillarId, isLive }) =>
		size === 'default' && pillarId && isLive
			? getPillarColor(pillarId, isLive)
			: theme.base.colors.borderColor};

	:hover {
		${CardMetaHeading} {
			color: ${theme.base.colors.textMuted};
		}
	}
	height: 100%;
`;

interface ArticleComponentProps {
	id: string;
	draggable?: boolean;
	fade?: boolean;
	onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
	onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
	onDrop?: (d: React.DragEvent<HTMLElement>) => void;
	onDelete?: () => void;
	onClick?: () => void;
	onAddToClipboard?: () => void;
	isUneditable?: boolean;
	showMeta?: boolean;
	canDragImage?: boolean;
	canShowPageViewData: boolean;
	featureFlagPageViewData?: boolean;
	frontId: string;
	collectionId?: string;
	imageCriteria?: Criteria;
	collectionType?: string;
	groupIndex?: number;
	otherCollectionsOnSameFrontThisCardIsOn?: OtherCollectionsOnSameFrontThisCardIsOn;
	hasLiveAbTest?: boolean;
	headlineABTestingIsEnabled?: boolean;
}

interface ComponentProps extends ArticleComponentProps {
	article?: DerivedArticle;
	isLoading?: boolean;
	size?: CardSizes;
	textSize?: CardSizes;
	children: React.ReactNode;
	onImageDrop?: (e: React.DragEvent<HTMLElement>) => void;
}

interface ComponentState {
	isDraggingImageOver: boolean;
}

interface DerivedArticleFields {
	mainMediaVideoAtom: ReturnType<typeof getMainMediaVideoAtom>;
	intendedAudience: ReturnType<typeof intendedAudienceFromTags>;
}

class ArticleCard extends React.Component<ComponentProps, ComponentState> {
	public state = {
		isDraggingImageOver: false,
	};

	// Cache values derived from `article` so their references stay stable while
	// `article` is unchanged. Without this, `intendedAudienceFromTags` (and the
	// atom lookup) produced fresh objects every render, defeating the
	// React.memo on ArticleBody and forcing it to re-render needlessly.
	private derivedArticleRef?: DerivedArticle;
	private derivedArticleFields: DerivedArticleFields = {
		mainMediaVideoAtom: undefined,
		intendedAudience: undefined,
	};

	private getDerivedArticleFields = (
		article?: DerivedArticle,
	): DerivedArticleFields => {
		if (this.derivedArticleRef !== article) {
			this.derivedArticleRef = article;
			this.derivedArticleFields = {
				mainMediaVideoAtom:
					article && article.hasMainVideo
						? getMainMediaVideoAtom(article)
						: undefined,
				intendedAudience:
					article && article.tags
						? intendedAudienceFromTags(article.tags)
						: undefined,
			};
		}
		return this.derivedArticleFields;
	};

	public setIsImageHovering = (isDraggingImageOver: boolean) =>
		this.setState({ isDraggingImageOver });

	public render() {
		const {
			id,
			isLoading,
			article,
			size = 'default',
			textSize = 'default',
			fade = false,
			draggable = false,
			onDragStart = noop,
			onDragOver = noop,
			onDrop = noop,
			onDelete = noop,
			onClick = noop,
			onAddToClipboard,
			children,
			isUneditable,
			onImageDrop,
			showMeta,
			canDragImage,
			featureFlagPageViewData,
			canShowPageViewData = false,
			frontId,
			collectionId,
			imageCriteria,
			collectionType,
			groupIndex,
			otherCollectionsOnSameFrontThisCardIsOn,
			hasLiveAbTest,
			headlineABTestingIsEnabled,
		} = this.props;

		const getArticleData = () =>
			article || {
				uuid: id,
				headline: !isLoading ? 'Content not found' : undefined,
			};

		const { mainMediaVideoAtom, intendedAudience } =
			this.getDerivedArticleFields(article);

		return (
			<>
				<CardContainer
					draggable={draggable}
					onDragStart={onDragStart}
					onDragOver={onDragOver}
					onDrop={onDrop}
					onClick={(e: React.MouseEvent) => {
						if (isLoading || !article) {
							return;
						}
						e.stopPropagation();
						onClick();
					}}
				>
					<DragIntentContainer
						active={!!onImageDrop}
						filterRegisterEvent={dragEventHasImageData}
						onDragIntentStart={() => this.setIsImageHovering(true)}
						onDragIntentEnd={() => this.setIsImageHovering(false)}
						onDrop={(e) => {
							if (dragEventHasImageData(e) && onImageDrop) {
								onImageDrop(e);
							}
						}}
					>
						<ArticleBodyContainer
							data-testid="article-body"
							size={size}
							fade={fade}
							pillarId={article && article.pillarId}
							isLive={!!article && article.isLive}
						>
							<ArticleBody
								{...getArticleData()}
								frontId={frontId}
								collectionId={collectionId}
								size={size}
								textSize={textSize}
								isUneditable={!!article && isUneditable}
								onDelete={onDelete}
								onAddToClipboard={onAddToClipboard}
								displayPlaceholders={isLoading}
								showMeta={showMeta}
								canDragImage={canDragImage}
								isDraggingImageOver={this.state.isDraggingImageOver}
								featureFlagPageViewData={featureFlagPageViewData}
								canShowPageViewData={canShowPageViewData}
								imageCriteria={imageCriteria}
								collectionType={collectionType}
								groupIndex={groupIndex}
								// Needs to be passed explicitly as not stored on the Redux form
								mainMediaVideoAtom={
									!!article && article.hasMainVideo
										? mainMediaVideoAtom
										: undefined
								}
								otherCollectionsOnSameFrontThisCardIsOn={
									otherCollectionsOnSameFrontThisCardIsOn
								}
								intendedAudience={intendedAudience}
								hasLiveAbTest={hasLiveAbTest}
								headlineABTestingIsEnabled={headlineABTestingIsEnabled}
							/>
						</ArticleBodyContainer>
					</DragIntentContainer>
				</CardContainer>
				{children}
			</>
		);
	}
}

const createMapStateToProps = () => {
	const selectArticle = createSelectArticleFromCard();
	const selectLiveCardForGivenCardId = createSelectLiveCardForGivenCardId();

	return (
		state: State,
		props: ArticleComponentProps,
	): {
		article?: DerivedArticle;
		isLoading: boolean;
		featureFlagPageViewData: boolean;
		hasLiveAbTest?: boolean;
		headlineABTestingIsEnabled: boolean;
	} => {
		const article = selectArticle(state, props.id);
		const card = selectCard(state, props.id);
		const getState = (s: any) => s;
		const liveCard = selectLiveCardForGivenCardId(
			state,
			card.id,
			props.collectionId,
		);
		const hasLiveAbTest = hasActiveAbTestOnCard(liveCard);

		return {
			article,
			isLoading: selectors.selectIsLoadingInitialDataById(state, card.id),
			featureFlagPageViewData: selectFeatureValue(
				getState(state),
				'page-view-data-visualisation',
			),
			hasLiveAbTest: hasLiveAbTest,
			headlineABTestingIsEnabled: selectFeatureValue(
				state,
				'headline-ab-testing',
			),
		};
	};
};

export { ArticleComponentProps, ArticleCard };

export default connect(createMapStateToProps)(ArticleCard);
