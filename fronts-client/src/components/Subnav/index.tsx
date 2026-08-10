import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectHasSubnavPermission } from 'selectors/configSelectors';
import ButtonDefault from 'components/inputs/ButtonDefault';
import {
	deleteSubnav,
	discardSubnav,
	fetchSubnavConfig,
	publishSubnav,
	unpublishSubnav,
	upsertSubnav,
} from './subnavApi';
import SubnavForm from './SubnavForm';
import { CustomSubnav, CustomSubnavConfig } from './types';
import {
	List,
	ListHeader,
	ListItem,
	ListItemActions,
	ListItemMeta,
	ListItemTitle,
	Message,
	StatusTag,
	SubnavContainer,
	SubnavContainerHeading,
} from './styles';

const NoPermission = () => (
	<SubnavContainer>
		<SubnavContainerHeading>Custom subnavs</SubnavContainerHeading>
		<Message>
			You do not have permission to configure subnavs. Please contact{' '}
			<a href="mailto:central.production@guardian.co.uk">Central Production</a>{' '}
			to request access.
		</Message>
	</SubnavContainer>
);

interface SubnavListEntry {
	id: string;
	/** The version shown/edited: the draft if present, otherwise the live copy. */
	subnav: CustomSubnav;
	hasLive: boolean;
	hasDraft: boolean;
}

/**
 * Build a de-duplicated list of subnavs for display. A subnav can exist in
 * `draft`, `live`, or both; each id appears once, preferring the draft copy.
 */
const toListEntries = (config: CustomSubnavConfig): SubnavListEntry[] => {
	const liveById = new Map(config.live.map((s) => [s.id, s]));
	const draftById = new Map(config.draft.map((s) => [s.id, s]));
	const ids = [
		...config.draft.map((s) => s.id),
		...config.live.filter((s) => !draftById.has(s.id)).map((s) => s.id),
	];
	return ids.map((id) => {
		const draft = draftById.get(id);
		const live = liveById.get(id);
		return {
			id,
			subnav: (draft ?? live) as CustomSubnav,
			hasLive: live !== undefined,
			hasDraft: draft !== undefined,
		};
	});
};

// null = list view; 'new' = create form; a subnav = edit form
type FormMode = CustomSubnav | 'new' | null;

const SubnavSection = () => {
	const hasPermission = useSelector(selectHasSubnavPermission);

	const [subnavConfig, setSubnavConfig] = useState<CustomSubnavConfig | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [formMode, setFormMode] = useState<FormMode>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [pendingActionId, setPendingActionId] = useState<string | null>(null);

	const loadConfig = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			setSubnavConfig(await fetchSubnavConfig());
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Failed to load subnavs.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (hasPermission) {
			void loadConfig();
		}
	}, [hasPermission, loadConfig]);

	const handleSave = async (subnav: CustomSubnav) => {
		setIsSaving(true);
		try {
			const updated = await upsertSubnav(subnav);
			setSubnavConfig(updated);
			setFormMode(null);
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Failed to save subnav.');
		} finally {
			setIsSaving(false);
		}
	};

	const runAction = async (
		id: string,
		action: (id: string) => Promise<CustomSubnavConfig>,
		confirmMessage?: string,
	) => {
		if (confirmMessage && !window.confirm(confirmMessage)) {
			return;
		}
		setPendingActionId(id);
		setLoadError(null);
		try {
			setSubnavConfig(await action(id));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Action failed.');
		} finally {
			setPendingActionId(null);
		}
	};

	if (!hasPermission) {
		return <NoPermission />;
	}

	if (formMode !== null) {
		return (
			<SubnavContainer>
				<SubnavContainerHeading>
					{formMode === 'new' ? 'Create custom subnav' : 'Edit custom subnav'}
				</SubnavContainerHeading>
				<SubnavForm
					initialSubnav={formMode === 'new' ? undefined : formMode}
					onSave={handleSave}
					onCancel={() => setFormMode(null)}
					saving={isSaving}
				/>
			</SubnavContainer>
		);
	}

	const entries = subnavConfig ? toListEntries(subnavConfig) : [];

	return (
		<SubnavContainer>
			<SubnavContainerHeading>Custom subnavs</SubnavContainerHeading>

			<ListHeader>
				<ButtonDefault
					type="button"
					priority="primary"
					onClick={() => setFormMode('new')}
				>
					+ Create new subnav
				</ButtonDefault>
			</ListHeader>

			{loadError && <Message>{loadError}</Message>}

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
										{hasLive && <StatusTag>Live</StatusTag>}
										{hasDraft && (
											<StatusTag draft>
												{hasLive ? 'Draft changes' : 'New draft'}
											</StatusTag>
										)}
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
										onClick={() => setFormMode(subnav)}
									>
										Edit
									</ButtonDefault>
									{hasDraft && (
										<ButtonDefault
											type="button"
											size="s"
											priority="primary"
											disabled={isBusy}
											onClick={() =>
												runAction(
													id,
													publishSubnav,
													'Publish this subnav? It will go live on the targeted pages.',
												)
											}
										>
											Publish
										</ButtonDefault>
									)}
									{hasDraft && hasLive && (
										<ButtonDefault
											type="button"
											size="s"
											priority="muted"
											disabled={isBusy}
											onClick={() =>
												runAction(
													id,
													discardSubnav,
													'Discard draft changes and revert to the live version?',
												)
											}
										>
											Discard changes
										</ButtonDefault>
									)}
									{hasLive && (
										<ButtonDefault
											type="button"
											size="s"
											priority="muted"
											disabled={isBusy}
											onClick={() =>
												runAction(
													id,
													unpublishSubnav,
													hasDraft
														? 'Take this subnav down? You have draft changes — taking it down will undo them.'
														: 'Take this subnav down? It will no longer show on the targeted pages (kept as a draft).',
												)
											}
										>
											Unpublish
										</ButtonDefault>
									)}
									<ButtonDefault
										type="button"
										size="s"
										priority="muted"
										disabled={isBusy}
										onClick={() =>
											runAction(
												id,
												deleteSubnav,
												'Delete this subnav entirely? This removes both the live and draft versions.',
											)
										}
									>
										Delete
									</ButtonDefault>
								</ListItemActions>
							</ListItem>
						);
					})}
				</List>
			)}
		</SubnavContainer>
	);
};

export default SubnavSection;
