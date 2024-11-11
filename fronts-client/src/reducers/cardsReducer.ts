import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';
import type { Action } from 'types/Action';
import type { State } from 'types/State';
import {
	UPDATE_CARD_META,
	CARDS_RECEIVED,
	CLEAR_CARDS,
	REMOVE_SUPPORTING_CARD,
	INSERT_SUPPORTING_CARD,
	COPY_CARD_IMAGE_META,
} from 'actions/CardsCommon';
import { cloneActiveImageMeta } from 'util/card';

const cards = (state: State['cards'] = {}, action: Action) => {
	switch (action.type) {
		case UPDATE_CARD_META: {
			const { id } = action.payload;
			return {
				...state,
				[id]: {
					...state[id],
					meta: action.payload.merge
						? { ...(state[id].meta || {}), ...action.payload.meta }
						: action.payload.meta,
				},
			};
		}
		case CLEAR_CARDS: {
			return action.payload.ids.reduce((newState, id) => {
				const { [id]: omit, ...rest } = newState;
				return rest;
			}, state);
		}
		case CARDS_RECEIVED: {
			const { payload } = action;
			return Object.assign({}, state, payload);
		}
		case REMOVE_SUPPORTING_CARD: {
			const card = state[action.payload.id];
			return {
				...state,
				[action.payload.id]: {
					...card,
					meta: {
						...card.meta,
						supporting: (card.meta.supporting || []).filter(
							(sid) => sid !== action.payload.cardId,
						),
					},
				},
			};
		}
		case INSERT_SUPPORTING_CARD: {
			const { id, cardId, index } = action.payload;
			const targetCard = state[id];
			const insertedCard = state[cardId];

			if (!insertedCard) {
				// this may have happened if we've purged after a poll
				return state;
			}

			const supporting = insertAndDedupeSiblings(
				targetCard.meta.supporting || [],
				[insertedCard.uuid, ...(insertedCard.meta.supporting || [])],
				index,
				state,
			);

			return {
				...state,
				[id]: {
					...targetCard,
					meta: {
						...targetCard.meta,
						supporting,
					},
				},
				//
				[cardId]: {
					...insertedCard,
					meta: {
						...insertedCard.meta,
						// ...ensuer that after flattening we remove the supporting from
						// the inserted card
						supporting: [],
					},
				},
			};
		}
		// We add frontPublicationDates here  because sublinks coming from the old tool do not have front publication
		// dates. The new fronts tool adds these to sublinks always.
		case 'SHARED/MAYBE_ADD_FRONT_PUBLICATION': {
			const { id, date } = action.payload;
			const card = state[id];

			if (card.frontPublicationDate) {
				return state;
			}

			const newCard = { ...card, frontPublicationDate: date };
			return {
				...state,
				[id]: newCard,
			};
		}
		case COPY_CARD_IMAGE_META: {
			const to = action.payload.to;
			const fromArticle = state[action.payload.from];
			const toArticle = state[to];
			if (!fromArticle || !toArticle) {
				return state;
			}
			return {
				...state,
				[to]: {
					...state[to],
					meta: {
						...(state[to].meta || {}),
						...cloneActiveImageMeta(fromArticle),
					},
				},
			};
		}
		default: {
			return state;
		}
	}
};

export default cards;
