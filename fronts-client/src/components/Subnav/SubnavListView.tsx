import React from 'react';
import { css } from '@emotion/react';
import format from 'date-fns/format';
import { Grid, Item } from '@guardian/stand/Grid';
import { Typography } from '@guardian/stand/Typography';
import { Button } from '@guardian/stand/Button';
import { theme } from 'constants/theme';
import ButtonDefault from 'components/inputs/ButtonDefault';
import { SubnavStatusActions, SubnavStatusTags } from './SubnavStatusActions';
import { RunAction, SubnavListEntry } from './helpers';
import {
	List,
	ListHeader,
	ListItem,
	ListItemActions,
	ListItemMeta,
	ListItemTitle,
	Message,
	Panel,
	PanelEntryBody,
	PanelEntryRow,
	PanelEntryStatus,
	PanelList,
	PanelListItem,
	PanelThumb,
	PanelThumbButton,
	PanelTitleButton,
	PanelTopBar,
	PanelTopBarMeta,
	SubnavContainer,
	SubnavContainerHeading,
} from './styles';

interface SubnavListViewProps {
	entries: SubnavListEntry[];
	isLoading: boolean;
	pendingActionId: string | null;
	onCreate: () => void;
	onEdit: (id: string) => void;
	runAction: RunAction;
}

// Two panels side by side, each capped at 40% of the page width (2 of 5 columns).
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

const mutedText = css`
	color: ${theme.base.colors.textMuted};
`;

const entryTitleStyle = css`
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const entryMetaStyle = css`
	display: block;
	margin-top: 4px;
	color: ${theme.base.colors.textMuted};
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const emptyStyle = css`
	display: block;
	padding: 12px;
	color: ${theme.base.colors.textMuted};
`;

const formatUpdated = (lastUpdated: number) =>
	format(lastUpdated, 'ddd D MMM YYYY');

const SubnavListPanel = ({
	status,
	entries,
	onEdit,
	onCreate,
}: {
	status: 'live' | 'draft';
	entries: SubnavListEntry[];
	onEdit: (id: string) => void;
	onCreate?: () => void;
}) => (
	<Panel>
		<PanelTopBar>
			<Typography element="h2" variant="headingSm">
				{status === 'live' ? 'Launched subnavs' : 'Draft subnavs'}
			</Typography>
			<PanelTopBarMeta>
				<Typography
					element="span"
					variant="labelFormSm"
					cssOverrides={mutedText}
				>
					Last updated
				</Typography>
				{status === 'draft' && onCreate && (
					<Button variant="tertiary" size="sm" icon="+" onPress={onCreate}>
						Create new
					</Button>
				)}
			</PanelTopBarMeta>
		</PanelTopBar>
		{entries.length === 0 ? (
			<Typography element="p" variant="bodySm" cssOverrides={emptyStyle}>
				{status === 'live'
					? 'No launched subnavs yet.'
					: 'No draft subnavs yet.'}
			</Typography>
		) : (
			<PanelList>
				{entries.map(({ id, subnav, hasLive, hasDraft }) => {
					const imageSrc = subnav.images?.[0]?.imageSrc;
					const meta = [
						...subnav.links.map((link) => link.linkText),
						...subnav.pages.map((page) => page.path),
					]
						.filter(Boolean)
						.join(' · ');
					const title = subnav.header.headerText || 'Untitled subnav';
					return (
						<PanelListItem key={id}>
							{imageSrc && (
								<PanelThumbButton
									type="button"
									onClick={() => onEdit(id)}
									aria-label={`Edit ${title}`}
								>
									<PanelThumb url={imageSrc} />
								</PanelThumbButton>
							)}
							<PanelEntryBody>
								<PanelEntryRow>
									<PanelTitleButton type="button" onClick={() => onEdit(id)}>
										<Typography
											element="span"
											variant="bodyBoldSm"
											cssOverrides={entryTitleStyle}
										>
											{title}
										</Typography>
									</PanelTitleButton>
									<Typography
										element="span"
										variant="metaMd"
										cssOverrides={mutedText}
									>
										{formatUpdated(subnav.lastUpdated)}
									</Typography>
									<PanelEntryStatus>
										<SubnavStatusTags hasLive={hasLive} hasDraft={hasDraft} />
									</PanelEntryStatus>
								</PanelEntryRow>
								{meta && (
									<Typography
										element="p"
										variant="bodySm"
										cssOverrides={entryMetaStyle}
									>
										{meta}
									</Typography>
								)}
							</PanelEntryBody>
						</PanelListItem>
					);
				})}
			</PanelList>
		)}
	</Panel>
);

export const SubnavListView = ({
	entries,
	isLoading,
	pendingActionId,
	onCreate,
	onEdit,
	runAction,
}: SubnavListViewProps) => {
	const draftEntries = entries.filter((entry) => entry.hasDraft);

	const publishedEntries = entries.filter(
		(entry) => entry.hasLive && !entry.hasDraft,
	);

	return (
		<>
			{/*<SubnavContainer> <SubnavContainerHeading>Custom subnavs</SubnavContainerHeading>

				<ListHeader>
					<ButtonDefault type="button" priority="primary" onClick={onCreate}>
						+ Create new subnav
					</ButtonDefault>
				</ListHeader>

				{isLoading ? (
					<Message>Loading…</Message>
				) : entries.length === 0 ? (
					<Message>No custom subnavs yet. Create one to get started.</Message>
				) : (
					<List>
						{entries.map(({ id, subnav, hasLive, hasDraft }) => {
							const isBusy = pendingActionId === id;
							return (
								<ListItem key={id}>
									<div>
										<ListItemTitle>
											{subnav.header.headerText || 'Untitled subnav'}
											<SubnavStatusTags hasLive={hasLive} hasDraft={hasDraft} />
										</ListItemTitle>
										<ListItemMeta>
											{subnav.pages.length} page
											{subnav.pages.length === 1 ? '' : 's'} ·{' '}
											{subnav.links.length} link
											{subnav.links.length === 1 ? '' : 's'}
										</ListItemMeta>
									</div>
									<ListItemActions>
										<ButtonDefault
											type="button"
											size="s"
											disabled={isBusy}
											onClick={() => onEdit(id)}
										>
											Edit
										</ButtonDefault>
										<SubnavStatusActions
											id={id}
											hasLive={hasLive}
											hasDraft={hasDraft}
											isBusy={isBusy}
											runAction={runAction}
										/>
									</ListItemActions>
								</ListItem>
							);
						})}
					</List>
				)}
								</SubnavContainer>

				 */}
			<div
				style={{
					paddingTop: '80px',
				}}
			></div>
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
					/>
				</Item>
			</Grid>{' '}
			{/*
			<div style={{ paddingTop: '82px' }}>
				<Grid theme={panelsGridTheme}>
					<Item>test</Item>
					<Item>test</Item>
				</Grid>
			</div> */}
		</>
	);
};
