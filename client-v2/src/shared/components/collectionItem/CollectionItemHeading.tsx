import React from 'react';
import { styled } from 'shared/constants/theme';
import { sanitizeHTML } from 'shared/util/sanitizeHTML';
import { media } from 'shared/util/mediaQueries';
import { theme } from 'constants/theme';
import { CollectionItemSizes } from 'shared/types/Collection';

const Wrapper = styled('span')<{
  displaySize?: CollectionItemSizes;
  showLargeHeadline?: boolean;
}>`
  font-family: TS3TextSans;
  font-weight: normal;
  padding: 2px 0 0;
  font-size: ${theme.shared.collectionItem.fontSizeSmall};
  ${media.large`font-size: 13px;`}
`;

interface CollectionItemHeading {
  children?: string;
  html?: boolean;
  displaySize?: CollectionItemSizes;
  showLargeHeadline?: boolean;
}

const CollectionItemHeading = ({
  children = '',
  displaySize,
  html = false,
  ...props
}: CollectionItemHeading) =>
  html ? (
    <Wrapper
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(children) }}
      {...props}
    />
  ) : (
    <Wrapper {...props}>{children}</Wrapper>
  );

export default CollectionItemHeading;
