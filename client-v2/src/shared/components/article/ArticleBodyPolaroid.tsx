import React from 'react';
import { styled } from 'shared/constants/theme';

import { ArticleBodyProps } from './ArticleBodyDefault';
import { getArticleLabel } from 'util/clipboardUtils';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import PolaroidThumbnail from '../PolaroidThumbnail';
import { getPillarColor } from 'shared/util/getPillarColor';
import { HoverActionsButtonWrapper } from '../input/HoverActionButtonWrapper';
import {
  HoverViewButton,
  HoverOphanButton,
  HoverDeleteButton
} from '../input/HoverActionButtons';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import ImagePlaceholder from '../ImagePlaceholder';
import TextPlaceholder from '../TextPlaceholder';

const PillaredSection = styled('span')<{ pillar?: string; isLive?: boolean }>`
  color: ${({ pillar, isLive }) =>
    getPillarColor(pillar, isLive || true) || 'inherit'};
  font-size: 13px;
  font-weight: bold;
`;

const HeadlinePolaroidSpan = styled('span')`
  font-size: 12px;
`;

const ArticlePolaroidComponent = ({
  firstPublicationDate,
  urlPath,
  size = 'default',
  onDelete,
  headline,
  displayPlaceholders,
  pillarId,
  thumbnail,
  kicker,
  isLive,
  isUneditable
}: ArticleBodyProps) => {
  const articleLabel =
    getArticleLabel(firstPublicationDate, kicker, isLive) || '';
  return (
    <>
      {size === 'default' &&
        (displayPlaceholders ? (
          <ImagePlaceholder height={84} />
        ) : (
          <PolaroidThumbnail
            style={{
              backgroundImage: `url('${thumbnail}')`
            }}
          />
        ))}
      <CollectionItemContent displayType="polaroid" data-testid="headline">
        {displayPlaceholders ? (
          <>
            <TextPlaceholder />
            <TextPlaceholder width={25} />
          </>
        ) : (
          <>
            <PillaredSection pillar={pillarId} isLive={isLive}>
              {articleLabel}
            </PillaredSection>
            <HeadlinePolaroidSpan>{headline}</HeadlinePolaroidSpan>
          </>
        )}
      </CollectionItemContent>
      <HoverActionsAreaOverlay disabled={isUneditable} justify={'flex-end'}>
        <HoverActionsButtonWrapper
          buttons={[
            { text: 'View', component: HoverViewButton },
            { text: 'Ophan', component: HoverOphanButton },
            { text: 'Delete', component: HoverDeleteButton }
          ]}
          buttonProps={{
            isLive,
            urlPath,
            onDelete
          }}
          size={size}
          toolTipPosition={'top'}
          toolTipAlign={'right'}
        />
      </HoverActionsAreaOverlay>
    </>
  );
};

export default ArticlePolaroidComponent;
