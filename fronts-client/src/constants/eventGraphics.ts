/**
 * Event graphics are live, self-updating graphics (e.g. an election tracker)
 * which editors can place onto a front. They aren't CAPI content: the id
 * prefix is the only thing identifying them, both to the rendering layer (see
 * `Trail.eventGraphicPrefix` in facia-scala-client) and to us, since `cardType`
 * isn't persisted. So it must never be stripped from the id we save.
 *
 * The list is hard-coded because there's no service to search against yet.
 */

export const EVENT_GRAPHIC_ID_PREFIX = 'event-graphic/';

export type EventGraphicKind = 'Election Tracker';

export interface EventGraphic {
	/** The full id, including the `event-graphic/` prefix. */
	id: string;
	title: string;
	kind: EventGraphicKind;
}

export const eventGraphics: EventGraphic[] = [
	{
		id: 'event-graphic/election-tracker/us-midterm-2026',
		title: 'US midterms 2026 — election tracker',
		kind: 'Election Tracker',
	},
];

export const isEventGraphicId = (id: string): boolean =>
	id.startsWith(EVENT_GRAPHIC_ID_PREFIX);

export const eventGraphicKind = (id: String): EventGraphicKind =>
	eventGraphics.find((eventGraphic) => eventGraphic.id === id)?.kind ??
	'Election Tracker';

export const getEventGraphicById = (id: string): EventGraphic | undefined =>
	eventGraphics.find((eventGraphic) => eventGraphic.id === id);

/** Falls back to the id, so cards for removed entries still render. */
export const getEventGraphicTitle = (id: string): string =>
	getEventGraphicById(id)?.title ?? id;
