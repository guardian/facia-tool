import React from 'react';
import { css } from 'styled-components';
import { styled, theme as styleTheme } from 'constants/theme';

import ButtonCircular from 'shared/components/input/ButtonCircular';
import { MoreIcon, StarIcon } from 'shared/components/icons/Icons';
import TextHighlighter from './util/TextHighlighter';

interface Props {
  fronts: Array<{ id: string; isOpen: boolean; isStarred: boolean }>;
  renderOnlyStarred?: boolean;
  onSelect: (frontId: string) => void;
  onStar: (frontId: string) => void;
  onUnstar: (frontId: string) => void;
  searchString?: string;
}

const ButtonAdd = styled(ButtonCircular)`
  background-color: ${({ theme }) => theme.base.colors.frontListButton};
  position: absolute;
  top: 8px;
  right: 5px;
  padding: 3px;
`;

const ButtonFavorite = styled(ButtonCircular)<{ isStarred: boolean }>`
  position: absolute;
  top: 8px;
  right: 35px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.shared.colors.blackLight};
  :hover {
    background-color: ${({ theme }) => theme.shared.colors.blackLight};
  }
  svg .fill {
    fill: ${({ theme }) => theme.shared.colors.blackLight};
  }
  &:hover svg .fill,
  &:hover svg .outline {
    fill: ${({ theme }) => theme.shared.colors.greyMedium};
  }

  ${({ isStarred }) =>
    !!isStarred &&
    css`
      svg .outline,
      svg .fill {
        fill: ${({ theme }) => `${theme.shared.colors.orangeLight}`};
      }
      &:hover svg .outline {
        fill: ${({ theme }) => theme.shared.colors.greyMedium};
      }
    `}
`;

const ListContainer = styled('ul')`
  list-style: none;
  margin-top: 0;
  padding-left: 0;
`;

const ListItem = styled('li')<{ isActive?: boolean; isStarred?: boolean }>`
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
      :hover {
        background-color: ${({ theme }) => theme.base.colors.frontListButton};
      }
      :hover ${ButtonFavorite} {
        background-color: ${({ theme }) => theme.base.colors.frontListButton};
      }
      :hover svg .fill {
        fill: ${({ theme, isStarred }) =>
          isStarred
            ? theme.base.colors.orangeLight
            : theme.base.colors.frontListButton};
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

const FrontList = ({
  fronts,
  renderOnlyStarred,
  onSelect,
  onStar,
  onUnstar,
  searchString
}: Props) => {
  if (!fronts) {
    return null;
  }
  const frontsToRender = renderOnlyStarred
    ? fronts.filter(_ => _.isStarred)
    : searchString
    ? fronts.filter(_ => _.id.includes(searchString))
    : fronts;
  return (
    <ListContainer>
      {frontsToRender.map(front => (
        <ListItem
          isActive={!front.isOpen}
          isStarred={!!front.isStarred}
          key={front.id}
          onClick={!front.isOpen ? () => onSelect(front.id) : undefined}
        >
          <ListLabel isActive={!front.isOpen}>
            <TextHighlighter
              originalString={front.id}
              searchString={searchString}
            />
          </ListLabel>
          <ButtonFavorite
            isStarred={!!front.isStarred}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              return !!front.isStarred ? onUnstar(front.id) : onStar(front.id);
            }}
          >
            <StarIcon
              size="l"
              fill={styleTheme.shared.colors.blackLight}
              outline={styleTheme.shared.colors.greyMedium}
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
