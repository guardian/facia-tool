// @flow

import * as React from 'react';
import styled from 'styled-components';

const ItemContainer = styled('div')`
  background-color: #fff;
  border-bottom: 1px solid #222;
  display: flex;
  padding: 0.5rem;
`;

const ItemTitle = styled(`h2`)`
  color: #221133;
  font-size: 16px;
  margin: 0;
  vertical-align: top;
`;

const ItemImage = styled(`img`)`
  align-self: center;
  flex-grow: 0;
  height: auto;
  margin-right: 0.5rem;
  width: 100px;
`;

const ItemLink = styled(`a`)`
  color: inherit;
  text-decoration: none;

  :hover > * {
    opacity: 0.85;
  }
`;

type FeedItemProps = {
  title: string,
  href: string,
  thumbnailUrl: ?string
};

const FeedItem = ({ title, href, thumbnailUrl }: FeedItemProps) => (
  <ItemLink href={href}>
    <ItemContainer>
      {thumbnailUrl && <ItemImage src={thumbnailUrl} />}
      <ItemTitle>{title}</ItemTitle>
    </ItemContainer>
  </ItemLink>
);

export default FeedItem;
