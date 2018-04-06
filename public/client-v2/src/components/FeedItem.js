// @flow

import * as React from 'react';
import styled from 'styled-components';

const ItemContainer = styled('div')`
  background-color: #fff;
  margin-bottom: 1rem;
  padding: 1rem;
`;

const ItemTitle = styled(`h2`)`
  color: #221133;
  font-size: 16px;
`;

const ItemLink = styled(`a`)`
  color: inherit;
  text-decoration: none;
`;

type FeedItemProps = {
  title: string,
  href: string
};

const FeedItem = ({ title, href }: FeedItemProps) => (
  <ItemContainer>
    <ItemTitle>
      <ItemLink href={href}>{title}</ItemLink>
    </ItemTitle>
  </ItemContainer>
);

export default FeedItem;
