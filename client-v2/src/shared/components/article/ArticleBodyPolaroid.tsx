import React from 'react';
import styled from 'styled-components';
import truncate from 'lodash/truncate';
import { ArticleBodyProps } from './ArticleBodyDefault';
import { getToneColor } from 'shared/util/toneColorMap';
import { getArticleLabel } from 'util/clipboardUtils';
import HoverActions, {
  HoverActionsLeft,
  HoverActionsRight
} from '../CollectionHoverItems';
import ButtonHoverAction from '../input/ButtonHoverAction';
import CollectionItemContent from '../collectionItem/CollectionItemContent';

const Thumbnail = styled('img')`
  width: 100%;
`;

const TonedKicker = styled('span')<{ tone?: string; isLive?: boolean }>`
  color: ${({ tone, isLive }) => getToneColor(tone, isLive) || 'inherit'};
  font-size: 13px;
  font-weight: bold;
`;

const ArticlePolaroidComponent = ({
  firstPublicationDate,
  uuid,
  tone,
  size = 'default',
  onDelete,
  headline,
  thumbnail,
  sectionName,
  isLive
}: ArticleBodyProps) => {
  const articleLabel =
    getArticleLabel(firstPublicationDate, sectionName, isLive) || '';
  return (
    <>
      {size === 'default' && thumbnail && <Thumbnail src={thumbnail} alt="" />}
      <CollectionItemContent displayType="polaroid">
        <TonedKicker tone={tone} isLive={isLive}>
          {articleLabel}
        </TonedKicker>
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
