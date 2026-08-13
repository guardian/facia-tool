import React from 'react';
import ButtonDefault from 'components/inputs/ButtonDefault';
import {
	deleteSubnav,
	discardSubnav,
	publishSubnav,
	unpublishSubnav,
} from './subnavApi';
import { RunAction } from './helpers';
import { StatusTag } from './styles';

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
export const SubnavStatusActions = ({
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

export const SubnavStatusTags = ({
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
