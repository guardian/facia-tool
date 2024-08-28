import React from 'react';
import { Card, CardSizes } from '../../../types/Collection';
import { useSelector } from 'react-redux';
import { selectCard } from '../../../selectors/shared';
import { State } from '../../../types/State';
import { selectors as chefsSelectors } from 'bundles/chefsBundle';
import CardContainer from '../CardContainer';
import CardBody from '../CardBody';
import CardMetaHeading from '../CardMetaHeading';
import CardMetaContainer from '../CardMetaContainer';
import CardMetaContent from '../CardMetaContent';
import CardContent from '../CardContent';
import CardHeadingContainer from '../CardHeadingContainer';
import CardHeading from '../CardHeading';
import ImageAndGraphWrapper from '../../image/ImageAndGraphWrapper';
import { ThumbnailSmall } from '../../image/Thumbnail';
import { HoverActionsAreaOverlay } from '../../CollectionHoverItems';
import { HoverActionsButtonWrapper } from '../../inputs/HoverActionButtonWrapper';
import {
  HoverAddToClipboardButton,
  HoverDeleteButton,
  HoverViewButton,
} from '../../inputs/HoverActionButtons';
import { CardPaletteContainer } from '../CardPaletteContainer';
import { PaletteItem } from 'components/form/PaletteForm';

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

export const ChefCard = ({
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
  const chef = useSelector((state: State) =>
    chefsSelectors.selectChefFromCard(state, card.uuid)
  );
  return (
    <CardContainer {...rest}>
      <CardBody data-testid="snap" size={size} fade={fade}>
        {showMeta && (
          <CardMetaContainer size={size}>
            <CardMetaHeading>Chef</CardMetaHeading>
          </CardMetaContainer>
        )}
        <CardContent textSize={textSize}>
          <CardHeadingContainer size={size}>
            <CardHeading data-testid="headline" html>
              {chef?.webTitle ?? 'No Chef found'}
            </CardHeading>
            <CardMetaContent>{chef?.bio}</CardMetaContent>
          </CardHeadingContainer>
        </CardContent>
        {card.meta.chefTheme && (
          <CardPaletteContainer>
            <PaletteItem size="s" palette={card.meta.chefTheme.palette} />
          </CardPaletteContainer>
        )}
        <ImageAndGraphWrapper size="small">
          <ThumbnailSmall
            url={chef?.chefImageOverride?.src ?? chef?.bylineLargeImageUrl}
          />
        </ImageAndGraphWrapper>
        <HoverActionsAreaOverlay data-testid="hover-overlay">
          <HoverActionsButtonWrapper
            toolTipPosition={'top'}
            toolTipAlign={'right'}
            renderButtons={(props) => (
              <>
                <HoverViewButton
                  hoverText="View"
                  href={chef?.webUrl}
                  {...props}
                />
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
  );
};
