import { CapiArticle } from '../../types/Capi';
import React from 'react';
import {
	dragOffsetX,
	dragOffsetY,
} from '../FrontsEdit/CollectionComponents/ArticleDrag';
import { getPaths } from '../../util/paths';
import { getArticleLabel, getThumbnail, isLive } from '../../util/CAPIUtils';
import { hasMainVideo } from '../../util/externalArticle';
import { getPillarColor } from '../../util/getPillarColor';
import { liveBlogTones } from '../../constants/fronts';
import { styled, theme } from '../../constants/theme';
import startCase from 'lodash/startCase';
import ArticlePageNumberSection from '../util/ArticlePageNumberSection';
import { State } from '../../types/State';
import { selectFeatureValue } from '../../selectors/featureSwitchesSelectors';
import { selectArticleAcrossResources } from '../../bundles/capiFeedBundle';
import { Dispatch } from '../../types/Store';
import { insertCardWithCreate } from '../../actions/Cards';
import { connect } from 'react-redux';
import { FeedItem } from './FeedItem';
import { ContentInfo } from './ContentInfo';
import { CardTypesMap } from 'constants/cardTypes';

const Tone = styled.span`
	font-weight: normal;
`;

interface ContainerProps {
	id: string;
}

interface ComponentProps extends ContainerProps {
	article?: CapiArticle;
	shouldObscureFeed: boolean;
	onAddToClipboard: (article: CapiArticle) => void;
}

const ArticleFeedItemComponent = ({
	article,
	id,
	onAddToClipboard,
}: ComponentProps) => {
	if (!article) {
		return <p>Article with id {id} not found.</p>;
	}

	const handleDragStart = (
		event: React.DragEvent<HTMLDivElement>,
		dragNode: HTMLDivElement,
	) => {
		event.dataTransfer.setData('capi', JSON.stringify(article));
		if (dragNode) {
			event.dataTransfer.setDragImage(dragNode, dragOffsetX, dragOffsetY);
		}
	};

	return (
		<FeedItem
			type={CardTypesMap.ARTICLE}
			id={article.id}
			title={article.webTitle}
			urlPath={article.id}
			liveUrl={getPaths(article.id).live}
			thumbnail={getThumbnail(article.frontsMeta.defaults, article)}
			scheduledPublicationDate={article.fields.scheduledPublicationDate}
			firstPublishedDate={article.webPublicationDate}
			hasVideo={hasMainVideo(article)}
			isLive={isLive(article)}
			onAddToClipboard={() => onAddToClipboard(article)}
			handleDragStart={handleDragStart}
			metaContent={
				<>
					<ContentInfo
						style={{
							color:
								getPillarColor(
									article.pillarId,
									isLive(article),
									article.frontsMeta.tone === liveBlogTones.dead,
								) || theme.capiInterface.textLight,
						}}
					>
						{getArticleLabel(article)}
						{article.frontsMeta.tone && (
							<Tone> / {startCase(article.frontsMeta.tone)}</Tone>
						)}
					</ContentInfo>
					<ArticlePageNumberSection article={article} />
				</>
			}
		/>
	);
};

const mapStateToProps = (state: State, { id }: ContainerProps) => ({
	shouldObscureFeed: selectFeatureValue(state, 'obscure-feed'),
	article: selectArticleAcrossResources(state, id),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		onAddToClipboard: (article: CapiArticle) =>
			dispatch(
				insertCardWithCreate(
					{ type: 'clipboard', id: 'clipboard', index: 0 },
					{ type: 'CAPI', data: article },
					'clipboard',
				),
			),
	};
};

export const ArticleFeedItem = connect(
	mapStateToProps,
	mapDispatchToProps,
)(ArticleFeedItemComponent);
