import React, { useState, useEffect, useMemo } from 'react';
import { TextInput } from '@guardian/stand/TextInput';
import { Button } from '@guardian/stand/Button';
import { styled } from 'constants/theme';
import { PackageStatus, FeastPackage } from 'types/Packages';
import debounce from 'lodash/debounce';

const HeaderContainer = styled.div`
	display: grid;
	align-items: center;
	gap: 15px;
	padding: 15px 20px;
	background: white;
	border-bottom: 1px solid #ddd;
	justify-content: space-between;
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

// Mock packages - replace with API call
const mockPackages: FeastPackage[] = [
	{
		id: '15001',
		displayName: "Chef Yottam's Mediterranean Summer Picks",
		status: 'LIVE',
		standfirst: 'Summer package...',
		slots: [],
	},
	{
		id: '15002',
		displayName: 'Vegan Mediterranean Dinner Feast',
		status: 'DRAFT',
		standfirst: 'Vegan package...',
		slots: [],
	},
	{
		id: '15003',
		displayName: 'Family Mediterranean Picnic',
		status: 'LIVE',
		standfirst: 'Family package...',
		slots: [],
	},
	{
		id: '15004',
		displayName: 'Mediterranean Tapas Package',
		status: 'DRAFT',
		standfirst: 'Tapas package...',
		slots: [],
	},
];

interface PackageListHeaderProps {
	statusFilter: PackageStatus;
	onStatusChange: (status: PackageStatus) => void;
	hasUnsavedChanges: boolean;
	onPackageSelected: (pkg: FeastPackage) => void;
	onCreateNewPackage?: () => void;
	onClose?: () => void;
}

const PackageListHeader: React.FC<PackageListHeaderProps> = ({
	statusFilter,
	onStatusChange,
	hasUnsavedChanges,
	onPackageSelected,
	onCreateNewPackage,
	onClose,
}) => {
	const statuses: PackageStatus[] = ['All', 'Draft', 'Live', 'Archived'];
	const [searchQuery, setSearchQuery] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchResults, setSearchResults] = useState<FeastPackage[]>([]);

	const debouncedSearch = useMemo(
		() =>
			debounce((query: string) => {
				if (query.trim()) {
					// Filter 1: Search by display name
					let filtered = mockPackages.filter((pkg) =>
						pkg.displayName.toLowerCase().includes(query.toLowerCase()),
					);

					// Filter 2: Apply status filter (NEW!)
					if (statusFilter !== 'All') {
						const normalizedStatus = statusFilter.toUpperCase();
						filtered = filtered.filter(
							(pkg) => pkg.status === normalizedStatus,
						);
					}

					// Update results
					setSearchResults(filtered);
					setShowDropdown(filtered.length > 0);
				} else {
					// No search text - clear results
					setSearchResults([]);
					setShowDropdown(false);
				}
			}, 300),
		[statusFilter], // Re-create when statusFilter changes
	);

	useEffect(() => {
		debouncedSearch(searchQuery);
	}, [searchQuery, debouncedSearch]);

	const handleSelectPackage = (pkg: FeastPackage) => {
		onPackageSelected(pkg);
		setSearchQuery('');
		setShowDropdown(false);
	};

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
						label=""
						placeholder="Search / Find Package"
						value={searchQuery}
						onChange={(value) => setSearchQuery(value)}
						onFocus={() => searchQuery && setShowDropdown(true)}
					/>
					{showDropdown && searchResults.length > 0 && (
						<DropdownMenu>
							{searchResults.map((pkg) => (
								<DropdownItem
									key={pkg.id}
									onClick={() => handleSelectPackage(pkg)}
								>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
										}}
									>
										<span>{pkg.displayName}</span>
										<span style={{ fontSize: '11px', color: '#999' }}>
											({pkg.status})
										</span>
									</div>
								</DropdownItem>
							))}
						</DropdownMenu>
					)}
				</SearchDropdownContainer>

				<ButtonGroup>
					{statuses.map((status) => (
						<Button
							key={status}
							onPress={() => onStatusChange(status)}
							size="sm"
							variant={statusFilter === status ? 'primary' : 'secondary'}
						>
							{status}
						</Button>
					))}
				</ButtonGroup>

				<Button
					onPress={() => {
						if (onCreateNewPackage) {
							onCreateNewPackage();
						}
					}}
					size="md"
					variant="primary"
				>
					+ New Package
				</Button>

				<Button
					onPress={() => {
						if (onClose) {
							onClose();
						}
					}}
					size="sm"
					variant="secondary"
				>
					[Close]
				</Button>
			</ControlsContainer>
		</HeaderContainer>
	);
};

export default PackageListHeader;
