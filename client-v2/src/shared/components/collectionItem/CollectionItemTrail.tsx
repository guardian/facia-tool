import React from 'react';
import { styled } from 'shared/constants/theme';
import { sanitizeHTML } from 'shared/util/sanitizeHTML';

const Wrapper = styled('div')`
  width: 100%;
  margin-top: 3px;
  font-size: 13px;
  line-height: 17px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: TS3TextSans;
`;

type CollectionItemTrailProps = {
  children?: string;
  html?: boolean;
} & React.HTMLProps<HTMLDivElement>;

const CollectionItemTrail = ({
  children = '',
  html = false,
  ref, // remove this for TS reasons
  ...props
}: CollectionItemTrailProps) =>
  html ? (
    <Wrapper
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(children) }}
      {...props}
    />
  ) : (
    <Wrapper {...props}>{children}</Wrapper>
  );

export default CollectionItemTrail;
