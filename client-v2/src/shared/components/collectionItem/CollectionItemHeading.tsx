import React from 'react';
import { styled } from 'shared/constants/theme';
import { sanitizeHTML } from 'shared/util/sanitizeHTML';

const Wrapper = styled('span')<{ displaySize?: 'small' | 'default' }>`
  font-family: GHGuardianHeadline;
  font-weight: 500;
  padding-top: 2px;
  font-size: ${({ displaySize }) =>
    displaySize === 'small' ? '13px' : '15px'};
`;

type CollectionItemHeading = {
  children?: string;
  html?: boolean;
  displaySize?: 'small' | 'default';
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
