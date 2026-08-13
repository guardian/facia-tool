import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useHistory, useParams } from 'react-router';
import { selectHasSubnavPermission } from 'selectors/configSelectors';
import {
	subnavRoutes,
	subnavListProps,
	subnavCreateProps,
	subnavEditProps,
} from 'routes/routes';
import { actionAddNotificationBanner } from 'bundles/notificationsBundle';
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
	EditStatusBar,
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

// The version shown when editing: the draft if present, otherwise the live copy.
const findSubnav = (
	config: CustomSubnavConfig,
	id: string,
): CustomSubnav | undefined =>
	config.draft.find((s) => s.id === id) ?? config.live.find((s) => s.id === id);

type RunAction = (
	id: string,
	action: (id: string) => Promise<CustomSubnavConfig>,
	confirmMessage?: string,
) => void;

interface SubnavStatusActionsProps {
	id: string;
	hasLive: boolean;
	hasDraft: boolean;
	isBusy: boolean;
	runAction: RunAction;
}

/**
 * Publish / discard / unpublish / delete buttons for a single subnav, shared by
 * the list rows and the individual edit page. Which buttons show depends on
 * whether the subnav currently has a live and/or draft version.
 */
const SubnavStatusActions = ({
	id,
	hasLive,
	hasDraft,
	isBusy,
	runAction,
}: SubnavStatusActionsProps) => (
	<>
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
	</>
);

const SubnavStatusTags = ({
	hasLive,
	hasDraft,
}: {
	hasLive: boolean;
	hasDraft: boolean;
}) => (
	<>
		{hasLive && <StatusTag>Live</StatusTag>}
		{hasDraft && (
			<StatusTag draft>{hasLive ? 'Draft changes' : 'New draft'}</StatusTag>
		)}
	</>
);

interface SubnavListViewProps {
	entries: SubnavListEntry[];
	isLoading: boolean;
	pendingActionId: string | null;
	onCreate: () => void;
	onEdit: (id: string) => void;
	runAction: (
		id: string,
		action: (id: string) => Promise<CustomSubnavConfig>,
		confirmMessage?: string,
	) => void;
}

const SubnavListView = ({
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

interface SubnavFormViewProps {
	heading: string;
	statusBar?: React.ReactNode;
	initialSubnav?: CustomSubnav;
	onSave: (subnav: CustomSubnav) => void;
	onCancel: () => void;
	saving: boolean;
}

const SubnavFormView = ({
	heading,
	statusBar,
	initialSubnav,
	onSave,
	onCancel,
	saving,
}: SubnavFormViewProps) => (
	<SubnavContainer>
		<SubnavContainerHeading>{heading}</SubnavContainerHeading>
		{statusBar}
		<SubnavForm
			initialSubnav={initialSubnav}
			onSave={onSave}
			onCancel={onCancel}
			saving={saving}
		/>
	</SubnavContainer>
);

interface SubnavEditRouteProps {
	config: CustomSubnavConfig | null;
	isLoading: boolean;
	pendingActionId: string | null;
	runAction: RunAction;
	onSave: (subnav: CustomSubnav) => void;
	onCancel: () => void;
	saving: boolean;
}

/**
 * Resolves the `:id` route param against the loaded config. While the config is
 * still loading we show a placeholder; if the id is unknown (e.g. deleted or a
 * stale link) we send the user back to the list.
 */
const SubnavEditRoute = ({
	config,
	isLoading,
	pendingActionId,
	runAction,
	onSave,
	onCancel,
	saving,
}: SubnavEditRouteProps) => {
	const { id } = useParams<{ id: string }>();

	if (isLoading || !config) {
		return (
			<SubnavContainer>
				<SubnavContainerHeading>Edit custom subnav</SubnavContainerHeading>
				<Message>Loading…</Message>
			</SubnavContainer>
		);
	}

	const subnav = findSubnav(config, id);
	if (!subnav) {
		return <Redirect to={subnavRoutes.base} />;
	}

	const hasLive = config.live.some((s) => s.id === id);
	const hasDraft = config.draft.some((s) => s.id === id);

	return (
		<SubnavFormView
			heading="Edit custom subnav"
			statusBar={
				<EditStatusBar>
					<div>
						<SubnavStatusTags hasLive={hasLive} hasDraft={hasDraft} />
					</div>
					<ListItemActions>
						<SubnavStatusActions
							id={id}
							hasLive={hasLive}
							hasDraft={hasDraft}
							isBusy={pendingActionId === id}
							runAction={runAction}
						/>
					</ListItemActions>
				</EditStatusBar>
			}
			initialSubnav={subnav}
			onSave={onSave}
			onCancel={onCancel}
			saving={saving}
		/>
	);
};

const SubnavSection = () => {
	const hasPermission = useSelector(selectHasSubnavPermission);
	const dispatch = useDispatch();
	const history = useHistory();

	const notifyError = useCallback(
		(message: string) =>
			dispatch(actionAddNotificationBanner({ message, level: 'error' })),
		[dispatch],
	);

	const [subnavConfig, setSubnavConfig] = useState<CustomSubnavConfig | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [pendingActionId, setPendingActionId] = useState<string | null>(null);

	const loadConfig = useCallback(async () => {
		setIsLoading(true);
		try {
			const { warning, ...config } = await fetchSubnavConfig();
			setSubnavConfig(config);
			if (warning) {
				notifyError(warning);
			}
		} catch (e) {
			notifyError(e instanceof Error ? e.message : 'Failed to load subnavs.');
		} finally {
			setIsLoading(false);
		}
	}, [notifyError]);

	useEffect(() => {
		if (hasPermission) {
			void loadConfig();
		}
	}, [hasPermission, loadConfig]);

	const goToList = useCallback(
		() => history.push(subnavRoutes.base),
		[history],
	);

	const handleSave = async (subnav: CustomSubnav) => {
		setIsSaving(true);
		try {
			const updated = await upsertSubnav(subnav);
			setSubnavConfig(updated);
			goToList();
		} catch (e) {
			notifyError(e instanceof Error ? e.message : 'Failed to save subnav.');
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
		try {
			setSubnavConfig(await action(id));
		} catch (e) {
			notifyError(e instanceof Error ? e.message : 'Action failed.');
		} finally {
			setPendingActionId(null);
		}
	};

	if (!hasPermission) {
		return <NoPermission />;
	}

	const entries = subnavConfig ? toListEntries(subnavConfig) : [];

	return (
		<Switch>
			<Route {...subnavCreateProps}>
				<SubnavFormView
					heading="Create custom subnav"
					onSave={handleSave}
					onCancel={goToList}
					saving={isSaving}
				/>
			</Route>
			<Route {...subnavEditProps}>
				<SubnavEditRoute
					config={subnavConfig}
					isLoading={isLoading}
					pendingActionId={pendingActionId}
					runAction={runAction}
					onSave={handleSave}
					onCancel={goToList}
					saving={isSaving}
				/>
			</Route>
			<Route {...subnavListProps}>
				<SubnavListView
					entries={entries}
					isLoading={isLoading}
					pendingActionId={pendingActionId}
					onCreate={() => history.push(subnavRoutes.create)}
					onEdit={(id) => history.push(subnavRoutes.edit(id))}
					runAction={runAction}
				/>
			</Route>
		</Switch>
	);
};

export default SubnavSection;
