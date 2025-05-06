import React from 'react';
import { styled } from 'constants/theme';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

import {
	createSelectArticleFromCard,
	selectCard,
} from '../../../selectors/shared';
import { selectors } from 'bundles/externalArticlesBundle';
import type { State } from 'types/State';
import { DerivedArticle } from '../../../types/Article';
import CardBody from '../CardBody';
import CardContainer from '../CardContainer';
import CardMetaHeading from '../CardMetaHeading';
import ArticleBody from './ArticleBody';
import { CardSizes } from 'types/Collection';
import DragIntentContainer from '../../DragIntentContainer';
import { selectFeatureValue } from 'selectors/featureSwitchesSelectors';
import { theme } from 'constants/theme';
import { getPillarColor } from 'util/getPillarColor';
import { dragEventHasImageData } from 'util/validateImageSrc';
import { Criteria } from 'types/Grid';

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

class ArticleCard extends React.Component<ComponentProps, ComponentState> {
	public state = {
		isDraggingImageOver: false,
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
		} = this.props;

		const getArticleData = () =>
			article || {
				uuid: id,
				headline: !isLoading ? 'Content not found' : undefined,
			};

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
	return (
		state: State,
		props: ArticleComponentProps,
	): {
		article?: DerivedArticle;
		isLoading: boolean;
		featureFlagPageViewData: boolean;
	} => {
		const article = selectArticle(state, props.id);
		const card = selectCard(state, props.id);
		const getState = (s: any) => s;

		return {
			article,
			isLoading: selectors.selectIsLoadingInitialDataById(state, card.id),
			featureFlagPageViewData: selectFeatureValue(
				getState(state),
				'page-view-data-visualisation',
			),
		};
	};
};

export { ArticleComponentProps, ArticleCard };

export default connect(createMapStateToProps)(ArticleCard);
