import React from 'react';
import { styled } from 'constants/theme';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import type { FeastPackageHeader, PackageVisibility } from 'types/Packages';
import { PackageCard } from './PackageCard';

const ListContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: scroll;
	background: white;
`;

const ListHeader = styled.div`
	padding: 20px;
	border-bottom: 1px solid #ddd;
	background: #f9f9f9;
`;

const PackagesList = styled.ul`
	list-style: none;
	margin-left: 0.6em;
	margin-right: 0.6em;
	padding: 0;
`;

const CardHolder = styled.li`
	list-style: none;
	margin-bottom: 1em;
	padding-left: 0;
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
	packages: FeastPackageHeader[];
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
			<PackagesList>
				{packages.map((pkg) => (
					<CardHolder key={pkg.id}>
						<PackageCard
							pkg={pkg}
							disabled={disabled}
							onSelectPackage={onSelectPackage}
						/>
					</CardHolder>
				))}
			</PackagesList>
		)}
	</ListContainer>
);

export default PackageListView;
