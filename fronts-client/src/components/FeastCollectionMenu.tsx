import React, { createRef, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../types/State';
import { createSelector } from 'reselect';

interface FeastCollectionMenuProps {
	containerId: string;
	targetedRegions: string[];
	excludedRegions: string[];
	onTargetedRegionsChange: (updated: string[]) => void;
	onExcludedRegionsChange: (updated: string[]) => void;
	onRenameClicked: () => void;
	onDeleteClicked: () => void;
}

const IconContainer = styled.div`
	display: inline;
	margin: 8px;
	cursor: pointer;
`;

const MenuOuterBody = styled.div`
	float: left;
	position: absolute;
	background-color: white;
`;

const MenuItem = styled.li`
	padding: 0.4em;
	border-bottom: 1px gray;
	:hover {
		background-color: lightgrey;
	}
`;

const PartitionedBox = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const TextArea = styled.div`
	flex: 1;
	max-width: fit-content;
`;

const IconArea = styled.div`
	max-width: 60px;
	min-width: 60px;
	flex: 0;
`;
export const FeastCollectionMenu: React.FC<FeastCollectionMenuProps> = ({
	containerId,
	// targetedRegions,
	// excludedRegions,
	// onExcludedRegionsChange,
	// onTargetedRegionsChange,
	onRenameClicked,
	onDeleteClicked,
}) => {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const [menuTop, setMenuTop] = useState(0);
	const [menuLeft, setMenuLeft] = useState(0);

	const containerRef = createRef<HTMLDivElement>();

	const dispatch = useDispatch<State>();
	const selectContainer = (state: State) => state.collections.data[containerId];

	const selectTargetedRegions = createSelector(
		[selectContainer],
		(container) => container.targetedRegions,
	);

	const selectExcludedRegions = createSelector(
		[selectContainer],
		(container) => container.excludedRegions,
	);
	const targetedRegions = useSelector(selectTargetedRegions);
	const excludedRegions = useSelector(selectExcludedRegions);

	useEffect(() => {
		if (isMenuOpen && !!containerRef.current) {
			setMenuTop(
				containerRef.current.clientTop + containerRef.current.clientHeight,
			);
			setMenuLeft(containerRef.current.clientLeft);
		} else {
			setMenuTop(0);
			setMenuLeft(0);
		}
	}, [isMenuOpen]);

	const clickedUsOnly = () => {
		if (targetedRegions.includes('us')) {
			onTargetedRegionsChange(targetedRegions.filter((_) => _ != 'us'));
		} else {
			onTargetedRegionsChange(['us', ...targetedRegions]);
		}
	};

	return (
		<>
			<IconContainer
				ref={containerRef}
				onClick={() => setMenuOpen((prev) => !prev)}
			>
				<pre>opts</pre>
			</IconContainer>
			{isMenuOpen && menuTop > 0 ? (
				<MenuOuterBody style={{ top: menuTop, left: menuLeft }}>
					<ul>
						<MenuItem onClick={clickedUsOnly}>
							<PartitionedBox>
								<TextArea>US Only</TextArea>
								<IconArea>
									{targetedRegions.includes('us') ? <TickIcon /> : undefined}
								</IconArea>
							</PartitionedBox>
						</MenuItem>
					</ul>
				</MenuOuterBody>
			) : undefined}
		</>
	);
};
