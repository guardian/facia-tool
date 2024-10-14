import React from 'react';
import { styled, theme } from 'constants/theme';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';

import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { notLiveColour } from 'util/getPillarColor';
import { HoverActionsAreaOverlay } from 'components/CollectionHoverItems';
import { HoverActionsButtonWrapper } from 'components/inputs/HoverActionButtonWrapper';
import {
	HoverViewButton,
	HoverOphanButton,
	HoverAddToClipboardButton,
} from 'components/inputs/HoverActionButtons';
import noop from 'lodash/noop';
import { ThumbnailSmall } from 'components/image/Thumbnail';
import { DraggingArticleComponent } from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import { media } from 'util/mediaQueries';
import { VideoIcon } from 'components/icons/Icons';
import CircularIconContainer from 'components/icons/CircularIconContainer';
import RefreshPeriodically from '../util/RefreshPeriodically';
import { collectionArticlesPollInterval } from 'constants/polling';
import RenderOffscreen from 'components/util/RenderOffscreen';
import { getPaths } from 'util/paths';
import { CardTypes, CardTypesMap } from 'constants/cardTypes';

const Container = styled.div`
	display: flex;
	position: relative;
	border-top: ${`1px solid ${theme.capiInterface.borderLight}`};
	color: ${theme.capiInterface.feedItemText};
	display: flex;
	font-weight: normal;
	padding-bottom: 20px;
	cursor: pointer;

	${HoverActionsAreaOverlay} {
		bottom: 5px;
		position: absolute;
		visibility: hidden;
	}

	:hover ${HoverActionsAreaOverlay} {
		visibility: visible;
	}
`;

const Byline = styled.h2`
	margin: 2px 0 0;
	vertical-align: top;
	font-family: TS3TextSans;
	font-size: ${theme.card.fontSizeDefault};
	${media.large`font-size: 13px;`}
	font-weight: bold;
`;

const Title = styled.h2`
	margin: 2px 2px 0 0;
	vertical-align: top;
	font-family: TS3TextSans;
	font-size: ${theme.card.fontSizeDefault};
	${media.large`font-size: 13px;`}
	font-weight: normal;
`;

const FeedItemContainer = styled.a<{ blur?: boolean }>`
	text-decoration: none;
	display: flex;
	color: inherit;
	width: 100%;
	height: 100%;
	:visited ${Title} {
		color: ${theme.capiInterface.textVisited};
	}
	${({ blur }) => blur && 'filter: blur(10px);'}
`;

const MetaContainer = styled.div`
	position: relative;
	width: 80px;
	${media.large`width: 60px;`};
	flex-shrink: 0;
	padding: 0px 2px;
	word-break: word;
	hyphens: auto;
`;

const ArticleThumbnail = styled(ThumbnailSmall)`
	margin-left: auto;
`;

const FirstPublished = styled.div`
	font-size: 11px;
	margin: 2px 0;
`;

const ScheduledPublication = styled(FirstPublished)`
	color: ${notLiveColour};
`;

const Body = styled.div`
	padding-left: 8px;
`;

const VideoIconContainer = styled(CircularIconContainer)`
	position: absolute;
	bottom: 2px;
	right: 2px;
`;

interface FeedItemProps {
	id: string;
	type: CardTypes;
	title: string;
	liveUrl?: string;
	metaContent?: JSX.Element;
	scheduledPublicationDate?: string;
	firstPublishedDate?: string;
	thumbnail?: string;
	hasVideo: boolean;
	isLive: boolean;
	onAddToClipboard: () => void;
	handleDragStart: (
		event: React.DragEvent<HTMLDivElement>,
		dragNode: HTMLDivElement,
	) => void;
	shouldObscureFeed?: boolean;
	byline?: string;
}

export class FeedItem extends React.Component<FeedItemProps, {}> {
	private dragNode: React.RefObject<HTMLDivElement>;
	public constructor(props: FeedItemProps) {
		super(props);
		this.dragNode = React.createRef();
	}
	public render() {
		const {
			id,
			type,
			title,
			liveUrl,
			isLive,
			metaContent,
			onAddToClipboard = noop,
			shouldObscureFeed,
			scheduledPublicationDate,
			firstPublishedDate,
			thumbnail,
			hasVideo,
			handleDragStart,
			byline,
		} = this.props;

		const { preview, live, ophan } = getPaths(id);
		const href = isLive ? live : preview;
		const displayOphanLink = type === CardTypesMap.ARTICLE && isLive;

		return (
			<Container
				data-testid="feed-item"
				draggable={true}
				onDragStart={(event) =>
					this.dragNode.current && handleDragStart(event, this.dragNode.current)
				}
			>
				<RenderOffscreen ref={this.dragNode}>
					<DraggingArticleComponent headline={title} />
				</RenderOffscreen>
				<FeedItemContainer
					href={liveUrl}
					onClick={(e: React.MouseEvent) => e.preventDefault()}
					aria-disabled
					blur={shouldObscureFeed}
				>
					<MetaContainer>
						{metaContent}
						<RefreshPeriodically rateMs={collectionArticlesPollInterval}>
							{() => (
								<>
									{scheduledPublicationDate && (
										<ScheduledPublication>
											{distanceInWordsStrict(
												new Date(scheduledPublicationDate),
												Date.now(),
											)}
										</ScheduledPublication>
									)}
									{firstPublishedDate && (
										<FirstPublished>
											{distanceInWordsStrict(
												Date.now(),
												new Date(firstPublishedDate),
											)}
										</FirstPublished>
									)}
								</>
							)}
						</RefreshPeriodically>
						<ShortVerticalPinline />
					</MetaContainer>
					<Body>
						<Title data-testid="headline">{title}</Title>
						{byline ? (
							<Byline data-testid="byline">{byline}</Byline>
						) : undefined}
					</Body>
					<ArticleThumbnail
						style={{
							backgroundImage: `url('${thumbnail}')`,
						}}
					>
						{hasVideo && (
							<VideoIconContainer title="This media has video content.">
								<VideoIcon />
							</VideoIconContainer>
						)}
					</ArticleThumbnail>
				</FeedItemContainer>
				<HoverActionsAreaOverlay data-testid="hover-overlay">
					<HoverActionsButtonWrapper
						toolTipPosition={'top'}
						toolTipAlign={'right'}
						renderButtons={(props) => (
							<>
								<HoverViewButton hoverText="View" href={href} {...props} />
								{displayOphanLink && (
									<HoverOphanButton {...props} href={ophan} hoverText="Ophan" />
								)}
								<HoverAddToClipboardButton
									onAddToClipboard={onAddToClipboard}
									hoverText="Clipboard"
									{...props}
								/>
							</>
						)}
					/>
				</HoverActionsAreaOverlay>
			</Container>
		);
	}
}
