import React, { useMemo } from 'react';
import { styled } from '../../constants/theme';
import { Button } from '@guardian/stand/Button';
import { FeastPackageHeader } from '../../types/Packages';
import { Typography } from '@guardian/stand/Typography';
import { Avatar } from '@guardian/stand/Avatar';
import { format as formatDate } from 'date-fns';
import { VisibilityBadge } from './VisibilityBadge';

const PackageCardStyle = styled.div`
	border: 1px solid #ddd;
	border-radius: 4px;
	padding: 15px;
	background: white;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-height: 10em;
	height: fit-content;
	overflow: hidden;

	&:hover {
		border-color: #0084f0;
		box-shadow: 0 2px 8px rgba(0, 132, 240, 0.1);
	}
`;

const PackageInfo = styled.div`
	flex: 1;
`;

const PackageMeta = styled.div`
	display: flex;
	gap: 15px;
	font-size: 12px;
	color: #666;
`;

interface PackageCardProps {
	pkg: FeastPackageHeader;
	disabled: boolean;
	onSelectPackage: (packageId: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
	pkg,
	disabled,
	onSelectPackage,
}) => {
	const createdByInitials: string = useMemo(() => {
		const words = pkg.createdBy
			?.split(/[\s.]+/)
			.filter((w) => !!w && w.length > 0);
		return words?.map((word) => word[0].toLocaleUpperCase()).join('') ?? '';
	}, [pkg]);

	const createdOn: string = useMemo(() => {
		if (!pkg.updatedOn) {
			return pkg.createdOn
				? formatDate(pkg.createdOn, 'HH:mm on ddd Do MMM YYYY')
				: '';
		} else {
			return formatDate(pkg.updatedOn, 'HH:mm on ddd Do MMM YYYY');
		}
	}, [pkg]);

	const lastModifiedInitials: string = useMemo(() => {
		const words = pkg.updatedBy
			?.split(/[\s.]+/)
			.filter((w) => !!w && w.length > 0);
		return words?.map((word) => word[0].toLocaleUpperCase()).join('') ?? '';
	}, [pkg]);

	return (
		<PackageCardStyle>
			<PackageInfo>
				<Typography variant="headingCompactLg">{pkg.name}</Typography>

				<PackageMeta>
					{createdByInitials === '' ? undefined : (
						<Avatar color="coolPurple" size="md" initials={createdByInitials} />
					)}
					{lastModifiedInitials === '' ||
					lastModifiedInitials === createdByInitials ? undefined : (
						<Avatar
							color="coolPurple"
							size="md"
							initials={lastModifiedInitials}
						/>
					)}
				</PackageMeta>

				<ul style={{ listStyle: 'none', marginTop: '1em', padding: 0 }}>
					{pkg.metadata?.bodyText && (
						<li>
							<Typography variant="bodyCompactMd">
								{pkg.metadata.bodyText}
							</Typography>
						</li>
					)}

					<li style={{ marginTop: '0.4em', marginBottom: '0.4em' }}>
						<VisibilityBadge isHidden={pkg.isHidden} />
					</li>

					<li>
						{pkg.createdBy &&
						(!pkg.updatedOn || pkg.updatedOn == pkg.createdOn) ? (
							<Typography variant="bodyItalicSm">
								Created by {pkg.createdBy} at {createdOn}
							</Typography>
						) : undefined}
						{pkg.updatedOn && pkg.updatedOn != pkg.createdOn ? (
							<Typography variant="bodyItalicSm">
								Last updated by {pkg.createdBy} at {createdOn}
							</Typography>
						) : undefined}
					</li>
				</ul>
			</PackageInfo>

			<PackageInfo
				style={{
					flex: 0,
					flexDirection: 'column',
					height: '100%',
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Button
					size="sm"
					variant="primary"
					isDisabled={disabled}
					onPress={() => onSelectPackage(pkg.id)}
				>
					Edit
				</Button>
			</PackageInfo>
		</PackageCardStyle>
	);
};
