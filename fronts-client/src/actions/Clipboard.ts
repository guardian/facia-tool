import type { Card } from 'types/Collection';
import { addPersistMetaToAction } from 'util/action';

export const REMOVE_CLIPBOARD_CARD = 'REMOVE_CLIPBOARD_CARD' as const;
export const UPDATE_CLIPBOARD_CONTENT = 'UPDATE_CLIPBOARD_CONTENT' as const;
export const INSERT_CLIPBOARD_CARD = 'INSERT_CLIPBOARD_CARD' as const;
export const CLEAR_CLIPBOARD = 'CLEAR_CLIPBOARD' as const;

function updateClipboardContent(clipboardContent: string[] = []) {
	return {
		type: UPDATE_CLIPBOARD_CONTENT,
		payload: clipboardContent,
	};
}

type UpdateClipboardContent = ReturnType<typeof updateClipboardContent>;

const actionInsertClipboardCard = (
	id: string,
	index: number,
	cardId: string,
	currentCards: { [uuid: string]: Card },
) => ({
	type: INSERT_CLIPBOARD_CARD,
	payload: {
		id,
		index,
		cardId,
		currentCards,
	},
});

type InsertClipboardCard = ReturnType<typeof actionInsertClipboardCard>;

const actionInsertClipboardCardWithPersist = addPersistMetaToAction(
	actionInsertClipboardCard,
	{
		persistTo: 'clipboard',
		key: 'cardId',
	},
);

const removeClipboardCard = (id: string, cardId: string) => ({
	type: REMOVE_CLIPBOARD_CARD,
	payload: {
		id,
		cardId,
	},
});

type RemoveClipboardCard = ReturnType<typeof removeClipboardCard>;

const clearClipboard = (id: string) => ({
	type: CLEAR_CLIPBOARD,
	payload: {
		id,
	},
});

type ClearClipboard = ReturnType<typeof clearClipboard>;

const clearClipboardWithPersist = addPersistMetaToAction(clearClipboard, {
	persistTo: 'clipboard',
});

export type ClipboardActions =
	| RemoveClipboardCard
	| InsertClipboardCard
	| UpdateClipboardContent
	| ClearClipboard;

export {
	updateClipboardContent,
	removeClipboardCard,
	clearClipboard,
	clearClipboardWithPersist,
	actionInsertClipboardCardWithPersist,
};
