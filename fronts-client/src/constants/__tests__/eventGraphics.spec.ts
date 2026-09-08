import {
	EVENT_GRAPHIC_ID_PREFIX,
	eventGraphics,
	getEventGraphicById,
	getEventGraphicTitle,
	isEventGraphicId,
	isEventGraphicSlot,
} from 'constants/eventGraphics';
import { FLEXIBLE_SPECIAL_NAME } from 'constants/flexibleContainers';

describe('event graphics', () => {
	it('should give every event graphic an id with the shared prefix', () => {
		eventGraphics.forEach(({ id }) => {
			expect(id.startsWith(EVENT_GRAPHIC_ID_PREFIX)).toBe(true);
		});
	});

	it('should give every event graphic a title', () => {
		eventGraphics.forEach(({ title }) => {
			expect(title).toBeTruthy();
		});
	});

	describe('isEventGraphicId', () => {
		it('should identify event graphic ids', () => {
			expect(
				isEventGraphicId('event-graphic/election-tracker/us-midterm-2026'),
			).toBe(true);
		});

		it('should not identify articles or snaps as event graphics', () => {
			expect(isEventGraphicId('snap/32145544543')).toBe(false);
			expect(isEventGraphicId('politics/2026/nov/01/some-article')).toBe(false);
		});
	});

	describe('getEventGraphicTitle', () => {
		it('should return the title of a known event graphic', () => {
			const [firstEventGraphic] = eventGraphics;
			expect(getEventGraphicTitle(firstEventGraphic.id)).toBe(
				firstEventGraphic.title,
			);
		});

		it('should fall back to the id for an unknown event graphic', () => {
			expect(getEventGraphicTitle('event-graphic/unknown')).toBe(
				'event-graphic/unknown',
			);
		});
	});

	describe('getEventGraphicById', () => {
		it('should return undefined for an unknown id', () => {
			expect(getEventGraphicById('event-graphic/unknown')).toBeUndefined();
		});
	});

	describe('isEventGraphicSlot', () => {
		it('should accept group 1 of a flexible/special container', () => {
			expect(isEventGraphicSlot(FLEXIBLE_SPECIAL_NAME, '1')).toBe(true);
		});

		it('should reject other groups of a flexible/special container', () => {
			expect(isEventGraphicSlot(FLEXIBLE_SPECIAL_NAME, '0')).toBe(false);
			expect(isEventGraphicSlot(FLEXIBLE_SPECIAL_NAME, null)).toBe(false);
		});

		it('should reject group 1 of other container types', () => {
			expect(isEventGraphicSlot('flexible/general', '1')).toBe(false);
			expect(isEventGraphicSlot(undefined, '1')).toBe(false);
		});
	});
});
