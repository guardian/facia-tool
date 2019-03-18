import React from 'react';
import { styled } from 'constants/theme';
import { TransitionGroup } from 'react-transition-group';
import FadeTransition from 'components/transitions/FadeTransition';
import { Client } from 'presence';

const PresenceWrapper = styled.div`
  height: 2.5em;
  position: relative;
`;

const PresenceCircle = styled.span<{ index: number }>`
  background-color: white;
  border-radius: 50%;
  box-shadow: -1px 1px 4px 0 rgba(0, 0, 0, 0.5),
    inset 0 0 2px 0 rgba(0, 0, 0, 0.5);
  color: #222;
  display: inline-block;
  font-family: GHGuardianHeadline-Medium;
  font-size: 14px;
  font-weight: 500;
  height: 2.5em;
  line-height: 2.5em;
  position: absolute;
  transform: translateX(${({ index }) => `${index * 1.5}em`});
  text-align: center;
  top: 0;
  transition: transform 0.3s;
  width: 2.5em;
`;

interface PresenceBarProps {
  clients: Client[];
}

const PresenceBar = ({ clients }: PresenceBarProps) => (
  <PresenceWrapper>
    <TransitionGroup>
      {clients.map(({ person: { firstName, lastName }, connId }, index) => (
        <FadeTransition direction="down" position="static" key={connId}>
          <PresenceCircle title={`${firstName} ${lastName}`} index={index}>
            {`${firstName.slice(0, 1)}${lastName.slice(0, 1)}`}
          </PresenceCircle>
        </FadeTransition>
      ))}
    </TransitionGroup>
  </PresenceWrapper>
);

export default PresenceBar;
