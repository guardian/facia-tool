import React from 'react';
import { Card, CardSizes } from 'types/Collection';
import CardContainer from '../CardContainer';
import CardContent from '../CardContent';
import CardSettingsDisplay from '../CardSettingsDisplay';
import CardHeadingContainer from '../CardHeadingContainer';
import CardMetaHeading from '../CardMetaHeading';
import CardHeading from '../CardHeading';
import { selectCard } from 'selectors/shared';
import { connect } from 'react-redux';
import { State } from 'types/State';

interface ContainerProps {
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
}

interface RecipeProps extends ContainerProps {
  card: Card;
  featureFlagPageViewData: boolean;
}

const RecipeCardComponent = ({
  id,
  fade,
  size = 'default',
  textSize = 'default',
  onDelete,
  onAddToClipboard,
  children,
  card,
  isUneditable,
  collectionId,
  frontId,
  featureFlagPageViewData,
  ...rest
}: RecipeProps) => {
  return (
    <CardContainer {...rest}>
      <CardContent textSize={textSize}>
        <CardSettingsDisplay
          isBreaking={card.meta?.isBreaking}
          showByline={card.meta?.showByline}
          showQuotedHeadline={card.meta?.showQuotedHeadline}
          showLargeHeadline={card.meta?.showLargeHeadline}
          isBoosted={card.meta?.isBoosted}
        />
        <CardHeadingContainer size={size}>
          <CardMetaHeading>Recipe</CardMetaHeading>
          <CardHeading data-testid="headline" html>
            Recipe heading
          </CardHeading>
        </CardHeadingContainer>
      </CardContent>
    </CardContainer>
  );
};

const mapStateToProps = (state: State, props: ContainerProps) => {
  return {
    card: selectCard(state, props.id),
  };
};

export const RecipeCard = connect(mapStateToProps)(RecipeCardComponent);
