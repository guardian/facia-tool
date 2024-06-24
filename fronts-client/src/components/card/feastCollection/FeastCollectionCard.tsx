import React from 'react';
import { Card, CardSizes } from '../../../types/Collection';
import { useSelector } from 'react-redux';
import { selectCard } from '../../../selectors/shared';
import { State } from '../../../types/State';
import CardContainer from '../CardContainer';
import CardBody from '../CardBody';
import CardMetaHeading from '../CardMetaHeading';
import CardMetaContainer from '../CardMetaContainer';
import CardContent from '../CardContent';
import CardSettingsDisplay from '../CardSettingsDisplay';
import CardHeadingContainer from '../CardHeadingContainer';
import CardHeading from '../CardHeading';
import { HoverActionsAreaOverlay } from '../../CollectionHoverItems';
import { HoverActionsButtonWrapper } from '../../inputs/HoverActionButtonWrapper';
import {
  HoverAddToClipboardButton,
  HoverDeleteButton,
} from '../../inputs/HoverActionButtons';

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

export const FeastCollectionCard = ({
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

  return (
    <>
      <CardContainer {...rest}>
        <CardBody data-testid="snap" size={size} fade={fade}>
          {showMeta && (
            <CardMetaContainer size={size}>
              <CardMetaHeading>Recipe collection</CardMetaHeading>
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
                Recipe collection
              </CardHeading>
            </CardHeadingContainer>
          </CardContent>
          <HoverActionsAreaOverlay data-testid="hover-overlay">
            <HoverActionsButtonWrapper
              toolTipPosition={'top'}
              toolTipAlign={'right'}
              renderButtons={(props) => (
                <>
                  <HoverAddToClipboardButton
                    hoverText="Clipboard"
                    onAddToClipboard={onAddToClipboard}
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
      {children}
    </>
  );
};
