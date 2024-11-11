import React from 'react';
import { styled, css, theme } from 'constants/theme';

import ButtonCircular from 'components/inputs/ButtonCircular';
import { MoreIcon, StarIcon } from 'components/icons/Icons';
import TextHighlighter from './util/TextHighlighter';

interface Props {
	fronts: Array<{
		id: string;
		displayName?: string;
		isOpen: boolean;
		isStarred: boolean;
	}>;
	renderOnlyStarred?: boolean;
	onSelect: (frontId: string) => void;
	onStar: (frontId: string) => void;
	onUnfavourite: (frontId: string) => void;
	searchString?: string;
}

const ButtonAdd = styled(ButtonCircular)`
	background-color: ${theme.front.frontListButton};
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
	background-color: ${theme.colors.blackLight};
	:hover {
		background-color: ${theme.colors.blackLight};
	}
	svg .fill {
		fill: ${theme.colors.blackLight};
	}
	/* Double && needed to override css specificity of ListItem with isActive set */
	&&:hover svg .fill,
	&&:hover svg .outline {
		fill: ${theme.colors.greyMedium};
	}

	${({ isStarred }) =>
		!!isStarred &&
		css`
			svg .outline,
			svg .fill {
				fill: ${`${theme.colors.orangeLight}`};
			}
			&:hover svg .outline {
				fill: ${theme.colors.greyMedium};
			}
		`}
`;

const ListContainer = styled.ul`
	list-style: none;
	margin-top: 0;
	padding-left: 0;
`;

const ListItem = styled.li<{ isActive?: boolean; isStarred?: boolean }>`
	position: relative;
	padding: 10px 5px;
	font-family: TS3TextSans;
	font-size: 16px;
	line-height: 20px;
	border-bottom: ${`solid 1px ${theme.front.frontListBorder}`};
	${({ isActive }) =>
		isActive &&
		css<{ isStarred?: boolean }>`
			cursor: pointer;
			:hover {
				background-color: ${theme.front.frontListButton};
			}
			:hover ${ButtonFavorite} {
				background-color: ${theme.front.frontListButton};
			}
			:hover svg .fill {
				fill: ${({ isStarred }) =>
					isStarred ? theme.colors.orangeLight : theme.front.frontListButton};
			}
		`};
`;

const ListLabel = styled.span<{ isActive?: boolean }>`
	max-width: calc(100% - 60px);
	display: inline-block;
	word-break: break-all;
	${({ isActive }) =>
		!isActive &&
		css`
			color: ${theme.front.frontListLabel};
		`};
`;

const FrontList = ({
	fronts,
	renderOnlyStarred,
	onSelect,
	onStar,
	onUnfavourite,
	searchString,
}: Props) => {
	if (!fronts) {
		return null;
	}
	const frontsToRender = renderOnlyStarred
		? fronts.filter((_) => _.isStarred)
		: searchString
			? fronts.filter((_) => _.id.includes(searchString))
			: fronts;
	return (
		<ListContainer>
			{frontsToRender.map((front) => (
				<ListItem
					data-testid="fronts-menu-item"
					isActive={!front.isOpen}
					isStarred={!!front.isStarred}
					key={front.id}
					onClick={!front.isOpen ? () => onSelect(front.id) : undefined}
				>
					<ListLabel isActive={!front.isOpen}>
						<TextHighlighter
							originalString={front.displayName || front.id}
							searchString={searchString}
						/>
					</ListLabel>
					<ButtonFavorite
						isStarred={!!front.isStarred}
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.stopPropagation();
							return !!front.isStarred
								? onUnfavourite(front.id)
								: onStar(front.id);
						}}
					>
						<StarIcon
							size="l"
							fill={theme.colors.blackLight}
							outline={theme.colors.greyMedium}
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
