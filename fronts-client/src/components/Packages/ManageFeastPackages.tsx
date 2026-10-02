import React, { useState } from 'react';
import { styled } from 'constants/theme';
import { RecipeSearchContainer } from 'components/feed/RecipeSearchContainer';
import PackageCollectionBuilder from './PackageCollectionBuilder';
import PackageListHeader from './PackageListHeader';
import PackageListView from './PackageListView';
import { FeastPackage, PackageStatus } from 'types/Packages';
import { Typography } from '@guardian/stand/Typography';

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: calc(100vh - 80px);
	background-color: #f5f5f5;
`;

const ContentWrapper = styled.div`
	display: flex;
	flex: 1;
	min-height: 0;
`;

const LeftPanel = styled.div`
	width: 35%;
	border-right: 1px solid #ddd;
	background: white;
	overflow-y: auto;
	padding: 20px;
`;

const RightPanel = styled.div`
	width: 65%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

// Mock packages - need to replace with API call
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

interface ManageFeastPackagesProps {
	packageId?: string;
}

const ManageFeastPackages: React.FC<ManageFeastPackagesProps> = () => {
	const [selectedPackage, setSelectedPackage] = useState<FeastPackage | null>(
		null,
	);
	const [statusFilter, setStatusFilter] = useState<PackageStatus>('All');

	const handlePackageSelected = (pkg: FeastPackage) => {
		setSelectedPackage({
			...pkg,
			isModified: false,
		});
	};

	const handleCreateNewPackage = () => {
		const newPackage: FeastPackage = {
			id: `${Date.now()}`,
			displayName: '',
			status: 'DRAFT',
			standfirst: '',
			slots: [],
			metadata: {
				v1MetadataGap: '',
				prefillToggle: false,
			},
			isModified: true,
		};

		setSelectedPackage(newPackage);
	};

	const handleClosePackage = () => {
		setSelectedPackage(null);
	};

	return (
		<>
			<PageContainer>
				<ContentWrapper>
					<LeftPanel>
						<Typography element="h3" variant="headingSm">
							SEARCH LIBRARY
						</Typography>
						<RecipeSearchContainer />
					</LeftPanel>
					<RightPanel>
						<PackageListHeader
							statusFilter={statusFilter}
							onStatusChange={setStatusFilter}
							hasUnsavedChanges={!!selectedPackage?.isModified}
							onPackageSelected={handlePackageSelected}
							onCreateNewPackage={handleCreateNewPackage}
							onClose={handleClosePackage}
						/>
						{selectedPackage ? (
							<PackageCollectionBuilder
								package={selectedPackage}
								onPackageChange={setSelectedPackage}
								onClose={handleClosePackage}
							/>
						) : (
							<PackageListView
								packages={mockPackages}
								statusFilter={statusFilter}
								onSelectPackage={handlePackageSelected}
								onCreateNew={handleCreateNewPackage}
							/>
						)}
					</RightPanel>
				</ContentWrapper>
			</PageContainer>
		</>
	);
};

export default ManageFeastPackages;
