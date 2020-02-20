import React from 'react';
import { styled } from 'constants/theme-shared';
import { sanitizeHTML } from 'shared/util/sanitizeHTML';
import { media } from 'shared/util/mediaQueries';
import { theme } from 'constants/theme';
import { CardSizes } from 'shared/types/Collection';

const Wrapper = styled.span<{
  displaySize?: CardSizes;
  showLargeHeadline?: boolean;
}>`
  font-family: TS3TextSans;
  font-weight: normal;
  padding: 2px 0 0;
  font-size: ${theme.shared.card.fontSizeSmall};
  ${media.large`font-size: 13px;`}
`;

interface CardHeading {
  children?: string;
  html?: boolean;
  displaySize?: CardSizes;
  showLargeHeadline?: boolean;
}

const CardHeading = ({
  children = '',
  displaySize,
  html = false,
  ...props
}: CardHeading) =>
  html ? (
    <Wrapper
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(children) }}
      {...props}
    />
  ) : (
    <Wrapper {...props}>{children}</Wrapper>
  );

export default CardHeading;
