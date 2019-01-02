import React from 'react';
import styled, { css } from 'styled-components';

import ButtonCircular from 'shared/components/input/ButtonCircular';
import MoreImage from 'shared/images/icons/more.svg';
import TextHighlighter from './util/TextHighlighter';

interface Props {
  fronts: Array<{ id: string; isOpen: boolean }>;
  onSelect: (frontId: string) => void;
  searchString: string;
}

const ListItem = styled('li')<{ isActive?: boolean }>`
  position: relative;
  padding: 10px 5px;
  font-family: TS3TextSans;
  font-size: 16px;
  line-height: 20px;
  border-bottom: solid 1px #5e5e5e;
  ${({ isActive }) =>
    isActive &&
    css`
      cursor: pointer;
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
    `};
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
  right: 5px;
  padding: 3px;
`;

const FrontList = ({ fronts, onSelect, searchString }: Props) => {
  if (!fronts) {
    return null;
  }
  const frontsToRender = searchString
    ? fronts.filter(_ => _.id.includes(searchString))
    : fronts;
  return (
    <ListContainer>
      {frontsToRender.map(front => (
        <ListItem
          isActive={!front.isOpen}
          key={front.id}
          onClick={!front.isOpen ? () => onSelect(front.id) : undefined}
        >
          <ListLabel isActive={!front.isOpen}>
            <TextHighlighter
              originalString={front.id}
              searchString={searchString}
            />
          </ListLabel>
          {!front.isOpen && (
            <ButtonAdd>
              <img src={MoreImage} alt="" width="100%" height="100%" />
            </ButtonAdd>
          )}
        </ListItem>
      ))}
    </ListContainer>
  );
};

export default FrontList;
