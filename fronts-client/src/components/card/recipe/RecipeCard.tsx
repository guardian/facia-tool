import React from 'react';
import { Card, CardSizes } from 'types/Collection';
import CardContainer from '../CardContainer';
import CardContent from '../CardContent';
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
import { HoverActionsAreaOverlay } from 'components/CollectionHoverItems';
import { HoverActionsButtonWrapper } from 'components/inputs/HoverActionButtonWrapper';
import {
  HoverAddToClipboardButton,
  HoverDeleteButton,
  HoverViewButton,
} from 'components/inputs/HoverActionButtons';
import { getPaths } from 'util/paths';

interface Props {
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete: () => void;
  onAddToClipboard: () => void;
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
  showMeta = true,
  ...rest
}: Props) => {
  const card = useSelector<State, Card>((state) => selectCard(state, id));
  const recipe = useSelector((state) =>
    recipeSelectors.selectById(state, card.id)
  );
  const paths = recipe?.canonicalArticle
    ? getPaths(recipe.canonicalArticle)
    : undefined;

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
          <CardHeadingContainer size={size}>
            <CardHeading data-testid="headline" html>
              {recipe?.title ?? 'No recipe found'}
            </CardHeading>
          </CardHeadingContainer>
        </CardContent>
        <ImageAndGraphWrapper size="small">
          <ThumbnailSmall url={recipe?.previewImage?.url ?? recipe?.featuredImage?.url} />
        </ImageAndGraphWrapper>
        <HoverActionsAreaOverlay data-testid="hover-overlay">
          <HoverActionsButtonWrapper
            toolTipPosition={'top'}
            toolTipAlign={'right'}
            renderButtons={(props) => (
              <>
                <HoverViewButton
                  hoverText="View"
                  href={paths?.live}
                  {...props}
                />
                <HoverAddToClipboardButton
                  onAddToClipboard={onAddToClipboard}
                  hoverText="Clipboard"
                  {...props}
                />
                <HoverDeleteButton
                  hoverText="Delete"
                  onDelete={onDelete}
                  {...props}
                />
              </>
            )}
          />
        </HoverActionsAreaOverlay>
      </CardBody>
    </CardContainer>
  );
};
