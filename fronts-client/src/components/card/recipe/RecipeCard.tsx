import React from 'react';
import { Card, CardSizes } from 'types/Collection';
import CardContainer from '../CardContainer';
import CardContent from '../CardContent';
import CardSettingsDisplay from '../CardSettingsDisplay';
import CardHeadingContainer from '../CardHeadingContainer';
import CardMetaHeading from '../CardMetaHeading';
import CardHeading from '../CardHeading';
import { selectCard } from 'selectors/shared';
import { State } from 'types/State';
import { selectors as recipeSelectors } from 'bundles/recipesBundle';
import CardBody from '../CardBody';
import CardMetaContainer from '../CardMetaContainer';
import ImageAndGraphWrapper from 'components/image/ImageAndGraphWrapper';
import { ThumbnailSmall } from 'components/image/Thumbnail';
import CardMetaContent from '../CardMetaContent';
import { upperFirst } from 'lodash';
import { useSelector } from 'react-redux';

interface Props {
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onAddToClipboard?: (uuid: string) => void;
  onClick?: () => void;
  id: string;
  collectionId?: string;
  frontId: string;
  draggable?: boolean;
  size?: CardSizes;
  textSize?: CardSizes;
  fade?: boolean;
  children?: React.ReactNode;
  isUneditable?: boolean;
  showMeta?: boolean;
}

export const RecipeCard = ({
  id,
  fade,
  size = 'default',
  textSize = 'default',
  onDelete,
  onAddToClipboard,
  children,
  isUneditable,
  collectionId,
  frontId,
  showMeta,
  ...rest
}: Props) => {
  const card = useSelector<State, Card>((state) => selectCard(state, id));
  const recipe = useSelector((state) =>
    recipeSelectors.selectById(state, card.id)
  );

  return (
    <CardContainer {...rest}>
      <CardBody data-testid="snap" size={size} fade={fade}>
        {showMeta && (
          <CardMetaContainer size={size}>
            <CardMetaHeading>Recipe</CardMetaHeading>
            <CardMetaContent>
              {upperFirst(recipe?.difficultyLevel)}
            </CardMetaContent>
          </CardMetaContainer>
        )}
        <CardContent textSize={textSize}>
          <CardSettingsDisplay
            isBreaking={card.meta?.isBreaking}
            showByline={card.meta?.showByline}
            showQuotedHeadline={card.meta?.showQuotedHeadline}
            showLargeHeadline={card.meta?.showLargeHeadline}
            isBoosted={card.meta?.isBoosted}
          />
          <CardHeadingContainer size={size}>
            <CardHeading data-testid="headline" html>
              {recipe?.title ?? 'No recipe found'}
            </CardHeading>
          </CardHeadingContainer>
        </CardContent>
        <ImageAndGraphWrapper size={size}>
          <ThumbnailSmall url={recipe?.featuredImage.url} />
        </ImageAndGraphWrapper>
      </CardBody>
    </CardContainer>
  );
};
