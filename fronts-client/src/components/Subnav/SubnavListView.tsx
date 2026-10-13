import React from 'react';
import { css } from '@emotion/react';
import format from 'date-fns/format';
import { Grid, Item } from '@guardian/stand/Grid';
import { Typography } from '@guardian/stand/Typography';
import {
	Table,
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHeader,
	TableRow,
} from '@guardian/stand/Table';
import { Badge } from '@guardian/stand/Badge';
import { Icon } from '@guardian/stand/Icon';
import { theme } from 'constants/theme';
import { SubnavListEntry } from './helpers';
import { CustomSubnav } from './types';
import { ListViewSidebar, Panel, PanelThumb, PanelThumbEmpty } from './styles';

interface SubnavListViewProps {
	entries: SubnavListEntry[];
	isLoading: boolean;
	onEdit: (id: string) => void;
}

const panelsGridTheme = {
	shared: {
		direction: 'row',
		wrap: 'nowrap',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	lg: {
		columns: 2,
		gap: '16px',
		paddingRight: '60px',
	},
};

const tableColumns = {
	sm: 'minmax(0, 1fr)',
	lg: 'minmax(0, 2.4fr) 130px 141px',
};

const subnavCellStyles = css`
	display: flex;
	align-items: center;
	gap: 12px;
	min-width: 0;
`;

const thumbWrapStyles: React.CSSProperties = {
	flex: '0 0 auto',
	lineHeight: 0,
};

const subnavTextStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
	minWidth: 0,
};

const titleLinkStyles = css`
	text-decoration: none;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const rowStyles = css`
	cursor: pointer;
`;

const metaStyles = css`
	color: ${theme.base.colors.textMuted};
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const mutedText = css`
	color: ${theme.base.colors.textMuted};
`;

const emptyStyle = css`
	display: block;
	padding: 12px;
	color: ${theme.base.colors.textMuted};
`;

const badgeGroupStyle: React.CSSProperties = {
	display: 'inline-flex',
	gap: '6px',
	flexWrap: 'wrap',
};

const tableHeaderStyles = css`
	& > tr {
		align-items: center;
	}
`;

const columnHeaderText = css`
	font-size: 14px;
`;

const formatUpdated = (lastUpdated: number) =>
	format(lastUpdated, 'ddd D MMM YYYY');

const StatusBadges = ({
	hasLive,
	hasDraft,
}: {
	hasLive: boolean;
	hasDraft: boolean;
}) => (
	<span style={badgeGroupStyle}>
		{hasLive && (
			<Badge color="green" size="sm" weight="strong">
				Live
			</Badge>
		)}
		{hasDraft && (
			<Badge color="orange" size="sm" weight="strong">
				{hasLive ? 'Draft changes' : 'New draft'}
			</Badge>
		)}
	</span>
);

// Completion across the three required sections, mapped to a 0/33/66/100 scale.
const requiredProgress = (subnav: CustomSubnav) => {
	const hasHeader = subnav.header.headerText.trim().length > 0;
	const hasLink = subnav.links.some((link) => link.linkText.trim().length > 0);
	const hasPage = subnav.pages.some((page) => page.path.trim().length > 0);
	return [hasHeader, hasLink, hasPage].filter(Boolean).length;
};

const progressPercent = [0, 33, 66, 100];

const DraftStatusBadge = ({ subnav }: { subnav: CustomSubnav }) => {
	const completed = requiredProgress(subnav);
	if (completed === 3) {
		return (
			<Badge color="warmPurple" size="sm" weight="light">
				Ready to launch
			</Badge>
		);
	}
	return (
		<Badge color="yellow" size="sm" weight="light">
			Draft • {progressPercent[completed]}%
		</Badge>
	);
};

const SubnavListPanel = ({
	status,
	entries,
	onEdit,
}: {
	status: 'live' | 'draft';
	entries: SubnavListEntry[];
	onEdit: (id: string) => void;
}) => {
	const heading = status === 'live' ? 'Launched subnavs' : 'Draft subnavs';
	const emptyMessage =
		status === 'live' ? 'No launched subnavs yet.' : 'No draft subnavs yet.';
	return (
		<Panel>
			<Table aria-label={heading} columns={tableColumns} headerVisibleFrom="lg">
				<TableHeader cssOverrides={tableHeaderStyles}>
					<TableColumnHeader isRowHeader>
						<Typography element="h2" variant="headingSm">
							{heading}
						</Typography>
					</TableColumnHeader>
					<TableColumnHeader cssOverrides={columnHeaderText}>
						Last updated
					</TableColumnHeader>
					<TableColumnHeader cssOverrides={columnHeaderText}>
						Status
					</TableColumnHeader>
				</TableHeader>
				<TableBody
					renderEmptyState={() => (
						<Typography element="p" variant="bodySm" cssOverrides={emptyStyle}>
							{emptyMessage}
						</Typography>
					)}
				>
					{entries.map(({ id, subnav, hasLive, hasDraft }) => {
						const imageSrc = subnav.images?.[0]?.imageSrc;
						const title = subnav.header.headerText || 'Untitled subnav';
						const meta = [...subnav.links.map((link) => link.linkText)]
							.filter(Boolean)
							.slice(0, 2)
							.join(' · ');
						const metaLength = subnav.links.length;
						return (
							<TableRow
								key={id}
								id={id}
								onAction={() => onEdit(id)}
								aria-label={`Edit ${title}`}
								cssOverrides={rowStyles}
							>
								<TableCell
									gridColumn={{ lg: '1' }}
									cssOverrides={subnavCellStyles}
								>
									{imageSrc ? (
										<span style={thumbWrapStyles}>
											<PanelThumb url={imageSrc} />
										</span>
									) : (
										<span style={thumbWrapStyles}>
											<PanelThumbEmpty>
												<Icon symbol="image" size="sm" alt="" />
												No image
											</PanelThumbEmpty>
										</span>
									)}
									<span style={subnavTextStyle}>
										<Typography
											element="span"
											variant="bodyBoldSm"
											cssOverrides={titleLinkStyles}
										>
											{title}
										</Typography>
										{meta && (
											<Typography
												element="span"
												variant="bodySm"
												cssOverrides={metaStyles}
											>
												{meta}

												{metaLength > 2 && ` and ${metaLength - 2} more`}
											</Typography>
										)}
									</span>
								</TableCell>
								<TableCell
									compactLabel="Last updated: "
									gridColumn={{ lg: '2' }}
									cssOverrides={mutedText}
								>
									{formatUpdated(subnav.lastUpdated)}
								</TableCell>
								{status === 'live' ? (
									<TableCell compactLabel="Status: " gridColumn={{ lg: '3' }}>
										<StatusBadges hasLive={hasLive} hasDraft={hasDraft} />
									</TableCell>
								) : (
									<TableCell compactLabel="Status: " gridColumn={{ lg: '3' }}>
										<DraftStatusBadge subnav={subnav} />
									</TableCell>
								)}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</Panel>
	);
};

export const SubnavListView = ({
	entries,
	isLoading,
	onEdit,
}: SubnavListViewProps) => {
	const draftEntries = entries.filter((entry) => entry.hasDraft);

	const publishedEntries = entries.filter(
		(entry) => entry.hasLive && !entry.hasDraft,
	);

	return (
		<>
			<div style={{ flexDirection: 'row', display: 'flex' }}>
				<ListViewSidebar />
				<div
					style={{
						paddingTop: '80px',
						paddingLeft: '20px',
						paddingRight: '60px',
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						width: '100%',
					}}
				>
					{isLoading ? (
						<Typography element="p" variant="bodySm" cssOverrides={emptyStyle}>
							Loading…
						</Typography>
					) : (
						<>
							<Grid theme={panelsGridTheme}>
								<Item>
									<SubnavListPanel
										status="draft"
										entries={draftEntries}
										onEdit={onEdit}
									/>
								</Item>
								<Item>
									<SubnavListPanel
										status="live"
										entries={publishedEntries}
										onEdit={onEdit}
									/>
								</Item>
							</Grid>
						</>
					)}
				</div>
			</div>
		</>
	);
};
