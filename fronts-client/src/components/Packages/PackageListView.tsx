import React from 'react';
import { styled } from 'constants/theme';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import type { FeastPackage, PackageVisibility } from 'types/Packages';

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

const StatusBadge = styled.span`
	padding: 4px 8px;
	border-radius: 3px;
	font-size: 11px;
	font-weight: 600;
	background-color: #f5f5f5;
	color: #333;
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
	visibility: PackageVisibility;
	disabled: boolean;
	onSelectPackage: (id: string) => void;
	onCreateNew: () => void;
}

const PackageListView: React.FC<PackageListViewProps> = ({
	packages,
	visibility,
	disabled,
	onSelectPackage,
	onCreateNew,
}) => (
	<ListContainer>
		<ListHeader>
			<Typography element="h3" variant="headingSm">
				Packages ({packages.length})
			</Typography>
			<p>
				Visibility: {visibility}. Showing up to 20 matching packages; search by
				name to narrow the results.
			</p>
		</ListHeader>

		{packages.length === 0 ? (
			<EmptyState>
				<Typography element="p" variant="bodySm">
					No matching packages.
				</Typography>
				<Button
					size="md"
					variant="primary"
					isDisabled={disabled}
					onPress={onCreateNew}
				>
					+ Create New Package
				</Button>
			</EmptyState>
		) : (
			<PackagesGrid>
				{packages.map((pkg) => (
					<PackageCard key={pkg.id}>
						<PackageInfo>
							<PackageName>{pkg.name}</PackageName>

							<PackageMeta>
								<span>ID: {pkg.id}</span>
								<span>{pkg.items.length} items</span>
								<StatusBadge>{pkg.isHidden ? 'Hidden' : 'Visible'}</StatusBadge>
							</PackageMeta>

							{pkg.metadata?.bodyText && <p>{pkg.metadata.bodyText}</p>}
						</PackageInfo>

						<ActionButton
							size="sm"
							variant="primary"
							isDisabled={disabled}
							onPress={() => onSelectPackage(pkg.id)}
						>
							Edit
						</ActionButton>
					</PackageCard>
				))}
			</PackagesGrid>
		)}
	</ListContainer>
);

export default PackageListView;
