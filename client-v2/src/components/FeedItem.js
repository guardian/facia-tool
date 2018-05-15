// @flow

import * as React from 'react';
import styled from 'styled-components';
import { getPaths } from '../util/paths';

const Container = styled('div')`
  background-color: #fff;
  border-bottom: 1px solid #222;
  color: #221133;
  display: flex;
  font-weight: 400;
  padding: 0.5rem;
`;

const Title = styled(`h2`)`
  font-size: 16px;
  margin: 0;
  vertical-align: top;
`;

const Image = styled(`img`)`
  align-self: center;
  flex-grow: 0;
  height: auto;
  margin-right: 0.5rem;
  width: 100px;
`;

const Tone = styled('span')`
  font-weight: 700;
  opacity: 0.75;
  margin-right: 0.25em;
`;

const Trail = styled('span')`
  font-size: 0.875em;
  margin-right: 0.25em;
`;

const MetaContainer = styled('div')`
  flex-grow: 1;
`;

const LinkContainer = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  margin-left: 0.5rem;
`;

const Link = styled(`a`).attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
})`
  text-decoration: none;

  :hover > * {
    opacity: 0.85;
  }
`;

type FeedItemProps = {
  title: string,
  href: string,
  tone: string,
  thumbnailUrl: ?string,
  trailText?: ?string
};

const FeedItem = ({
  title,
  href,
  tone,
  thumbnailUrl,
  trailText
}: FeedItemProps) => (
  <Container>
    {thumbnailUrl && <Image src={thumbnailUrl} />}
    <MetaContainer>
      <Title>{title}</Title>
      <Tone>{tone}</Tone>
      <Trail dangerouslySetInnerHTML={{ __html: trailText }} />
    </MetaContainer>
    <LinkContainer>
      <Link href={href}>Website</Link>
      <Link href={getPaths(href).ophan}>Ophan</Link>
    </LinkContainer>
  </Container>
);

export default FeedItem;
