import React from 'react';
import { Redirect } from 'react-router-dom';
import { useParams } from 'react-router';
import { subnavRoutes } from 'routes/routes';
import { SubnavFormView } from './SubnavFormView';
import { SubnavStatusActions, SubnavStatusTags } from './SubnavStatusActions';
import { findSubnav, RunAction } from './helpers';
import { CustomSubnav, CustomSubnavConfig } from './types';
import {
	EditStatusBar,
	ListItemActions,
	Message,
	SubnavContainer,
	SubnavContainerHeading,
} from './styles';

interface SubnavEditRouteProps {
	config: CustomSubnavConfig | null;
	isLoading: boolean;
	pendingActionId: string | null;
	runAction: RunAction;
	onSave: (subnav: CustomSubnav) => Promise<void>;
	onCancel: () => void;
	saving: boolean;
}

/**
 * Resolves the `:id` route param against the loaded config. While the config is
 * still loading we show a placeholder; if the id is unknown (e.g. deleted or a
 * stale link) we send the user back to the list.
 */
export const SubnavEditRoute = ({
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
