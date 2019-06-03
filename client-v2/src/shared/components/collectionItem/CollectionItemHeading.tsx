import React from 'react';
import { styled } from 'shared/constants/theme';
import { sanitizeHTML } from 'shared/util/sanitizeHTML';

const Wrapper = styled('span')<{
  displaySize?: 'small' | 'default';
  showBoostedHeadline?: boolean;
}>`
  font-family: TS3TextSans;
  font-weight: 400;
  padding-top: 2px;
  font-size: ${({ displaySize, showBoostedHeadline }) => {
    if (displaySize === 'small') {
      return '13px';
    }
    if (showBoostedHeadline) {
      return '18px';
    }
    return '15px';
  }};
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
