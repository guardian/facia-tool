import React from 'react';
import styled, { css } from 'styled-components';

import ButtonCircular from 'shared/components/input/ButtonCircular';
import MoreImage from 'shared/images/icons/more.svg';

interface Props {
  fronts: Array<{ id: string, isOpen: boolean }>,
  onSelect: (frontId: string) => void
}

const ListItem = styled('li')`
  position: relative;
  padding: 10px 0;
  font-family: TS3TextSans;
  font-size: 16px;
  line-height: 20px;
  border-bottom: solid 1px #5e5e5e;
`;

const ListContainer = styled('ul')`
  list-style: none;
  margin-top: 0;
  padding-left: 0;
`;

const ListLabel = styled('span')<{ isActive?: boolean }>`
  max-width: calc(100% - 30px);
  ${({ isActive }) =>
    !isActive &&
    css`
      color: #999;
    `};
`;

const ButtonAdd = ButtonCircular.extend`
  background-color: #4d4d4d;
  position: absolute;
  top: 8px;
  right: 0;
  padding: 3px;
`;

const FrontList = ({ fronts, onSelect }: Props) =>
  fronts ? (
    <ListContainer>
      {fronts.map(front => (
        <ListItem key={front.id}>
          <ListLabel isActive={front.isOpen}>{front.id}</ListLabel>
          {front.isOpen && (
            <ButtonAdd onClick={() => onSelect(front.id)}>
              <img src={MoreImage} alt="" width="100%" height="100%" />
            </ButtonAdd>
          )}
        </ListItem>
      ))}
    </ListContainer>
  ) : null;

export default FrontList;
