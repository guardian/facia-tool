import React from 'react';
import { css } from 'styled-components';
import { styled, theme } from 'constants/theme';

import ButtonCircular from 'shared/components/input/ButtonCircular';
import { MoreIcon, StarIcon } from 'shared/components/icons/Icons';
import TextHighlighter from './util/TextHighlighter';

interface Props {
  fronts: Array<{ id: string; isOpen: boolean }>;
  // favouriteFronts: Array<{ id: string }>;
  onSelect: (frontId: string) => void;
  onStar: (frontId: string) => void;
  searchString: string;
}

const ButtonAdd = styled(ButtonCircular)`
  background-color: ${({ theme }) => theme.base.colors.frontListButton};
  position: absolute;
  top: 8px;
  right: 5px;
  padding: 3px;
`;

const ButtonFavorite = styled(ButtonCircular)`
  background-color: ${({ theme }) => theme.shared.colors.blackLight};
  position: absolute;
  top: 8px;
  right: 35px;
  :hover {
    background-color: ${({ theme }) => theme.shared.colors.blackLight};
  }
  :hover > svg .fill {
    fill: ${({ theme }) => theme.shared.colors.greyMedium};
  }
`;

const ListContainer = styled('ul')`
  list-style: none;
  margin-top: 0;
  padding-left: 0;
`;

const ListItem = styled('li')<{ isActive?: boolean }>`
  position: relative;
  padding: 10px 5px;
  font-family: TS3TextSans;
  font-size: 16px;
  line-height: 20px;
  border-bottom: ${({ theme }) =>
    `solid 1px ${theme.base.colors.frontListBorder}`};
  ${({ isActive }) =>
    isActive &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${({ theme }) => theme.base.colors.frontListButton};
      }
      &:hover ${ButtonFavorite} {
        background-color: ${({ theme }) => theme.base.colors.frontListButton};
      }
    `};
`;

const ListLabel = styled('span')<{ isActive?: boolean }>`
  max-width: calc(100% - 60px);
  display: inline-block;
  word-break: break-all;
  ${({ isActive }) =>
    !isActive &&
    css`
      color: ${({ theme }) => theme.base.colors.frontListLabel};
    `};
`;

const FrontList = ({ fronts, onSelect, onStar, searchString }: Props) => {
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
          {/* // onUnFavorite */}
          <ButtonFavorite
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onStar(front.id);
            }}
          >
            <StarIcon
              size="l"
              fill={theme.shared.colors.blackLight}
              outline={theme.shared.colors.greyMedium}
            />
          </ButtonFavorite>
          {!front.isOpen && (
            <ButtonAdd>
              <MoreIcon />
            </ButtonAdd>
          )}
        </ListItem>
      ))}
    </ListContainer>
  );
};

export default FrontList;
