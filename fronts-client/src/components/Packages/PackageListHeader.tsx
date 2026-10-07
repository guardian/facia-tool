import React, { useState } from 'react';
import { TextInput } from '@guardian/stand/TextInput';
import { Button } from '@guardian/stand/Button';
import { styled } from 'constants/theme';
import type { FeastPackageHeader, PackageVisibility } from 'types/Packages';

const HeaderContainer = styled.div`
	display: grid;
	align-items: center;
	gap: 15px;
	padding: 15px 20px;
	background: white;
	border-bottom: 1px solid #ddd;
	justify-content: space-between;
	flex-shrink: 0;
`;

const Title = styled.h1`
	margin: 0;
	font-size: 24px;
	display: inline-flex;
	align-items: center;
	gap: 10px;
	white-space: nowrap;
`;

const StatusIndicator = styled.span`
	color: #d00;
	font-size: 14px;
	font-weight: normal;
`;

const ControlsContainer = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 10px;
	flex: 1;
	margin-left: 20px;
	flex-wrap: wrap;
`;

const SearchDropdownContainer = styled.div`
	position: relative;
	flex-grow: 1;
	max-width: 350px;
	min-width: 200px;
`;

const DropdownMenu = styled.div`
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	background: white;
	border: 1px solid #0084f0;
	border-radius: 4px;
	max-height: 300px;
	overflow-y: auto;
	z-index: 1000;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.div<{ isSelected?: boolean }>`
	padding: 12px 15px;
	cursor: pointer;
	background-color: ${(props) => (props.isSelected ? '#e3f2fd' : 'white')};
	border-bottom: 1px solid #eee;
	font-size: 14px;
	transition: background-color 0.2s;

	&:hover {
		background-color: #f5f5f5;
	}

	&:last-child {
		border-bottom: none;
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 5px;
`;

interface PackageListHeaderProps {
	query: string;
	onQueryChange: (query: string) => void;
	searchResults: FeastPackageHeader[];
	loading: boolean;
	visibility: PackageVisibility;
	onVisibilityChange: (visibility: PackageVisibility) => void;
	hasUnsavedChanges: boolean;
	disabled: boolean;
	onPackageSelected: (id: string) => void;
	onCreateNewPackage: () => void;
	onClose: () => void;
}

const visibilityOptions: PackageVisibility[] = ['All', 'Visible', 'Hidden'];

const PackageListHeader: React.FC<PackageListHeaderProps> = ({
	query,
	onQueryChange,
	searchResults,
	loading,
	visibility,
	onVisibilityChange,
	hasUnsavedChanges,
	disabled,
	onPackageSelected,
	onCreateNewPackage,
	onClose,
}) => {
	const [showDropdown, setShowDropdown] = useState(false);

	return (
		<HeaderContainer>
			<Title>
				Manage Feast Packages
				{hasUnsavedChanges && (
					<StatusIndicator>(Unsaved changes)</StatusIndicator>
				)}
			</Title>

			<ControlsContainer>
				<SearchDropdownContainer>
					<TextInput
						label="Find package"
						placeholder="Search package names"
						value={query}
						onChange={(value) => {
							onQueryChange(value);
							setShowDropdown(true);
						}}
						onFocus={() => setShowDropdown(true)}
						isDisabled={disabled}
					/>

					{showDropdown && query.trim() && (
						<DropdownMenu>
							{loading ? (
								<p role="status">Searching...</p>
							) : searchResults.length === 0 ? (
								<p>No matching packages.</p>
							) : (
								searchResults.map((pkg) => (
									<DropdownItem key={pkg.id}>
										<Button
											size="sm"
											variant="secondary"
											isDisabled={disabled}
											onPress={() => {
												setShowDropdown(false);
												onPackageSelected(pkg.id);
											}}
										>
											{pkg.name} ({pkg.isHidden ? 'Hidden' : 'Visible'})
										</Button>
									</DropdownItem>
								))
							)}
						</DropdownMenu>
					)}
				</SearchDropdownContainer>

				<ButtonGroup>
					{visibilityOptions.map((option) => (
						<Button
							key={option}
							size="sm"
							variant={visibility === option ? 'primary' : 'secondary'}
							isDisabled={disabled}
							onPress={() => onVisibilityChange(option)}
						>
							{option}
						</Button>
					))}
				</ButtonGroup>

				<Button
					size="md"
					variant="primary"
					isDisabled={disabled}
					onPress={onCreateNewPackage}
				>
					+ New Package
				</Button>

				<Button
					size="sm"
					variant="secondary"
					isDisabled={disabled}
					onPress={onClose}
				>
					Close
				</Button>
			</ControlsContainer>
		</HeaderContainer>
	);
};

export default PackageListHeader;
