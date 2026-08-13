import React from 'react';
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

export const SubnavListView = ({
	entries,
	isLoading,
	pendingActionId,
	onCreate,
	onEdit,
	runAction,
}: SubnavListViewProps) => (
	<SubnavContainer>
		<SubnavContainerHeading>Custom subnavs</SubnavContainerHeading>

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
									{subnav.pages.length === 1 ? '' : 's'} · {subnav.links.length}{' '}
									link
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
);
