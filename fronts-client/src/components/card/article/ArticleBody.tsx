import React from 'react';
import { styled, theme } from 'constants/theme';
import startCase from 'lodash/startCase';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import CardHeading from '../CardHeading';
import BasePlaceholder from '../../BasePlaceholder';
import { getPillarColor } from 'util/getPillarColor';
import CardMetaContainer from '../CardMetaContainer';
import CardContent from '../CardContent';
import { notLiveLabels, liveBlogTones } from 'constants/fronts';
import TextPlaceholder from 'components/TextPlaceholder';
import { ThumbnailSmall, ThumbnailCutout } from 'components/image/Thumbnail';
import CardMetaHeading from '../CardMetaHeading';
import { HoverActionsButtonWrapper } from '../../inputs/HoverActionButtonWrapper';
import {
	HoverViewButton,
	HoverOphanButton,
	HoverDeleteButton,
	HoverAddToClipboardButton,
} from '../../inputs/HoverActionButtons';
import { HoverActionsAreaOverlay } from '../../CollectionHoverItems';
import { CardSizes } from 'types/Collection';
import CardMetaContent from '../CardMetaContent';
import CardDraftMetaContent from '../CardDraftMetaContent';
import DraggableArticleImageContainer from './DraggableArticleImageContainer';
import { media } from 'util/mediaQueries';
import ArticleGraph from './ArticleGraph';
import { VideoIcon } from '../../icons/Icons';
import CardHeadingContainer from '../CardHeadingContainer';
import CardSettingsDisplay from '../CardSettingsDisplay';
import CircularIconContainer from '../../icons/CircularIconContainer';
import { ImageMetadataContainer } from 'components/image/ImageMetaDataContainer';
import EditModeVisibility from 'components/util/EditModeVisibility';
import PageViewDataWrapper from '../../PageViewDataWrapper';
import ImageAndGraphWrapper from 'components/image/ImageAndGraphWrapper';
import { getPaths } from 'util/paths';
import { getMaybeDimensionsFromWidthAndHeight } from 'util/validateImageSrc';
import { Criteria } from 'types/Grid';
import {
	landscape5To4CardImageCriteria,
	squareImageCriteria,
} from 'constants/image';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
	flex-shrink: 0;
	width: 83px;
	height: 50px;
`;

const NotLiveContainer = styled(CardMetaHeading)`
	color: ${theme.base.colors.highlightColor};
`;

const KickerHeading = styled(CardHeading)<{ pillarId?: string }>`
	font-family: TS3TextSans;
	font-weight: bold;
	font-size: ${({ displaySize }) =>
		displaySize === 'small'
			? theme.card.fontSizeSmall
			: theme.card.fontSizeDefault};
	${media.large`font-size: 13px;`}
	color: ${({ pillarId }) => getPillarColor(pillarId, true)};
`;

const ArticleBodyByline = styled.div`
	font-family: TS3TextSans;
	font-weight: bold;
	font-size: ${theme.card.fontSizeDefault};
	font-style: italic;
	padding-top: 5px;
`;

const FirstPublicationDate = styled(CardMetaContent)`
	color: ${theme.colors.green};
`;

const Tone = styled.span`
	font-weight: normal;
`;

const VideoIconContainer = styled(CircularIconContainer)`
	position: absolute;
	bottom: 2px;
	right: 2px;
`;

const ClipboardFirstPublished = styled.div`
	font-size: 11px;
	margin: 4px 4px;
	position: absolute;
	bottom: 0;
	right: 0;
`;

interface ArticleBodyProps {
	newspaperPageNumber?: number;

	promotionMetric?: number;

	newspaperEditionDate?: string;
	firstPublicationDate?: string;
	frontPublicationDate?: number;
	scheduledPublicationDate?: string;
	pillarId?: string;
	kicker?: string;
	size?: CardSizes;
	textSize?: CardSizes;
	headline?: string;
	thumbnail?: string | void;
	cutoutThumbnail?: string | void;
	isLive?: boolean;
	urlPath?: string;
	sectionName?: string;
	displayPlaceholders?: boolean;
	uuid: string;
	onDelete?: () => void;
	onAddToClipboard?: () => void;
	isUneditable?: boolean;
	byline?: string;
	showByline?: boolean;
	showQuotedHeadline?: boolean;
	imageHide?: boolean;
	imageSlideshowReplace?: boolean;
	imageReplace?: boolean;
	imageCutoutReplace?: boolean;
	isBreaking?: boolean;
	type?: string;
	showLargeHeadline?: boolean;
	showMeta?: boolean;
	canDragImage?: boolean;
	isDraggingImageOver: boolean;
	isBoosted?: boolean;
	boostLevel?: string;
	hasMainVideo?: boolean;
	showMainVideo?: boolean;
	tone?: string | undefined;
	featureFlagPageViewData?: boolean;
	canShowPageViewData: boolean;
	frontId: string;
	collectionId?: string;
	imageSrcWidth?: string;
	imageSrcHeight?: string;
	imageCriteria?: Criteria;
	collectionType?: string;
}

const articleBodyDefault = React.memo(
	({
		firstPublicationDate,
		frontPublicationDate,
		scheduledPublicationDate,
		sectionName,
		pillarId,
		kicker,
		size = 'default',
		textSize,
		headline,
		thumbnail,
		cutoutThumbnail,
		isLive,
		urlPath,
		displayPlaceholders,
		onDelete,
		onAddToClipboard,
		isUneditable,
		byline,
		showByline,
		showQuotedHeadline,
		imageHide,
		imageSlideshowReplace,
		imageReplace,
		imageCutoutReplace,
		isBreaking,
		type,
		uuid,
		showLargeHeadline,
		showMeta = true,
		canDragImage = true,
		isDraggingImageOver,
		isBoosted,
		boostLevel,
		tone,
		featureFlagPageViewData,
		canShowPageViewData,
		hasMainVideo,
		showMainVideo,
		frontId,
		collectionId,
		newspaperPageNumber,
		promotionMetric,
		imageSrcWidth,
		imageSrcHeight,
		imageCriteria,
		collectionType,
	}: ArticleBodyProps) => {
		const displayByline = size === 'default' && showByline && byline;
		const now = Date.now();
		const paths = urlPath ? getPaths(urlPath) : undefined;

		const thumbnailDims = getMaybeDimensionsFromWidthAndHeight(
			imageSrcWidth,
			imageSrcHeight,
		);
		const thumbnailIsPortrait =
			!!imageReplace &&
			thumbnailDims &&
			thumbnailDims.height > thumbnailDims.width;
		const showThumbnailInLandscape54 =
			imageCriteria &&
			imageCriteria.widthAspectRatio ===
				landscape5To4CardImageCriteria.widthAspectRatio &&
			imageCriteria.heightAspectRatio ===
				landscape5To4CardImageCriteria.heightAspectRatio;
		const showSquareThumbnail =
			imageCriteria &&
			imageCriteria.widthAspectRatio === squareImageCriteria.widthAspectRatio &&
			imageCriteria.heightAspectRatio === squareImageCriteria.heightAspectRatio;

		return (
			<>
				{showMeta && (
					<CardMetaContainer size={size}>
						{displayPlaceholders && (
							<>
								<TextPlaceholder data-testid="loading-placeholder" />
								{size !== 'small' && <TextPlaceholder width={25} />}
							</>
						)}
						{!displayPlaceholders && size !== 'small' && isLive && (
							<CardMetaHeading
								style={{
									color: getPillarColor(
										pillarId,
										isLive,
										tone === liveBlogTones.dead,
									),
								}}
							>
								{startCase(sectionName)}
								<Tone> / {startCase(tone)}</Tone>
							</CardMetaHeading>
						)}
						{type === 'liveblog' && <CardMetaContent>Liveblog</CardMetaContent>}
						{!isLive && !displayPlaceholders && (
							<NotLiveContainer>
								{firstPublicationDate
									? notLiveLabels.takenDown
									: notLiveLabels.draft}
							</NotLiveContainer>
						)}
						{!!scheduledPublicationDate && !firstPublicationDate && (
							<CardDraftMetaContent title="The time until this article is scheduled to be published.">
								{distanceInWordsStrict(new Date(scheduledPublicationDate), now)}
							</CardDraftMetaContent>
						)}
						<EditModeVisibility visibleMode="editions">
							{!promotionMetric && !!newspaperPageNumber && (
								<CardMetaContent title="The newspaper page number of this article">
									Page {newspaperPageNumber}
								</CardMetaContent>
							)}
						</EditModeVisibility>
						<EditModeVisibility visibleMode="editions">
							{!!promotionMetric && (
								<CardMetaContent title="The newspaper page number of this article">
									Promotion {Math.floor(promotionMetric)}
								</CardMetaContent>
							)}
						</EditModeVisibility>
						{!!frontPublicationDate && (
							<CardMetaContent title="The time elapsed since this card was created in the tool.">
								{distanceInWordsStrict(now, new Date(frontPublicationDate))}
							</CardMetaContent>
						)}
						{!!firstPublicationDate && (
							<FirstPublicationDate title="The time elapsed since this article was first published.">
								{distanceInWordsStrict(new Date(firstPublicationDate), now)}
							</FirstPublicationDate>
						)}
					</CardMetaContainer>
				)}
				<CardContent displaySize={size} textSize={textSize}>
					<CardSettingsDisplay
						collectionType={collectionType}
						isBreaking={isBreaking}
						showByline={showByline}
						showQuotedHeadline={showQuotedHeadline}
						showLargeHeadline={showLargeHeadline}
						isBoosted={isBoosted}
						boostLevel={boostLevel}
					/>
					<CardHeadingContainer size={size}>
						{displayPlaceholders && (
							<>
								<TextPlaceholder />
								{size !== 'small' && <TextPlaceholder width={25} />}
							</>
						)}
						{kicker && (
							<KickerHeading
								displaySize={size}
								pillarId={pillarId}
								data-testid="kicker"
							>
								{`${kicker} `}
							</KickerHeading>
						)}
						<CardHeading html data-testid="headline" displaySize={size}>
							{headline}
						</CardHeading>
						{displayByline && <ArticleBodyByline>{byline}</ArticleBodyByline>}
					</CardHeadingContainer>
				</CardContent>
				<ImageAndGraphWrapper size={size}>
					{featureFlagPageViewData && canShowPageViewData && collectionId && (
						<PageViewDataWrapper data-testid="page-view-graph">
							<ArticleGraph
								articleId={uuid}
								collectionId={collectionId}
								frontId={frontId}
							/>
						</PageViewDataWrapper>
					)}

					{size !== 'small' &&
						(displayPlaceholders ? (
							<ThumbnailPlaceholder />
						) : (
							<DraggableArticleImageContainer id={uuid} canDrag={canDragImage}>
								<ThumbnailSmall
									imageHide={imageHide}
									url={thumbnail}
									isDraggingImageOver={isDraggingImageOver}
									isPortrait={thumbnailIsPortrait}
									showLandscape54={showThumbnailInLandscape54}
									showSquareThumbnail={showSquareThumbnail}
								>
									{cutoutThumbnail ? (
										<ThumbnailCutout src={cutoutThumbnail} />
									) : null}
									{hasMainVideo && (
										<VideoIconContainer title="This media has video content.">
											<VideoIcon />
										</VideoIconContainer>
									)}
								</ThumbnailSmall>
								<ImageMetadataContainer
									imageSlideshowReplace={imageSlideshowReplace}
									imageReplace={imageReplace}
									imageCutoutReplace={imageCutoutReplace}
									showMainVideo={showMainVideo}
								/>
								{!collectionId && firstPublicationDate && (
									<ClipboardFirstPublished title="The time elapsed since this article was first published.">
										{distanceInWordsStrict(
											Date.now(),
											new Date(firstPublicationDate),
										)}
									</ClipboardFirstPublished>
								)}
							</DraggableArticleImageContainer>
						))}
				</ImageAndGraphWrapper>
				<HoverActionsAreaOverlay disabled={isUneditable}>
					<HoverActionsButtonWrapper
						size={size}
						toolTipPosition={'top'}
						toolTipAlign={'right'}
						urlPath={urlPath}
						renderButtons={(props) => (
							<>
								{urlPath && (
									<HoverViewButton
										hoverText="View"
										href={isLive ? paths?.live : paths?.preview}
										{...props}
									/>
								)}
								{isLive && (
									<HoverOphanButton
										{...props}
										href={paths?.ophan}
										hoverText="Ophan"
									/>
								)}
								{onAddToClipboard && (
									<HoverAddToClipboardButton
										onAddToClipboard={onAddToClipboard}
										hoverText="Clipboard"
										{...props}
									/>
								)}
								{onDelete && (
									<HoverDeleteButton
										onDelete={onDelete}
										hoverText="Delete"
										{...props}
									/>
								)}
							</>
						)}
					/>
				</HoverActionsAreaOverlay>
			</>
		);
	},
);

export { ArticleBodyProps };

export default articleBodyDefault;
