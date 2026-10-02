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
	onSaveDraft: (subnav: CustomSubnav) => Promise<void>;
	onPublish: (id: string) => Promise<void>;
	saving: boolean;
}

export const SubnavEditRoute = ({
	config,
	isLoading,
	pendingActionId,
	runAction,
	onSaveDraft,
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

	// Re-seed the form whenever the server version changes (after a save,
	// discard, or unpublish) so its state stays in sync with the config.
	const formKey = `${id}:${subnav.lastUpdated}:${hasLive}:${hasDraft}`;

	return (
		<SubnavForm
			key={formKey}
			initialSubnav={subnav}
			hasLive={hasLive}
			hasDraft={hasDraft}
			actionPending={pendingActionId === id}
			onSaveDraft={onSaveDraft}
			onPublish={onPublish}
			onDiscard={() =>
				runAction(
					id,
					discardSubnav,
					'Discard draft changes and revert to the live version?',
				)
			}
			onUnpublish={() =>
				runAction(
					id,
					unpublishSubnav,
					hasDraft
						? 'Take this subnav down? You have draft changes — taking it down will undo them.'
						: 'Take this subnav down? It will no longer show on the targeted pages (kept as a draft).',
				)
			}
			onDelete={() =>
				runAction(
					id,
					deleteSubnav,
					'Delete this subnav entirely? This removes both the live and draft versions.',
				)
			}
			saving={saving}
		/>
	);
};
