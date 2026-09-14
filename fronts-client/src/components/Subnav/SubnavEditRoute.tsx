import React from 'react';
import { Redirect } from 'react-router-dom';
import { useParams } from 'react-router';
import { subnavRoutes } from 'routes/routes';
import SubnavForm from './SubnavForm';
import { deleteSubnav, discardSubnav, unpublishSubnav } from './subnavApi';
import { findSubnav, RunAction } from './helpers';
import { CustomSubnav, CustomSubnavConfig } from './types';
import { Message, SubnavContainer, SubnavContainerHeading } from './styles';

interface SubnavEditRouteProps {
	config: CustomSubnavConfig | null;
	isLoading: boolean;
	pendingActionId: string | null;
	runAction: RunAction;
	onSave: (subnav: CustomSubnav) => Promise<void>;
	onPublish: (id: string) => Promise<void>;
	saving: boolean;
}

export const SubnavEditRoute = ({
	config,
	isLoading,
	pendingActionId,
	runAction,
	onSave,
	onPublish,
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
		<SubnavForm
			// Re-seed the form whenever the server version changes (save, publish,
			// discard, unpublish) so it always reflects the persisted subnav.
			key={`${id}:${subnav.lastUpdated}:${hasLive ? 1 : 0}:${hasDraft ? 1 : 0}`}
			initialSubnav={subnav}
			onSaveDraft={onSave}
			onPublish={onPublish}
			saving={saving}
			hasLive={hasLive}
			hasDraft={hasDraft}
			actionPending={pendingActionId === id}
			onDiscard={(subnavId) =>
				runAction(
					subnavId,
					discardSubnav,
					'Discard draft changes and revert to the live version?',
				)
			}
			onUnpublish={(subnavId) =>
				runAction(
					subnavId,
					unpublishSubnav,
					hasDraft
						? 'Take this subnav down? You have draft changes — taking it down will undo them.'
						: 'Take this subnav down? It will no longer show on the targeted pages (kept as a draft).',
				)
			}
			onDelete={(subnavId) =>
				runAction(
					subnavId,
					deleteSubnav,
					'Delete this subnav entirely? This removes both the live and draft versions.',
				)
			}
		/>
	);
};
