import React from 'react';
import { styled } from 'shared/constants/theme';
import { sanitizeHTML } from 'shared/util/sanitizeHTML';
import { media } from 'shared/util/mediaQueries';
import { theme } from 'constants/theme';

const Wrapper = styled('span')<{
  displaySize?: 'small' | 'default';
  showBoostedHeadline?: boolean;
}>`
  font-family: TS3TextSans;
  font-weight: normal;
  padding-top: 2px;
  ${({ displaySize, showBoostedHeadline }) => {
    if (displaySize === 'small') {
      return `font-size: ${theme.shared.collectionItem.fontSizeSmall}`;
    }
    if (showBoostedHeadline) {
      return `font-size: 18px`;
    }
  }};
  ${media.large`font-size: 13px;`}
`;

type CollectionItemHeading = {
  children?: string;
  html?: boolean;
  displaySize?: 'small' | 'default';
  showBoostedHeadline?: boolean;
} & React.HTMLProps<HTMLSpanElement>;

const CollectionItemHeading = ({
  children = '',
  size,
  html = false,
  ref, // remove this for TS reasons
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
