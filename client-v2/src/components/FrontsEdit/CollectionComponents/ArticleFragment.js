// @flow

import React from 'react';
import styled, { css } from 'styled-components';
import * as Guration from '@guardian/guration';
import Article from 'shared/components/Article';
import DropZone from 'components/DropZone';
import { optionize } from 'util/component';

type ArticleFragmentProps = {
  isSelected: boolean,
  uuid: string,
  meta: {
    supporting: *
  },
  children: *,
  getDragProps: () => Object,
  onSelect: (uuid: string) => void
};

// We hoist the drop zone into the rendered element here,
// to prevent it from introducing gaps between supporting
// articles.
const dropIndicatorStyle = {
  marginLeft: '83px'
};

const dropZoneStyle = {
  marginTop: '-15px',
  padding: '3px'
};

const ArticleFragmentContainer = styled('div')`
  ${({ isSelected }) =>
    !isSelected &&
    css`
      opacity: 0.5;
    `};
`;

const ArticleFragment = ({
  uuid,
  isSelected,
  meta: { supporting = [] } = {},
  children,
  getDragProps,
  onSelect
}: ArticleFragmentProps) => (
  <ArticleFragmentContainer
    isSelected={isSelected}
    {...optionize(() => onSelect(uuid))}
  >
    <Article id={uuid} {...getDragProps()}>
      <Guration.Level
        arr={supporting}
        type="articleFragment"
        getKey={({ uuid: key }) => key}
        renderDrop={props => (
          <DropZone
            {...props}
            style={dropZoneStyle}
            indicatorStyle={dropIndicatorStyle}
          />
        )}
      >
        {children}
      </Guration.Level>
    </Article>
  </ArticleFragmentContainer>
);

export default ArticleFragment;
