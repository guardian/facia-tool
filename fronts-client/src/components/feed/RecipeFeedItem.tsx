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

interface ComponentProps {
	id: string;
}

export const RecipeFeedItem = ({ id }: ComponentProps) => {
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

	const shortenTimestamp = (iso: string) => {
		const parts = iso.split('T');
		return parts[0];
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
			metaContent={
				<>
					<ContentInfo>Recipe</ContentInfo>
					<ContentExtra>
						{recipe?.score && recipe.score < 1
							? `Relevance ${Math.ceil(recipe.score * 100)}%`
							: ''}
						<br />
						{recipe?.lastModifiedDate
							? `M ${shortenTimestamp(recipe.lastModifiedDate)}`
							: undefined}
						<br />
						{recipe?.publishedDate
							? `P ${shortenTimestamp(recipe.publishedDate)}`
							: undefined}
						<br />
						{recipe?.firstPublishedDate
							? `F ${shortenTimestamp(recipe.firstPublishedDate)}`
							: undefined}
						<br />
					</ContentExtra>
				</>
			}
		/>
	);
};
