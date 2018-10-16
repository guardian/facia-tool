import React from 'react';
import styled from 'styled-components';
import distanceInWords from 'date-fns/distance_in_words_to_now';
import startCase from 'lodash/startCase';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import toneColorMap from 'shared/util/toneColorMap';
import { getPaths } from '../util/paths';

const LinkContainer = styled('div')`
  background-color: #f6f6f6;
  display: none;
  position: absolute;
  bottom: 20px;
  right: 10px;
  border-radius: 2px;
  padding: 1px 3px;
`;

const Container = styled('div')`
  display: flex;
  position: relative;
  border-top: solid 1px #c9c9c9;
  color: #221133;
  display: flex;
  font-weight: 400;
  padding-bottom: 20px;
  :hover ${LinkContainer} {
    display: block;
  }
`;

const Title = styled(`h2`)`
  margin: 2px 0 0;
  vertical-align: top;
  font-family: GHGuardianHeadline-Medium;
  font-size: 16px;
  font-weight: 500;
`;

const Link = styled(`a`).attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
})`
  text-decoration: none;
  color: #333;
  font-size: 12px;
  :hover {
    color: #555;
  }
`;

const MetaContainer = styled('div')`
  position: relative;
  width: 80px;
  padding: 0px 8px;
`;

const FirstPublished = styled('div')`
  font-size: 12px;
  margin: 2px 0;
`;

const Tone = styled('div')`
  padding-top: 2px;
  font-size: 12px;
  font-family: TS3TextSans-Bold;
`;

const Body = styled('div')`
  width: calc(100% - 80px);
  padding-left: 10px;
`;

interface FeedItemProps {
  title: string;
  href: string;
  tone: string;
  internalPageCode: string | void;
  publicationDate?: string;
}

const dragStart = (
  href: string | void,
  event: React.DragEvent<HTMLDivElement>
) => {
  event.dataTransfer.setData('capi', href || '');
};

const FeedItem = ({
  title,
  href,
  tone,
  publicationDate,
  internalPageCode
}: FeedItemProps) => (
  <Container
    draggable={true}
    onDragStart={event => dragStart(internalPageCode, event)}
  >
    <MetaContainer>
      <Tone
        style={{
          color: toneColorMap[tone] || '#c9c9c9'
        }}
      >
        {startCase(tone)}
      </Tone>
      {publicationDate && (
        <FirstPublished>
          {distanceInWords(new Date(publicationDate))}
        </FirstPublished>
      )}
      <ShortVerticalPinline />
    </MetaContainer>
    <Body>
      <Title>{title}</Title>
    </Body>
    <LinkContainer>
      <Link href={href}>Website</Link>&nbsp;
      <Link href={getPaths(href).ophan}>Ophan</Link>
    </LinkContainer>
  </Container>
);

export default FeedItem;
