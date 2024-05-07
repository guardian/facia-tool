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
import upperFirst from 'lodash/upperFirst';
import CardContent from '../CardContent';
import CardSettingsDisplay from '../CardSettingsDisplay';
import CardHeadingContainer from '../CardHeadingContainer';
import CardHeading from '../CardHeading';
import ImageAndGraphWrapper from '../../image/ImageAndGraphWrapper';
import Thumbnail, { ThumbnailSmall } from '../../image/Thumbnail';

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
  const chef = useSelector((state) =>
    chefsSelectors.selectById(state, card.id)
  );
  return (
    <CardContainer {...rest}>
      <CardBody data-testid="snap" size={size} fade={fade}>
        {showMeta && (
          <CardMetaContainer size={size}>
            <CardMetaHeading>Chef</CardMetaHeading>
            <CardMetaContent>{upperFirst(chef?.sectionName)}</CardMetaContent>
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
              {`${chef?.firstName} ${chef?.lastName}` ?? 'No Chef found'}
            </CardHeading>
          </CardHeadingContainer>
        </CardContent>
        <ImageAndGraphWrapper size={size}>
          <ThumbnailSmall url={chef?.bylineLargeImageUrl} />
        </ImageAndGraphWrapper>
      </CardBody>
    </CardContainer>
  );
};
