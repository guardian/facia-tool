import { CustomSubnav, CustomSubnavConfig } from './types';

export type RunAction = (
	id: string,
	action: (id: string) => Promise<CustomSubnavConfig>,
	confirmMessage?: string,
) => void;

export interface SubnavListEntry {
	id: string;
	/** The version shown/edited: the draft if present, otherwise the live copy. */
	subnav: CustomSubnav;
	hasLive: boolean;
	hasDraft: boolean;
}

/**
 * Build a de-duplicated list of subnavs for display. A subnav can exist in
 * `draft`, `live`, or both; each id appears once, preferring the draft copy.
 */
export const toListEntries = (
	config: CustomSubnavConfig,
): SubnavListEntry[] => {
	const liveById = new Map(config.live.map((s) => [s.id, s]));
	const draftById = new Map(config.draft.map((s) => [s.id, s]));
	const ids = [
		...config.draft.map((s) => s.id),
		...config.live.filter((s) => !draftById.has(s.id)).map((s) => s.id),
	];
	return ids.map((id) => {
		const draft = draftById.get(id);
		const live = liveById.get(id);
		return {
			id,
			subnav: (draft ?? live) as CustomSubnav,
			hasLive: live !== undefined,
			hasDraft: draft !== undefined,
		};
	});
};

// The version shown when editing: the draft if present, otherwise the live copy.
export const findSubnav = (
	config: CustomSubnavConfig,
	id: string,
): CustomSubnav | undefined =>
	config.draft.find((s) => s.id === id) ?? config.live.find((s) => s.id === id);
