import React, { createRef, useState } from 'react';
import styled from 'styled-components';

interface FeastCollectionMenuProps {
	containerId: string;
	containerAlias?: string;
	onContainerAliasChange: (newValue: string|undefined) => void;
	onRenameClicked: () => void;
	onDeleteClicked: () => void;
}

const IconContainer = styled.div`
	display: inline;
	margin: 8px;
	cursor: pointer;
`;

const MenuOuter = styled.div`
	position: absolute;
	top: 60%;
	right: 0;
	background-color: white;
	border: 1px solid #ddd;
	border-radius: 4px;
	margin-top: -5px;
	list-style: none;
	padding: 0;
	width: 160px;
	z-index: 1000;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MenuItem = styled.li`
	font-family: TS3TextSans, sans-serif;
	font-weight: normal;
	font-size: 12px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1px;
	height: 30px;
	cursor: pointer;
	border-bottom: 1px gray;
	:hover {
		background-color: lightgrey;
	}
`;

const Icon = styled.span`
	margin-left: 10px;
	margin-right: 50px;
	font-size: 14px;
	color: #0d3349;
`;

export const FeastCollectionMenu: React.FC<FeastCollectionMenuProps> = ({
	onRenameClicked,
	onDeleteClicked,
	containerAlias,
	onContainerAliasChange
}) => {
	const [isMenuOpen, setMenuOpen] = useState(false);

	const containerRef = createRef<HTMLDivElement>();

	const clickedDotd = () => {
		if(containerAlias=='dotd') {
			onContainerAliasChange(undefined);
		} else {
			onContainerAliasChange('dotd');
		}

		setMenuOpen(false);
	}

	return (
		<>
			<IconContainer
				ref={containerRef}
				onClick={() => {
					setMenuOpen((prev) => !prev);
				}}
			>
				<pre style={{ padding: 0, margin: 0 }}>&#x22EE;</pre>
			</IconContainer>
			{isMenuOpen ? (
				<>
					<MenuOuter>
						<MenuItem onClick={()=>{
							clickedDotd();
							setMenuOpen(false);
						}}>
							Dish of the Day
							<Icon>
								{containerAlias=='dotd' ? <h2>&#x2713;</h2> : undefined}
							</Icon>
						</MenuItem>
						<MenuItem
							onClick={() => {
								onRenameClicked();
								setMenuOpen(false);
							}}
						>
							Rename <Icon> </Icon>
						</MenuItem>
						<MenuItem
							onClick={() => {
								onDeleteClicked();
								setMenuOpen(false);
							}}
						>
							Delete <Icon> </Icon>
						</MenuItem>
					</MenuOuter>
				</>
			) : undefined}
		</>
	);
};
