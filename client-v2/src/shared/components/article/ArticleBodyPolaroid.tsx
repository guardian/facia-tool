import React from 'react';
import styled from 'styled-components';
import truncate from 'lodash/truncate';
import { ArticleBodyProps } from './ArticleBodyDefault';
import { getArticleLabel } from 'util/clipboardUtils';
import HoverActions, {
  HoverActionsLeft,
  HoverActionsRight
} from '../CollectionHoverItems';
import ButtonHoverAction from '../input/ButtonHoverAction';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import PolaroidThumbnail from '../PolaroidThumbnail';
import { getPillarColor } from 'shared/util/getPillarColor';

const PillaredSection = styled('span')<{ pillar?: string, isLive?: boolean }>`
  color: ${({ pillar, isLive }) => getPillarColor(pillar, isLive) || 'inherit'};
  font-size: 13px;
  font-weight: bold;
`;

const ArticlePolaroidComponent = ({
  firstPublicationDate,
  uuid,
  size = 'default',
  onDelete,
  headline,
  pillarId,
  thumbnail,
  sectionName,
  isLive
}: ArticleBodyProps) => {
  const articleLabel =
    getArticleLabel(firstPublicationDate, sectionName, isLive) || '';
  return (
    <>
      {size === 'default' &&
        thumbnail && (
          <PolaroidThumbnail
            style={{
              backgroundImage: `url('${thumbnail}')`
            }}
          />
        )}
      <CollectionItemContent displayType="polaroid">
      <PillaredSection pillar={pillarId} isLive={isLive}>{ articleLabel }</PillaredSection>
        {` ${truncate(headline, {
          length: 45 - articleLabel.length
        })}`}
      </CollectionItemContent>
      <HoverActions>
        <HoverActionsLeft />
        <HoverActionsRight>
          <ButtonHoverAction
            action="delete"
            danger
            onClick={(e: React.SyntheticEvent) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(uuid);
              }
            }}
            title="Delete"
          />
        </HoverActionsRight>
      </HoverActions>
    </>
  );
};

export default ArticlePolaroidComponent;
