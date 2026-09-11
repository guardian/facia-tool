import {
	EVENT_GRAPHIC_ID_PREFIX,
	eventGraphics,
	getEventGraphicById,
	getEventGraphicTitle,
	isEventGraphicId,
} from 'constants/eventGraphics';

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
});
