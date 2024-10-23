import { FeedItem } from './FeedItem';
import React, { useCallback } from 'react';
import { State } from '../../types/State';
import { selectFeatureValue } from '../../selectors/featureSwitchesSelectors';
import { ContentExtra, ContentInfo } from './ContentInfo';
import { CardTypesMap } from 'constants/cardTypes';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { insertCardWithCreate } from 'actions/Cards';
import { selectors as recipeSelectors } from 'bundles/recipesBundle';
import { handleDragStartForCard } from 'util/dragAndDrop';
import { Title as FeedItemTitle } from './FeedItem';
import format from 'date-fns/format';

interface ComponentProps {
	id: string;
	showTimes: boolean;
}

export const RecipeFeedItem = ({ id, showTimes }: ComponentProps) => {
	const shouldObscureFeed = useSelector<State, boolean>((state) =>
		selectFeatureValue(state, 'obscure-feed'),
	);

	const dispatch = useDispatch();

	const recipe = useSelector((state) => recipeSelectors.selectById(state, id)!);

	const onAddToClipboard = useCallback(() => {
		dispatch<any>(
			insertCardWithCreate(
				{ type: 'clipboard', id: 'clipboard', index: 0 },
				{ type: 'RECIPE', data: recipe },
				'clipboard',
			),
		);
	}, [recipe]);

	const renderTimestamp = (iso: string) => {
		try {
			const date = new Date(iso);
			return format(date, 'HH:mm on do MMM YYYY');
		} catch (err) {
			console.warn(err);
			return iso;
		}
	};
	return (
		<FeedItem
			type={CardTypesMap.RECIPE}
			id={recipe.canonicalArticle}
			title={recipe.title}
			thumbnail={recipe.previewImage?.url ?? recipe.featuredImage?.url ?? ''}
			liveUrl={`https://theguardian.com/${recipe.canonicalArticle}`}
			hasVideo={false}
			isLive={true} // We do not yet serve preview recipes
			handleDragStart={handleDragStartForCard(CardTypesMap.RECIPE, recipe)}
			onAddToClipboard={onAddToClipboard}
			shouldObscureFeed={shouldObscureFeed}
			showPinboard={false}
			bodyContent={
				<>
					<FeedItemTitle>{recipe.title}</FeedItemTitle>
					{recipe?.lastModifiedDate && showTimes ? (
						<ContentExtra>
							Modified {renderTimestamp(recipe.lastModifiedDate)}
						</ContentExtra>
					) : undefined}
					{recipe?.publishedDate && showTimes ? (
						<ContentExtra>
							Published {renderTimestamp(recipe.publishedDate)}
						</ContentExtra>
					) : undefined}
				</>
			}
			metaContent={
				<>
					<ContentInfo>Recipe</ContentInfo>
					<ContentExtra>
						{recipe?.score && recipe.score < 1
							? `Relevance ${Math.ceil(recipe.score * 100)}%`
							: ''}
					</ContentExtra>
				</>
			}
		/>
	);
};
