import React, { createRef, useEffect, useState } from 'react';
import styled from 'styled-components';

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
	list-style: none;
	padding: 0;
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
	font-family: TS3TextSans, sans-serif;
	font-weight: normal;
	font-size: 12px;
	max-width: fit-content;
`;

const IconArea = styled.div`
	max-width: 60px;
	min-width: 60px;
	flex: 0;
`;

export const FeastCollectionMenu: React.FC<FeastCollectionMenuProps> = ({
	targetedRegions,
	excludedRegions,
	onExcludedRegionsChange,
	onTargetedRegionsChange,
	onRenameClicked,
	onDeleteClicked,
}) => {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const [menuTop, setMenuTop] = useState(0);
	const [menuLeft, setMenuLeft] = useState(0);

	const containerRef = createRef<HTMLDivElement>();

	useEffect(() => {
		if (isMenuOpen && !!containerRef.current) {
			setMenuTop(
				containerRef.current.offsetTop + containerRef.current.offsetHeight,
			);
			setMenuLeft(containerRef.current.offsetLeft);
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
					<ul style={{ padding: '0.2em', margin: '0.2em' }}>
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
