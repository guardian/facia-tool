import React from 'react';
import { styled } from 'constants/theme';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import { FeastPackage, PackageStatus } from 'types/Packages';

const ListContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	background: white;
`;

const ListHeader = styled.div`
	padding: 20px;
	border-bottom: 1px solid #ddd;
	background: #f9f9f9;
`;

const PackagesGrid = styled.div`
	flex: 1;
	overflow-y: auto;
	display: grid;
	gap: 12px;
	padding: 20px;
	grid-template-columns: 1fr;
`;

const PackageCard = styled.div`
	border: 1px solid #ddd;
	border-radius: 4px;
	padding: 15px;
	background: white;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	justify-content: space-between;
	align-items: center;

	&:hover {
		border-color: #0084f0;
		box-shadow: 0 2px 8px rgba(0, 132, 240, 0.1);
	}
`;

const PackageInfo = styled.div`
	flex: 1;
`;

const PackageName = styled.h4`
	margin: 0 0 8px 0;
	font-size: 14px;
	font-weight: 600;
	color: #333;
`;

const PackageMeta = styled.div`
	display: flex;
	gap: 15px;
	font-size: 12px;
	color: #666;
`;

const StatusBadge = styled.span<{ status: string }>`
	padding: 4px 8px;
	border-radius: 3px;
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	background-color: ${(props) => {
		switch (props.status) {
			case 'LIVE':
				return '#e8f5e9';
			case 'DRAFT':
				return '#fff3e0';
			case 'ARCHIVED':
				return '#f5f5f5';
			default:
				return '#f5f5f5';
		}
	}};
	color: ${(props) => {
		switch (props.status) {
			case 'LIVE':
				return '#2e7d32';
			case 'DRAFT':
				return '#e65100';
			case 'ARCHIVED':
				return '#666';
			default:
				return '#666';
		}
	}};
`;

const ActionButton = styled(Button)`
	margin-left: 10px;
`;

const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
	padding: 40px 20px;
	text-align: center;
	color: #999;
`;

interface PackageListViewProps {
	packages: FeastPackage[];
	statusFilter: PackageStatus;
	onSelectPackage: (pkg: FeastPackage) => void;
	onCreateNew: () => void;
}

const PackageListView: React.FC<PackageListViewProps> = ({
	packages,
	statusFilter,
	onSelectPackage,
	onCreateNew,
}) => {
	const filteredPackages = packages.filter((pkg) => {
		if (statusFilter === 'All') return true;
		return pkg.status === statusFilter.toUpperCase();
	});

	return (
		<ListContainer>
			<ListHeader>
				<Typography element="h3" variant="headingSm">
					All Packages ({filteredPackages.length})
				</Typography>
				<div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
					Filter: {statusFilter}
				</div>
			</ListHeader>

			{filteredPackages.length === 0 ? (
				<EmptyState>
					<Typography element="p" variant="bodySm">
						No packages found for "{statusFilter}" status
					</Typography>
					<Button
						onPress={onCreateNew}
						size="md"
						variant="primary"
						style={{ marginTop: '15px' }}
					>
						+ Create New Package
					</Button>
				</EmptyState>
			) : (
				<PackagesGrid>
					{filteredPackages.map((pkg) => (
						<PackageCard key={pkg.id} onClick={() => onSelectPackage(pkg)}>
							<PackageInfo>
								<PackageName>{pkg.displayName}</PackageName>
								<PackageMeta>
									<span>ID: {pkg.id}</span>
									<span>{pkg.slots.length} recipes</span>
									<StatusBadge status={pkg.status}>{pkg.status}</StatusBadge>
								</PackageMeta>
								{pkg.standfirst && (
									<div
										style={{
											fontSize: '12px',
											color: '#999',
											marginTop: '5px',
										}}
									>
										{pkg.standfirst.substring(0, 100)}
										{pkg.standfirst.length > 100 ? '...' : ''}
									</div>
								)}
							</PackageInfo>
							<ActionButton
								onPress={() => onSelectPackage(pkg)}
								size="sm"
								variant="primary"
							>
								Edit
							</ActionButton>
						</PackageCard>
					))}
				</PackagesGrid>
			)}
		</ListContainer>
	);
};

export default PackageListView;
