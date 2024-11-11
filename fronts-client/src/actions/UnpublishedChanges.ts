import type { Action } from 'types/Action';

function recordUnpublishedChanges(
	collectionId: string,
	lastPressed: boolean,
): Action {
	return {
		type: 'RECORD_UNPUBLISHED_CHANGES',
		payload: { [collectionId]: lastPressed },
	};
}

export { recordUnpublishedChanges };
