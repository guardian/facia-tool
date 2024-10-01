import keyBy from 'lodash/keyBy';
import type { Card, CardMeta } from '../types/Collection';

export const UPDATE_CARD_META = 'UPDATE_CARD_META' as const;
export const CARDS_RECEIVED = 'CARDS_RECEIVED' as const;
export const CLEAR_CARDS = 'CLEAR_CARDS' as const;
export const REMOVE_GROUP_CARD = 'REMOVE_GROUP_CARD' as const;
export const REMOVE_SUPPORTING_CARD = 'REMOVE_SUPPORTING_CARD' as const;
export const INSERT_GROUP_CARD = 'INSERT_GROUP_CARD' as const;
export const INSERT_SUPPORTING_CARD = 'INSERT_SUPPORTING_CARD' as const;
export const COPY_CARD_IMAGE_META = 'COPY_CARD_IMAGE_META' as const;
export const MAYBE_ADD_FRONT_PUBLICATION =
	'MAYBE_ADD_FRONT_PUBLICATION' as const;

function updateCardMeta(
	id: string,
	meta: CardMeta,
	{ merge }: { merge: boolean } = { merge: false },
) {
	return {
		type: UPDATE_CARD_META,
		payload: {
			id,
			meta,
			merge,
		},
	};
}

type UpdateCardMeta = ReturnType<typeof updateCardMeta>;

// This can accept either a map of cards or an array (from which a
// map will be generated)
function cardsReceived(
	cards:
		| {
				[uuid: string]: Card;
		  }
		| Card[],
) {
	const payload = Array.isArray(cards)
		? keyBy(cards, ({ uuid }) => uuid)
		: cards;
	return {
		type: CARDS_RECEIVED,
		payload,
	};
}

type CardsReceived = ReturnType<typeof cardsReceived>;

function copyCardImageMeta(from: string, to: string) {
	return {
		type: COPY_CARD_IMAGE_META as typeof COPY_CARD_IMAGE_META,
		payload: { from, to },
	};
}

function clearCards(ids: string[]) {
	return {
		type: CLEAR_CARDS,
		payload: {
			ids,
		},
	};
}

type ClearCards = ReturnType<typeof clearCards>;

function removeGroupCard(id: string, cardId: string) {
	return {
		type: REMOVE_GROUP_CARD,
		payload: {
			id,
			cardId,
		},
	};
}

type RemoveGroupCard = ReturnType<typeof removeGroupCard>;

function removeSupportingCard(id: string, cardId: string) {
	return {
		type: REMOVE_SUPPORTING_CARD,
		payload: {
			id,
			cardId,
		},
	};
}

type RemoveSupportingCard = ReturnType<typeof removeSupportingCard>;

const insertGroupCard = (
	id: string,
	index: number,
	cardId: string,
	persistTo: 'collection' | 'clipboard',
) => ({
	type: INSERT_GROUP_CARD,
	payload: {
		id,
		index,
		cardId,
	},
	meta: {
		persistTo,
		key: 'cardId',
	},
});

type InsertGroupCard = ReturnType<typeof insertGroupCard>;

const insertSupportingCard = (
	id: string,
	index: number,
	cardId: string,
	persistTo: 'collection' | 'clipboard',
) => ({
	type: INSERT_SUPPORTING_CARD,
	payload: {
		id,
		index,
		cardId,
	},
	meta: {
		persistTo,
		key: 'cardId',
	},
});

type InsertSupportingCard = ReturnType<typeof insertSupportingCard>;

const maybeAddFrontPublicationDate = (cardId: string) => ({
	type: MAYBE_ADD_FRONT_PUBLICATION,
	payload: {
		id: cardId,
		date: Date.now(),
	},
});

type MaybeAddFrontPublicationDate = ReturnType<
	typeof maybeAddFrontPublicationDate
>;

export type CardActions =
	| MaybeAddFrontPublicationDate
	| InsertGroupCard
	| InsertSupportingCard
	| CardsReceived
	| RemoveGroupCard
	| RemoveSupportingCard
	| ClearCards
	| UpdateCardMeta;

export {
	updateCardMeta,
	cardsReceived,
	insertGroupCard,
	insertSupportingCard,
	removeGroupCard,
	removeSupportingCard,
	clearCards,
	maybeAddFrontPublicationDate,
	copyCardImageMeta,
};
