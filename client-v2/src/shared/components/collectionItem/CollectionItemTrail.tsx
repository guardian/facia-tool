import React from 'react';
import { styled, SharedTheme } from 'shared/constants/theme';
import { StyledComponentProps } from 'styled-components';
import { sanitizeHTML } from 'shared/util/sanitizeHTML';

const Wrapper = styled('div')`
  width: 100%;
  margin-top: 3px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: TS3TextSans;
`;

interface CollectionItemTrailProps {
  children?: string;
  html?: boolean;
}

type Props = StyledComponentProps<
  'div',
  SharedTheme,
  CollectionItemTrailProps,
  ''
>;

const CollectionItemTrail = ({
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

export default CollectionItemTrail;
