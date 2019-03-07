import React from 'react';
import { styled, SharedTheme } from 'shared/constants/theme';
import { StyledComponentProps } from 'styled-components';
import { sanitizeHTML } from 'shared/util/sanitizeHTML';

const Wrapper = styled('span')`
  font-family: GhGuardianHeadline-Medium;
  padding-top: 2px;
  font-size: 16px;
`;

interface CollectionItemHeadingProps {
  children?: string;
  html?: boolean;
}

type Props = StyledComponentProps<
  'div',
  SharedTheme,
  CollectionItemHeadingProps,
  ''
>;

const CollectionItemHeading = ({
  children = '',
  html = false,
  ref, // remove this for TS reasons
  ...props
}: Props) =>
  html ? (
    <Wrapper
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(children) }}
      {...props}
    />
  ) : (
    <Wrapper {...props}>{children}</Wrapper>
  );

export default CollectionItemHeading;
