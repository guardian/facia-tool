/**
 * Event graphics are live, self-updating graphics -- for example an election
 * results tracker or an olympics medal table -- which editors can place onto a
 * front.
 *
 * They are not content-api content. A card pointing at one is identified purely
 * by its id, which must start with `EVENT_GRAPHIC_ID_PREFIX`. This mirrors
 * `Trail.eventGraphicPrefix` in facia-scala-client, which is what the rendering
 * layer keys off. Because the prefix is the only marker that survives a round
 * trip to S3 (the card's `cardType` is not part of the stored trail), it must
 * not be stripped from the id we persist.
 *
 * The list below is deliberately hard-coded: there is no service to search
 * against yet, and we currently only need to support the US midterms.
 */

export const EVENT_GRAPHIC_ID_PREFIX = 'event-graphic/';

export interface EventGraphic {
	/** The full id, including the `event-graphic/` prefix. */
	id: string;
	/** Displayed in the feed and on the card. */
	title: string;
	description?: string;
}

export const eventGraphics: EventGraphic[] = [
	{
		id: 'event-graphic/election-tracker/us-midterm-2026',
		title: 'US midterms 2026 — election tracker',
		description: 'Live results tracker for the 2026 US midterm elections',
	},
];

export const isEventGraphicId = (id: string): boolean =>
	id.startsWith(EVENT_GRAPHIC_ID_PREFIX);

export const getEventGraphicById = (id: string): EventGraphic | undefined =>
	eventGraphics.find((eventGraphic) => eventGraphic.id === id);

/**
 * The title to show for a given event graphic id. Falls back to the id itself,
 * so that a card which was added before an entry was removed from the list
 * above still renders something meaningful.
 */
export const getEventGraphicTitle = (id: string): string =>
	getEventGraphicById(id)?.title ?? id;
