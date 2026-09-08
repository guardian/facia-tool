import { denyDragEvent, getCardDropType } from '../CardTypeLevel';
import { CardTypesMap } from 'constants/cardTypes';
import { CARD_TYPE } from 'lib/dnd/constants';
import { Card } from 'types/Collection';

const dragEventWithCardType = (cardType: string, types: string[] = []) =>
	({
		dataTransfer: {
			types,
			getData: (key: string) => (key === CARD_TYPE ? cardType : ''),
		},
	}) as unknown as React.DragEvent;

describe('denyDragEvent', () => {
	it('should allow a drag with no allow or deny list', () => {
		expect(
			denyDragEvent()(dragEventWithCardType(CardTypesMap.EVENT_GRAPHIC)),
		).toBe(false);
	});

	it('should deny card types on the deny list', () => {
		expect(
			denyDragEvent(undefined, [CardTypesMap.EVENT_GRAPHIC])(
				dragEventWithCardType(CardTypesMap.EVENT_GRAPHIC),
			),
		).toBe(true);
	});

	it('should allow card types absent from the deny list', () => {
		expect(
			denyDragEvent(undefined, [CardTypesMap.EVENT_GRAPHIC])(
				dragEventWithCardType(CardTypesMap.ARTICLE),
			),
		).toBe(false);
	});

	it('should not deny untyped drops, such as plain urls', () => {
		expect(
			denyDragEvent(undefined, [CardTypesMap.EVENT_GRAPHIC])(
				dragEventWithCardType(''),
			),
		).toBe(false);
	});

	it('should still honour the allow list', () => {
		expect(
			denyDragEvent([CardTypesMap.RECIPE])(
				dragEventWithCardType(CardTypesMap.ARTICLE),
			),
		).toBe(true);
		expect(
			denyDragEvent([CardTypesMap.RECIPE])(
				dragEventWithCardType(CardTypesMap.RECIPE),
			),
		).toBe(false);
	});
});

describe('getCardDropType', () => {
	it('should use the card type when it is set', () => {
		expect(
			getCardDropType({
				uuid: 'uuid',
				id: 'some/article',
				cardType: CardTypesMap.RECIPE,
			} as Card),
		).toBe(CardTypesMap.RECIPE);
	});

	it('should derive the event graphic type from the id when the card type is missing', () => {
		expect(
			getCardDropType({
				uuid: 'uuid',
				id: 'event-graphic/election-tracker/us-midterm-2026',
			} as Card),
		).toBe(CardTypesMap.EVENT_GRAPHIC);
	});

	it('should default to an article', () => {
		expect(getCardDropType({ uuid: 'uuid', id: 'some/article' } as Card)).toBe(
			CardTypesMap.ARTICLE,
		);
	});
});
