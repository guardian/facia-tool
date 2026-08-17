import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router';
import { selectHasSubnavPermission } from 'selectors/configSelectors';
import { subnavRoutes } from 'routes/routes';
import { actionAddNotificationBanner } from 'bundles/notificationsBundle';
import { fetchSubnavConfig, upsertSubnav } from './subnavApi';
import { SubnavFormView } from './SubnavFormView';
import { SubnavEditRoute } from './SubnavEditRoute';
import { SubnavListView } from './SubnavListView';
import { toListEntries } from './helpers';
import { CustomSubnav, CustomSubnavConfig } from './types';
import { Message, SubnavContainer, SubnavContainerHeading } from './styles';

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
			setSubnavConfig(await upsertSubnav(subnav));
		} catch (e) {
			notifyError(e instanceof Error ? e.message : 'Failed to save subnav.');
			throw e;
		} finally {
			setIsSaving(false);
		}
	};

	const handleCreate = async (subnav: CustomSubnav) => {
		await handleSave(subnav);
		history.push(subnavRoutes.edit(subnav.id));
	};

	// Likely temporary browser confirmation dialog component
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
			<Route {...subnavRoutes.createProps}>
				<SubnavFormView
					heading="Create custom subnav"
					onSave={handleCreate}
					onCancel={goToList}
					saving={isSaving}
				/>
			</Route>
			<Route {...subnavRoutes.editProps}>
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
			<Route {...subnavRoutes.listProps}>
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
