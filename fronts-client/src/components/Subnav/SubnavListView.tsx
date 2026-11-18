import React, { useState } from 'react';
import { css } from '@emotion/react';
import format from 'date-fns/format';
import { FiMinusCircle, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { Grid, Item } from '@guardian/stand/Grid';
import { Typography } from '@guardian/stand/Typography';
import { Button } from '@guardian/stand/Button';
import { IconButton } from '@guardian/stand/IconButton';
import { Menu, MenuItem, MenuToggle } from '@guardian/stand/Menu';
import {
	Table,
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHeader,
	TableRow,
} from '@guardian/stand/Table';
import { Badge } from '@guardian/stand/Badge';
import { Link } from '@guardian/stand/Link';
import { theme } from 'constants/theme';
import { RunAction, SubnavListEntry } from './helpers';
import { deleteSubnav, unpublishSubnav } from './subnavApi';
import { DeleteSubnavModal, UnpublishSubnavModal } from './SubnavActionModals';
import { Panel, PanelThumb } from './styles';

interface SubnavListViewProps {
	entries: SubnavListEntry[];
	isLoading: boolean;
	pendingActionId: string | null;
	onCreate: () => void;
	onEdit: (id: string) => void;
	runAction: RunAction;
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
		gap: '12px',
		padding: '60px',
	},
};

const tableColumns = {
	sm: 'minmax(0, 1fr)',
	lg: 'minmax(0, 2.4fr) 130px 135px',
};

const subnavCellStyles = css`
	display: flex;
	align-items: center;
	gap: 12px;
	min-width: 0;
`;

const thumbLinkStyles = css`
	flex: 0 0 auto;
	line-height: 0;
`;

const subnavTextStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
	minWidth: 0,
};

const titleLinkStyles = css`
	text-decoration: underline;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
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

const statusCellStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: '8px',
	width: '100%',
};

const menuTriggerStyle = css`
	border: none;
	&:hover,
	&:active {
		border: none;
	}
`;

const menuStyle = css`
	max-width: 160px;
`;

const createHeaderCellStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'flex-end',
	width: '100%',
};

const tableHeaderStyles = css`
	& > tr {
		align-items: center;
	}
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
			<Badge color="green" size="sm" weight="light">
				Live
			</Badge>
		)}
		{hasDraft && (
			<Badge color="orange" size="sm" weight="light">
				{hasLive ? 'Draft changes' : 'New draft'}
			</Badge>
		)}
	</span>
);

const SubnavListPanel = ({
	status,
	entries,
	onEdit,
	onCreate,
	onUnpublish,
	onDelete,
}: {
	status: 'live' | 'draft';
	entries: SubnavListEntry[];
	onEdit: (id: string) => void;
	onCreate?: () => void;
	onUnpublish?: (entry: SubnavListEntry) => void;
	onDelete?: (entry: SubnavListEntry) => void;
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
					<TableColumnHeader>Last updated</TableColumnHeader>
					<TableColumnHeader>
						{status === 'draft'
							? onCreate && (
									<span style={createHeaderCellStyle}>
										<Button
											variant="tertiary"
											size="sm"
											icon="add"
											onPress={onCreate}
										>
											Create new
										</Button>
									</span>
								)
							: 'Status'}
					</TableColumnHeader>
				</TableHeader>
				<TableBody
					renderEmptyState={() => (
						<Typography element="p" variant="bodySm" cssOverrides={emptyStyle}>
							{emptyMessage}
						</Typography>
					)}
				>
					{entries.map((entry) => {
						const { id, subnav, hasLive, hasDraft } = entry;
						const imageSrc = subnav.images?.[0]?.imageSrc;
						const title = subnav.header.headerText || 'Untitled subnav';
						const meta = [
							...subnav.links.map((link) => link.linkText),
							...subnav.pages.map((page) => page.path),
						]
							.filter(Boolean)
							.join(' · ');
						return (
							<TableRow key={id} id={id}>
								<TableCell
									gridColumn={{ lg: '1' }}
									cssOverrides={subnavCellStyles}
								>
									{imageSrc && (
										<Link
											onPress={() => onEdit(id)}
											aria-label={`Edit ${title}`}
											cssOverrides={thumbLinkStyles}
										>
											<PanelThumb url={imageSrc} />
										</Link>
									)}
									<span style={subnavTextStyle}>
										<Link
											onPress={() => onEdit(id)}
											typography="bodyBoldSm"
											cssOverrides={titleLinkStyles}
										>
											{title}
										</Link>
										{meta && (
											<Typography
												element="span"
												variant="bodySm"
												cssOverrides={metaStyles}
											>
												{meta}
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
										<div style={statusCellStyle}>
											<StatusBadges hasLive={hasLive} hasDraft={hasDraft} />
											{onUnpublish && onDelete && (
												<Menu
													size="sm"
													aria-label={`Actions for ${title}`}
													popoverProps={{
														cssOverrides: menuStyle,
														containerPadding: 8,
													}}
												>
													<MenuToggle>
														<IconButton
															variant="tertiary"
															size="sm"
															ariaLabel={`Actions for ${title}`}
															cssOverrides={menuTriggerStyle}
														>
															<FiMoreVertical />
														</IconButton>
													</MenuToggle>
													<MenuItem
														label="Take down"
														icon={<FiMinusCircle />}
														onAction={() => onUnpublish(entry)}
													/>
													<MenuItem
														label="Delete"
														icon={<FiTrash2 />}
														onAction={() => onDelete(entry)}
													/>
												</Menu>
											)}
										</div>
									</TableCell>
								) : (
									<TableCell gridColumn={{ lg: '3' }}>{null}</TableCell>
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
	onCreate,
	onEdit,
	runAction,
}: SubnavListViewProps) => {
	const [pendingModal, setPendingModal] = useState<{
		type: 'delete' | 'unpublish';
		entry: SubnavListEntry;
	} | null>(null);

	const draftEntries = entries.filter((entry) => entry.hasDraft);

	const publishedEntries = entries.filter(
		(entry) => entry.hasLive && !entry.hasDraft,
	);

	const closeModal = () => setPendingModal(null);
	const modalHeaderText =
		pendingModal?.entry.subnav.header.headerText || 'Untitled subnav';

	return (
		<>
			<div style={{ paddingTop: '80px' }} />
			{isLoading ? (
				<Typography element="p" variant="bodySm" cssOverrides={emptyStyle}>
					Loading…
				</Typography>
			) : (
				<Grid theme={panelsGridTheme}>
					<Item>
						<SubnavListPanel
							status="draft"
							entries={draftEntries}
							onEdit={onEdit}
							onCreate={onCreate}
						/>
					</Item>
					<Item>
						<SubnavListPanel
							status="live"
							entries={publishedEntries}
							onEdit={onEdit}
							onUnpublish={(entry) =>
								setPendingModal({ type: 'unpublish', entry })
							}
							onDelete={(entry) => setPendingModal({ type: 'delete', entry })}
						/>
					</Item>
				</Grid>
			)}
			<UnpublishSubnavModal
				isOpen={pendingModal?.type === 'unpublish'}
				onOpenChange={(open) => !open && closeModal()}
				headerText={modalHeaderText}
				onConfirm={() =>
					pendingModal && runAction(pendingModal.entry.id, unpublishSubnav)
				}
			/>
			<DeleteSubnavModal
				isOpen={pendingModal?.type === 'delete'}
				onOpenChange={(open) => !open && closeModal()}
				headerText={modalHeaderText}
				onConfirm={() =>
					pendingModal && runAction(pendingModal.entry.id, deleteSubnav)
				}
			/>
		</>
	);
};
